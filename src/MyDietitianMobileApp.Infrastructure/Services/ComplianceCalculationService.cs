using MyDietitianMobileApp.Domain.Services;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MyDietitianMobileApp.Infrastructure.Services
{
    public class ComplianceCalculationService : IComplianceCalculationService
    {
        private readonly AppDbContext _context;

        public ComplianceCalculationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<decimal> CalculateDailyComplianceAsync(
            Guid clientId,
            Guid dietPlanId,
            DateOnly date)
        {
            // Get all meals for this day
            var dietDay = await _context.DietPlanDays
                .FirstOrDefaultAsync(d => d.DietPlanId == dietPlanId && d.Date == date);

            if (dietDay == null)
                return 0m;

            var meals = await _context.DietPlanMeals
                .Where(m => m.DietPlanDayId == dietDay.Id)
                .ToListAsync();

            if (!meals.Any())
                return 0m;

            // Calculate compliance for each meal and average
            var mealCompliances = new List<decimal>();
            foreach (var meal in meals)
            {
                var mealCompliance = await CalculateMealComplianceAsync(clientId, meal.Id, date);
                mealCompliances.Add(mealCompliance);
            }

            return mealCompliances.Any() ? mealCompliances.Average() : 0m;
        }

        public async Task<decimal> CalculateMealComplianceAsync(
            Guid clientId,
            Guid mealId,
            DateOnly date)
        {
            // Get meal items
            var mealItems = await _context.MealItems
                .Where(mi => mi.MealId == mealId)
                .ToListAsync();

            if (!mealItems.Any())
                return 0m;

            // Get meal and diet day
            var meal = await _context.DietPlanMeals
                .FirstOrDefaultAsync(m => m.Id == mealId);

            if (meal == null)
                return 0m;

            var dietDay = await _context.DietPlanDays.FirstOrDefaultAsync(d => d.Id == meal.DietPlanDayId);
            if (dietDay == null)
                return 0m;

            // Get compliance records for this day
            var complianceRecords = await _context.MealItemCompliance
                .Where(c => c.ClientId == clientId 
                    && c.DietDayId == dietDay.Id
                    && mealItems.Select(mi => mi.Id).Contains(c.MealItemId))
                .ToListAsync();

            // Get score config
            var dietPlan = await _context.DietPlans.FirstOrDefaultAsync(p => p.Id == dietDay.DietPlanId);
            var scoreConfig = await GetScoreConfigAsync(dietPlan?.DietitianId, dietPlan?.Id);

            // Calculate score
            int totalScore = 0;
            int maxScore = 0;

            foreach (var mealItem in mealItems)
            {
                var compliance = complianceRecords.FirstOrDefault(c => c.MealItemId == mealItem.Id);
                
                int itemScore = 0;
                int itemMaxScore = mealItem.IsMandatory 
                    ? scoreConfig.MandatoryDone 
                    : scoreConfig.OptionalDone;

                if (compliance != null)
                {
                    if (mealItem.IsMandatory)
                    {
                        itemScore = compliance.Status switch
                        {
                            ComplianceStatus.Done => scoreConfig.MandatoryDone,
                            ComplianceStatus.Alternative => scoreConfig.MandatoryAlternative,
                            ComplianceStatus.Skipped => scoreConfig.MandatorySkipped,
                            _ => 0
                        };
                    }
                    else
                    {
                        itemScore = compliance.Status switch
                        {
                            ComplianceStatus.Done => scoreConfig.OptionalDone,
                            ComplianceStatus.Skipped => scoreConfig.OptionalSkipped,
                            _ => 0
                        };
                    }
                }
                else
                {
                    // Not marked yet - counts as 0
                    itemScore = 0;
                }

                totalScore += itemScore;
                maxScore += itemMaxScore;
            }

            if (maxScore == 0)
                return 0m;

            return (decimal)totalScore / maxScore * 100;
        }

        public async Task<ComplianceScoreConfig> GetScoreConfigAsync(Guid? dietitianId, Guid? dietPlanId)
        {
            // Try to get plan-specific config
            if (dietPlanId.HasValue)
            {
                var planConfig = await _context.ComplianceScoreConfigs
                    .FirstOrDefaultAsync(c => c.DietPlanId == dietPlanId.Value);
                if (planConfig != null)
                    return planConfig;
            }

            // Try to get dietitian-specific config
            if (dietitianId.HasValue)
            {
                var dietitianConfig = await _context.ComplianceScoreConfigs
                    .FirstOrDefaultAsync(c => c.DietitianId == dietitianId.Value && c.DietPlanId == null);
                if (dietitianConfig != null)
                    return dietitianConfig;
            }

            // Fallback to default
            var defaultConfig = await _context.ComplianceScoreConfigs
                .FirstOrDefaultAsync(c => c.DietitianId == null && c.DietPlanId == null);

            if (defaultConfig != null)
                return defaultConfig;

            // Create and return default config if none exists
            var newDefaultConfig = new ComplianceScoreConfig(
                Guid.NewGuid(),
                mandatoryDone: 10,
                mandatoryAlternative: 7,
                mandatorySkipped: 0,
                optionalDone: 3,
                optionalSkipped: 0
            );
            _context.ComplianceScoreConfigs.Add(newDefaultConfig);
            await _context.SaveChangesAsync();
            return newDefaultConfig;
        }
    }
}

