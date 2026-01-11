using MediatR;

namespace MyDietitianMobileApp.Application.Commands;

public class BindClientToDietitianCommand : IRequest<BindClientToDietitianResult>
{
    public Guid DietitianId { get; set; }
    public Guid ClientId { get; set; }
    public string PublicUserId { get; set; } = string.Empty;
}

public class BindClientToDietitianResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid? LinkId { get; set; }
    public bool DeactivatedPreviousLink { get; set; }
}
