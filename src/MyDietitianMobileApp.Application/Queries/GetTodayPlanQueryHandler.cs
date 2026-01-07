using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Infrastructure.Persistence;

namespace MyDietitianMobileApp.Application.Queries;

public class GetTodayPlanQueryHandler : IRequestHandler<GetTodayPlanQuery, GetTodayPlanResult>
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetTodayPlanQueryHandler(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<GetTodayPlanResult> Handle(GetTodayPlanQuery request, CancellationToken cancellationToken)
    {
        // Extract ClientId from JWT claims
        var clientIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst("ClientId")?.Value;
        if (string.IsNullOrEmpty(clientIdClaim) || !Guid.TryParse(clientIdClaim, out var clientId))
        {
            throw new UnauthorizedAccessException("Client ID not found in token");
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Get active diet plan for this client
        var plan = await _context.DietPlans
            .Where(p => p.ClientId == clientId && p.Status == DietPlanStatus.Active)
            .Include(p => p.Days.Where(d => d.Date == today))
                .ThenInclude(d => d.Meals)
            .FirstOrDefaultAsync(cancellationToken);

        if (plan == null)
        {
            // No active plan
            return new GetTodayPlanResult
            {
                Date = today,
                Meals = new List<TodayMealDto>()
            };
        }

        var todayDay = plan.Days.FirstOrDefault();

        if (todayDay == null)
        {
            // Plan exists but no meals for today
            return new GetTodayPlanResult
            {
                Date = today,
                Meals = new List<TodayMealDto>()
            };
        }

        // Get recipe names for planned meals
        var recipeIds = todayDay.Meals
            .Where(m => m.PlannedRecipeId.HasValue)
            .Select(m => m.PlannedRecipeId!.Value)
            .ToList();

        var recipes = await _context.Recipes
            .Where(r => recipeIds.Contains(r.Id))
            .Select(r => new { r.Id, r.Name })
            .ToListAsync(cancellationToken);

        var recipeDict = recipes.ToDictionary(r => r.Id, r => r.Name);

        // Map to DTOs
        var meals = todayDay.Meals.Select(m => new TodayMealDto
        {
            Id = m.Id,
            Type = m.Type,
            PlannedRecipeName = m.PlannedRecipeId.HasValue && recipeDict.ContainsKey(m.PlannedRecipeId.Value)
                ? recipeDict[m.PlannedRecipeId.Value]
                : null,
            CustomName = m.CustomName,
            IsMandatory = m.IsMandatory
        }).ToList();

        return new GetTodayPlanResult
        {
            Date = today,
            DailyTargetCalories = todayDay.DailyTargetCalories,
            Meals = meals
        };
    }
}
