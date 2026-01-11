using MediatR;

namespace MyDietitianMobileApp.Application.Commands;

public class LoginClientCommand : IRequest<LoginClientResult>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginClientResult
{
    public bool Success { get; set; }
    public string Token { get; set; } = string.Empty;
    public string PublicUserId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
