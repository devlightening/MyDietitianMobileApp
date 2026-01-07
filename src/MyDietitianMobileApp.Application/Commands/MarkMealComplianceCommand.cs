using MediatR;
using MyDietitianMobileApp.Domain.Entities;

namespace MyDietitianMobileApp.Application.Commands;

public class MarkMealComplianceCommand : IRequest<MarkMealComplianceResult>
{
    public Guid MealId { get; set; }
    public ComplianceStatus Status { get; set; }
    public Guid? AlternativeRecipeId { get; set; }
}

public class MarkMealComplianceResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}
