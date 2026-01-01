using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using MyDietitianMobileApp.Domain.Exceptions;

namespace MyDietitianMobileApp.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        // Determine status code and error code based on exception type
        var (statusCode, errorCode, message) = exception switch
        {
            DomainException de => (
                HttpStatusCode.BadRequest,
                de.Code,
                de.Message
            ),
            UnauthorizedAccessException => (
                HttpStatusCode.Unauthorized,
                "UNAUTHORIZED",
                "Unauthorized access"
            ),
            InvalidOperationException => (
                HttpStatusCode.BadRequest,
                "INVALID_OPERATION",
                exception.Message
            ),
            ArgumentException => (
                HttpStatusCode.BadRequest,
                "INVALID_ARGUMENT",
                exception.Message
            ),
            KeyNotFoundException => (
                HttpStatusCode.NotFound,
                "NOT_FOUND",
                exception.Message
            ),
            _ => (
                HttpStatusCode.InternalServerError,
                "INTERNAL_SERVER_ERROR",
                "An unexpected error occurred"
            )
        };

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            error = errorCode,
            message = message,
            // Only include stack trace in development
            stackTrace = _env.IsDevelopment() ? exception.StackTrace : null
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        return context.Response.WriteAsync(json);
    }
}
