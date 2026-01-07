using MyDietitianMobileApp.Application.Commands;
using MyDietitianMobileApp.Domain.Services;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MyDietitianMobileApp.Application.Handlers
{
    public class MarkComplianceCommandHandler : IMarkComplianceHandler
    {
        private readonly AppDbContext _context;
        private readonly IComplianceCalculationService _calculationService;

        public MarkComplianceCommandHandler(
            AppDbContext context,
            IComplianceCalculationService calculationService)
        {
            _context = context;
            _calculationService = calculationService;
        }

        public async Task<MarkComplianceResult> HandleAsync(MarkComplianceCommand command)
        {
            // Get meal item and related entities
            var mealItem = await _context.MealItems
                .FirstOrDefaultAsync(mi => mi.Id == command.MealItemId);

            if (mealItem == null)
                throw new InvalidOperationException($"MealItem {command.MealItemId} not found.");

            var meal = await _context.DietPlanMeals
                .FirstOrDefaultAsync(m => m.Id == mealItem.MealId);

            if (meal == null)
                throw new InvalidOperationException($"Meal for MealItem {command.MealItemId} not found.");

            var dietDay = await _context.DietPlanDays
                .FirstOrDefaultAsync(d => d.Id == meal.DietPlanDayId);

            if (dietDay == null)
                throw new InvalidOperationException($"DietDay for Meal {meal.Id} not found.");

            var dietPlan = await _context.DietPlans
                .FirstOrDefaultAsync(p => p.Id == dietDay.DietPlanId);

            if (dietPlan == null)
                throw new InvalidOperationException($"DietPlan for DietDay {dietDay.Id} not found.");

            // Verify client owns this plan
            if (dietPlan.ClientId != command.ClientId)
                throw new UnauthorizedAccessException("Client does not have access to this diet plan.");

            // Get client's local date (considering timezone)
            var markedAt = DateTime.UtcNow;
            DateOnly clientDate = dietDay.Date;

            if (command.ClientTimezoneOffsetMinutes.HasValue)
            {
                var clientLocalTime = markedAt.AddMinutes(command.ClientTimezoneOffsetMinutes.Value);
                clientDate = DateOnly.FromDateTime(clientLocalTime);
            }

            // Check if compliance already exists (idempotent)
            var existingCompliance = await _context.MealItemCompliance
                .FirstOrDefaultAsync(c =>
                    c.ClientId == command.ClientId
                    && c.MealItemId == command.MealItemId
                    && c.DietDayId == dietDay.Id);

            MealItemCompliance compliance;

            if (existingCompliance != null)
            {
                // Update existing
                existingCompliance.UpdateStatus(command.Status, command.AlternativeIngredientId);
                compliance = existingCompliance;
            }
            else
            {
                // Create new
                compliance = new MealItemCompliance(
                    Guid.NewGuid(),
                    command.ClientId,
                    dietPlan.Id,
                    dietDay.Id,
                    meal.Id,
                    mealItem.Id,
                    mealItem.IngredientId,
                    command.Status,
                    markedAt,
                    command.AlternativeIngredientId,
                    command.ClientTimezoneOffsetMinutes
                );
                _context.MealItemCompliance.Add(compliance);
            }

            await _context.SaveChangesAsync();

            // Calculate daily compliance
            var dailyCompliance = await _calculationService.CalculateDailyComplianceAsync(
                command.ClientId,
                dietPlan.Id,
                clientDate);

            return new MarkComplianceResult(true, dailyCompliance, compliance.Id);
        }
    }
}

