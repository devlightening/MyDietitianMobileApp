using MediatR;

namespace MyDietitianMobileApp.Application.Commands;

public class ActivatePremiumCommand : IRequest<ActivatePremiumResult>
{
    public string AccessKey { get; set; } = string.Empty;
}

public class ActivatePremiumResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid? DietitianId { get; set; }
    public string DietitianName { get; set; } = string.Empty;
    public DateTime? ProgramStartDate { get; set; }
    public DateTime? ProgramEndDate { get; set; }
}
