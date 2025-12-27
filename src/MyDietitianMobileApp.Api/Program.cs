using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyDietitianMobileApp.Application.Commands;
using MyDietitianMobileApp.Application.Handlers;
using MyDietitianMobileApp.Application.Queries;
using MyDietitianMobileApp.Infrastructure.Persistence;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DbContext (PostgreSQL)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
// Add AuthDbContext
builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<PasswordHasherService>();

// Register repositories
builder.Services.AddScoped<IDietitianRepository, DietitianRepository>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<IRecipeRepository, RecipeRepository>();
builder.Services.AddScoped<IIngredientRepository, IngredientRepository>();

// Register handlers
builder.Services.AddScoped<ICreateAccessKeyHandler, CreateAccessKeyCommandHandler>();
builder.Services.AddScoped<IActivateAccessKeyForClientHandler, ActivateAccessKeyForClientCommandHandler>();
builder.Services.AddScoped<ICreateRecipeHandler, CreateRecipeCommandHandler>();
builder.Services.AddScoped<IListRecipesByActiveDietitianHandler, ListRecipesByActiveDietitianQueryHandler>();

// JWT Authentication
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
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Dietitian", policy => policy.RequireRole("Dietitian"));
    options.AddPolicy("Client", policy => policy.RequireRole("Client"));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

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
    // command.AccessKeyId is set from route
    var cmd = new ActivateAccessKeyForClientCommand(command.ClientId, id);
    var result = handler.Handle(cmd);
    return Results.Ok(result);
}).RequireAuthorization("Client");

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

// Dietitian Register
app.MapPost("/api/auth/dietitian/register", async (
    MyDietitianMobileApp.Api.Models.RegisterDietitianRequest request,
    AuthDbContext authDb,
    AppDbContext appDb,
    PasswordHasherService hasher,
    IConfiguration config) =>
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

// Dietitian Login
app.MapPost("/api/auth/dietitian/login", async (
    MyDietitianMobileApp.Api.Models.LoginDietitianRequest request,
    AuthDbContext authDb,
    IConfiguration config,
    PasswordHasherService hasher) =>
{
    var user = await authDb.UserAccounts.FirstOrDefaultAsync(u => u.Email == request.Email && u.Role == "Dietitian");
    if (user == null || !hasher.VerifyPassword(user, request.Password))
        return Results.Unauthorized();
    var token = JwtTokenGenerator.GenerateToken(
        user.Id.ToString(),
        "Dietitian",
        config["Jwt:Issuer"],
        config["Jwt:Audience"],
        config["Jwt:Key"]);
    return Results.Ok(new { token });
});

// Client AccessKey Login/Activation
app.MapPost("/api/auth/client/access-key", async (
    MyDietitianMobileApp.Api.Models.LoginClientWithAccessKeyRequest request,
    AppDbContext appDb,
    AuthDbContext authDb,
    IConfiguration config) =>
{
    var accessKey = await appDb.AccessKeys.FirstOrDefaultAsync(a => a.Key == request.AccessKey && a.IsActive);
    if (accessKey == null || DateTime.UtcNow < accessKey.StartDate || DateTime.UtcNow > accessKey.EndDate)
        return Results.Unauthorized();
    var client = await appDb.Clients.FirstOrDefaultAsync(c => c.Id == accessKey.ClientId && c.IsActive);
    if (client == null)
        return Results.Unauthorized();
    // Activate client context
    client.SetActiveDietitian(accessKey.DietitianId, accessKey.StartDate, accessKey.EndDate);
    await appDb.SaveChangesAsync();
    // Create or update user account for client
    var user = await authDb.UserAccounts.FirstOrDefaultAsync(u => u.LinkedClientId == client.Id && u.Role == "Client");
    if (user == null)
    {
        user = new UserAccount
        {
            Id = Guid.NewGuid(),
            Email = null,
            PasswordHash = null,
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
        config["Jwt:Issuer"],
        config["Jwt:Audience"],
        config["Jwt:Key"],
        new Dictionary<string, string> { { "ActiveDietitianId", accessKey.DietitianId.ToString() } });
    return Results.Ok(new { token });
});

app.Run();

