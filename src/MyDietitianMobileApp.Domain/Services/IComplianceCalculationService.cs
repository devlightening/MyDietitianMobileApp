using MyDietitianMobileApp.Domain.Entities;

namespace MyDietitianMobileApp.Domain.Services
{
    public interface IComplianceCalculationService
    {
        Task<decimal> CalculateDailyComplianceAsync(
            Guid clientId,
            Guid dietPlanId,
            DateOnly date);

        Task<decimal> CalculateMealComplianceAsync(
            Guid clientId,
            Guid mealId,
            DateOnly date);

        Task<ComplianceScoreConfig> GetScoreConfigAsync(Guid? dietitianId, Guid? dietPlanId);
    }
}

