using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyDietitianMobileApp.Application.Commands;
using MyDietitianMobileApp.Application.Handlers;
using MyDietitianMobileApp.Application.Queries;
using MyDietitianMobileApp.Infrastructure.Persistence;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Api.Utils;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --------------------
// Swagger
// --------------------
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "MyDietitianMobileApp.Api",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\nExample: \"Bearer {token}\""
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


// --------------------
// DbContexts (PostgreSQL)
// --------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<PasswordHasherService>();

// --------------------
// Repositories
// --------------------
builder.Services.AddScoped<IDietitianRepository, DietitianRepository>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<IRecipeRepository, RecipeRepository>();
builder.Services.AddScoped<IIngredientRepository, IngredientRepository>();

// --------------------
// Handlers
// --------------------
builder.Services.AddScoped<ICreateAccessKeyHandler, CreateAccessKeyCommandHandler>();
builder.Services.AddScoped<IActivateAccessKeyForClientHandler, ActivateAccessKeyForClientCommandHandler>();
builder.Services.AddScoped<ICreateRecipeHandler, CreateRecipeCommandHandler>();
builder.Services.AddScoped<IListRecipesByActiveDietitianHandler, ListRecipesByActiveDietitianQueryHandler>();

// --------------------
// JWT CONFIG (🔥 KRİTİK DÜZELTME)
// --------------------
var jwtSection = builder.Configuration.GetSection("Jwt");

var jwtSecret = jwtSection["Secret"];
var jwtIssuer = jwtSection["Issuer"];
var jwtAudience = jwtSection["Audience"];
var expiresMinutes = int.Parse(jwtSection["ExpiresMinutes"] ?? "60");

if (string.IsNullOrWhiteSpace(jwtSecret))
{
    throw new Exception("JWT Secret is missing. Check appsettings.Development.json");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSecret)
        )
    };
});

// --------------------
// Authorization Policies
// --------------------
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Dietitian", policy => policy.RequireRole("Dietitian"));
    options.AddPolicy("Client", policy => policy.RequireRole("Client"));
});

var app = builder.Build();

// --------------------
// Middleware
// --------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// --------------------
// API ENDPOINTS
// --------------------

// Access Keys
app.MapPost("/api/access-keys", (
    CreateAccessKeyCommand command,
    ICreateAccessKeyHandler handler) =>
{
    var result = handler.Handle(command);
    return Results.Ok(result);
}).RequireAuthorization("Dietitian");

app.MapPost("/api/access-keys/{id}/activate", (
    Guid id,
    ActivateAccessKeyForClientCommand command,
    IActivateAccessKeyForClientHandler handler) =>
{
    var cmd = new ActivateAccessKeyForClientCommand(command.ClientId, id);
    var result = handler.Handle(cmd);
    return Results.Ok(result);
}).RequireAuthorization("Client");

// Recipes
app.MapPost("/api/recipes", (
    CreateRecipeCommand command,
    ICreateRecipeHandler handler) =>
{
    var result = handler.Handle(command);
    return Results.Ok(result);
}).RequireAuthorization("Dietitian");

app.MapGet("/api/recipes", (
    Guid dietitianId,
    IListRecipesByActiveDietitianHandler handler) =>
{
    var query = new ListRecipesByActiveDietitianQuery(dietitianId);
    var result = handler.Handle(query);
    return Results.Ok(result);
}).RequireAuthorization();

// --------------------
// AUTH — DIETITIAN REGISTER
// --------------------
app.MapPost("/api/auth/dietitian/register", async (
    MyDietitianMobileApp.Api.Models.RegisterDietitianRequest request,
    AuthDbContext authDb,
    AppDbContext appDb,
    PasswordHasherService hasher) =>
{
    if (await authDb.UserAccounts.AnyAsync(u => u.Email == request.Email))
        return Results.BadRequest("Email already registered.");

    var dietitian = new Dietitian(Guid.NewGuid(), request.FullName, request.ClinicName, true);
    await appDb.Dietitians.AddAsync(dietitian);

    var user = new UserAccount
    {
        Id = Guid.NewGuid(),
        Email = request.Email,
        PasswordHash = hasher.HashPassword(null, request.Password),
        Role = "Dietitian",
        LinkedDietitianId = dietitian.Id
    };

    await authDb.UserAccounts.AddAsync(user);

    await appDb.SaveChangesAsync();
    await authDb.SaveChangesAsync();

    return Results.Ok();
});

// --------------------
// AUTH — DIETITIAN LOGIN
// --------------------
app.MapPost("/api/auth/dietitian/login", async (
    MyDietitianMobileApp.Api.Models.LoginDietitianRequest request,
    AuthDbContext authDb,
    PasswordHasherService hasher) =>
{
    var user = await authDb.UserAccounts
        .FirstOrDefaultAsync(u => u.Email == request.Email && u.Role == "Dietitian");

    if (user == null || !hasher.VerifyPassword(user, request.Password))
        return Results.Unauthorized();

    var token = JwtTokenGenerator.GenerateToken(
        user.Id.ToString(),
        "Dietitian",
        jwtSecret,
        jwtIssuer,
        jwtAudience,
        expiresMinutes
    );

    return Results.Ok(new { token });
});

// --------------------
// AUTH — CLIENT ACCESS KEY LOGIN
// --------------------
app.MapPost("/api/auth/client/access-key", async (
    MyDietitianMobileApp.Api.Models.LoginClientWithAccessKeyRequest request,
    AppDbContext appDb,
    AuthDbContext authDb) =>
{
    var accessKey = await appDb.AccessKeys
        .FirstOrDefaultAsync(a => a.Key == request.AccessKey && a.IsActive);

    if (accessKey == null ||
        DateTime.UtcNow < accessKey.StartDate ||
        DateTime.UtcNow > accessKey.EndDate)
        return Results.Unauthorized();

    var client = await appDb.Clients
        .FirstOrDefaultAsync(c => c.Id == accessKey.ClientId && c.IsActive);

    if (client == null)
        return Results.Unauthorized();

    client.SetActiveDietitian(
        accessKey.DietitianId,
        accessKey.StartDate,
        accessKey.EndDate);

    await appDb.SaveChangesAsync();

    var user = await authDb.UserAccounts
        .FirstOrDefaultAsync(u => u.LinkedClientId == client.Id && u.Role == "Client");

    if (user == null)
    {
        user = new UserAccount
        {
            Id = Guid.NewGuid(),
            Role = "Client",
            LinkedClientId = client.Id,
            ActiveDietitianContextId = accessKey.DietitianId
        };
        await authDb.UserAccounts.AddAsync(user);
    }
    else
    {
        user.ActiveDietitianContextId = accessKey.DietitianId;
    }

    await authDb.SaveChangesAsync();

    var token = JwtTokenGenerator.GenerateToken(
        user.Id.ToString(),
        "Client",
        jwtSecret,
        jwtIssuer,
        jwtAudience,
        expiresMinutes,
        new Dictionary<string, string>
        {
            { "ActiveDietitianId", accessKey.DietitianId.ToString() }
        }
    );

    return Results.Ok(new { token });
});

app.Run();
