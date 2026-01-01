using MyDietitianMobileApp.Domain.Entities;

namespace MyDietitianMobileApp.Application.Commands
{
    public class MarkComplianceCommand
    {
        public Guid ClientId { get; }
        public Guid MealItemId { get; }
        public ComplianceStatus Status { get; }
        public Guid? AlternativeIngredientId { get; }
        public int? ClientTimezoneOffsetMinutes { get; }

        public MarkComplianceCommand(
            Guid clientId,
            Guid mealItemId,
            ComplianceStatus status,
            Guid? alternativeIngredientId = null,
            int? clientTimezoneOffsetMinutes = null)
        {
            if (status == ComplianceStatus.Alternative && !alternativeIngredientId.HasValue)
                throw new ArgumentException("AlternativeIngredientId is required when status is Alternative.");

            ClientId = clientId;
            MealItemId = mealItemId;
            Status = status;
            AlternativeIngredientId = alternativeIngredientId;
            ClientTimezoneOffsetMinutes = clientTimezoneOffsetMinutes;
        }
    }

    public class MarkComplianceResult
    {
        public bool Success { get; }
        public decimal DailyCompliancePercentage { get; }
        public Guid ComplianceId { get; }

        public MarkComplianceResult(bool success, decimal dailyCompliancePercentage, Guid complianceId)
        {
            Success = success;
            DailyCompliancePercentage = dailyCompliancePercentage;
            ComplianceId = complianceId;
        }
    }

    public interface IMarkComplianceHandler
    {
        Task<MarkComplianceResult> HandleAsync(MarkComplianceCommand command);
    }
}

