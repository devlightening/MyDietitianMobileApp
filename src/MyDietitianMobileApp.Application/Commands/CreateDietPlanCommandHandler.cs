using MediatR;
using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Application.Commands;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Infrastructure.Persistence;

namespace MyDietitianMobileApp.Application.Handlers
{
    public class CreateDietPlanCommandHandler : IRequestHandler<CreateDietPlanCommand, CreateDietPlanResult>
    {
        private readonly AppDbContext _context;

        public CreateDietPlanCommandHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CreateDietPlanResult> Handle(CreateDietPlanCommand request, CancellationToken cancellationToken)
        {
            // Validate client exists and belongs to dietitian
            var client = await _context.Clients
                .FirstOrDefaultAsync(c => c.Id == request.ClientId && c.ActiveDietitianId == request.DietitianId, cancellationToken);

            if (client == null)
                return new CreateDietPlanResult(Guid.Empty, false, "Client not found or does not belong to this dietitian.");

            // Check for existing active diet plan and expire it
            var existingActivePlans = await _context.DietPlans
                .Where(p => p.ClientId == request.ClientId 
                    && p.DietitianId == request.DietitianId 
                    && p.Status == DietPlanStatus.Active)
                .ToListAsync(cancellationToken);

            foreach (var plan in existingActivePlans)
            {
                plan.Expire();
            }

            // Create new diet plan
            var dietPlan = new DietPlan(
                Guid.NewGuid(),
                request.DietitianId,
                request.ClientId,
                request.Name,
                request.StartDate,
                request.EndDate,
                DietPlanStatus.Draft); // Start as draft

            // Add days and meals
            foreach (var dayDto in request.Days)
            {
                var dietPlanDay = new DietPlanDay(
                    Guid.NewGuid(),
                    dietPlan.Id,
                    dayDto.Date,
                    dayDto.DailyTargetCalories);

                // Add meals for this day
                foreach (var mealDto in dayDto.Meals)
                {
                    var dietPlanMeal = new DietPlanMeal(
                        Guid.NewGuid(),
                        dietPlanDay.Id,
                        mealDto.Type,
                        mealDto.PlannedRecipeId,
                        mealDto.CustomName,
                        mealDto.IsMandatory);

                    dietPlanDay.AddMeal(dietPlanMeal);
                }

                dietPlan.AddDay(dietPlanDay);
            }

            // Activate the plan
            dietPlan.Activate();

            _context.DietPlans.Add(dietPlan);
            await _context.SaveChangesAsync(cancellationToken);

            return new CreateDietPlanResult(dietPlan.Id, true);
        }
    }
}
