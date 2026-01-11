using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MyDietitianMobileApp.Domain.Interfaces;
using MyDietitianMobileApp.Infrastructure.Persistence;
using MyDietitianMobileApp.Infrastructure.Repositories;
using System.Security.Claims;
using System.Text;
using MediatR;
using MyDietitianMobileApp.Application.Handlers;
using MyDietitianMobileApp.Domain.Services;
using MyDietitianMobileApp.Infrastructure.Services;
using MyDietitianMobileApp.Domain.Repositories;
using MyDietitianMobileApp.Application.Commands;
using MyDietitianMobileApp.Application.Queries;

var builder = WebApplication.CreateBuilder(args);

// ====================
// NETWORK CONFIGURATION
// ====================
builder.WebHost.UseUrls("http://0.0.0.0:5000", "https://0.0.0.0:7154");

// ====================
// CONTROLLERS & API
// ====================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ====================
// SWAGGER
// ====================
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "MyDietitian API",
        Version = "v1",
        Description = "Professional Dietitian-Client Management Platform"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme (Example: 'Bearer 12345abcdef')",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ====================
// DATABASE CONTEXTS
// ====================
var appDbConnection = builder.Configuration.GetConnectionString("AppDb") 
    ?? throw new InvalidOperationException("AppDb connection string missing");
var authDbConnection = builder.Configuration.GetConnectionString("AuthDb") 
    ?? throw new InvalidOperationException("AuthDb connection string missing");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(appDbConnection, npgsqlOptions => npgsqlOptions.CommandTimeout(30))
        .EnableSensitiveDataLogging(builder.Environment.IsDevelopment()));

builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseNpgsql(authDbConnection, npgsqlOptions => npgsqlOptions.CommandTimeout(30))
        .EnableSensitiveDataLogging(builder.Environment.IsDevelopment()));

// ====================
// MEDIATR (CQRS)
// ====================
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(RegisterClientCommandHandler).Assembly));

// ====================
// DOMAIN SERVICES
// ====================
builder.Services.AddScoped<PasswordHasherService>();
builder.Services.AddScoped<IHealthCalculationService, HealthCalculationService>();
builder.Services.AddScoped<IComplianceCalculationService, ComplianceCalculationService>();
builder.Services.AddScoped<IAlternativeMealDecisionService, AlternativeMealDecisionService>();

// ====================
// REPOSITORIES
// ====================
builder.Services.AddScoped<IIngredientRepository, IngredientRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRecipeRepository, RecipeRepository>();
builder.Services.AddScoped<IDietitianRepository, DietitianRepository>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();

// ====================
// ASP.NET CORE SERVICES
// ====================
builder.Services.AddHttpContextAccessor();

// ====================
// JWT AUTHENTICATION
// ====================
var jwtSecret = builder.Configuration["Jwt:SecretKey"] ?? throw new InvalidOperationException("JWT Secret missing");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "MyDietitian.Api";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "MyDietitian.Mobile";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        RoleClaimType = "role"
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            context.Token = context.Request.Cookies["access_token"];
            return Task.CompletedTask;
        }
    };
});

//====================
// AUTHORIZATION POLICIES
// ====================
builder.Services.AddAuthorization();
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireClientRole", policy => policy.RequireRole("Client"));
    options.AddPolicy("RequireDietitianRole", policy => policy.RequireRole("Dietitian"));
    
    options.AddPolicy("Client", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireClaim("role", "Client");
    });
    
    options.AddPolicy("Dietitian", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireClaim("role", "Dietitian");
    });
    
    options.AddPolicy("Admin", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireClaim(ClaimTypes.Role, "Admin");
    });
});

// ====================
// CORS
// ====================
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

var app = builder.Build();

// ====================
// DATABASE VERIFICATION
// ====================
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        var appDb = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await appDb.Database.CanConnectAsync();
        logger.LogInformation("✓ Successfully connected to PostgreSQL database (AppDbContext)");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "✗ Failed to connect to AppDbContext");
    }

    try
    {
        var authDb = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
        await authDb.Database.CanConnectAsync();
        logger.LogInformation("✓ Successfully connected to PostgreSQL database (AuthDbContext)");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "✗ Failed to connect to AuthDbContext");
    }
}

// ====================
// MIDDLEWARE PIPELINE
// ====================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
