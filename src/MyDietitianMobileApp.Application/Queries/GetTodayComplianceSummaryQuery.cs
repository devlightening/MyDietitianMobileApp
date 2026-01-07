using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Infrastructure.Persistence;

namespace MyDietitianMobileApp.Application.Queries;

public class GetTodayComplianceSummaryQuery : IRequest<TodayComplianceSummary>
{
    // ClientId extracted from JWT
}

public class TodayComplianceSummary
{
    public int TotalMeals { get; set; }
    public int Completed { get; set; }
    public int Alternative { get; set; }
    public int Skipped { get; set; }
    public int ComplianceScore { get; set; }
    public string MotivationalMessage { get; set; } = string.Empty;
}

public class GetTodayComplianceSummaryQueryHandler : IRequestHandler<GetTodayComplianceSummaryQuery, TodayComplianceSummary>
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetTodayComplianceSummaryQueryHandler(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<TodayComplianceSummary> Handle(GetTodayComplianceSummaryQuery request, CancellationToken cancellationToken)
    {
        var clientIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst("ClientId")?.Value;
        if (string.IsNullOrEmpty(clientIdClaim) || !Guid.TryParse(clientIdClaim, out var clientId))
        {
            throw new UnauthorizedAccessException("Client ID not found in token");
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Get today's meals from active plan
        var todayMeals = await _context.DietPlanDays
            .Include(d => d.DietPlan)
            .Where(d => d.Date == today)
            .Where(d => d.DietPlan.ClientId == clientId && d.DietPlan.Status == DietPlanStatus.Active)
            .SelectMany(d => d.Meals)
            .ToListAsync(cancellationToken);

        if (todayMeals.Count() == 0)
        {
            return new TodayComplianceSummary
            {
                TotalMeals = 0,
                ComplianceScore = 0,
                MotivationalMessage = "Bugün için plan yok"
            };
        }

        // Get compliance records for today
        var mealIds = todayMeals.Select(m => m.Id).ToList();
        var compliances = await _context.MealCompliances
            .Where(c => c.ClientId == clientId && c.Date == today && mealIds.Contains(c.DietPlanMealId))
            .ToListAsync(cancellationToken);

        var completed = compliances.Count(c => c.Status == ComplianceStatus.Done);
        var alternative = compliances.Count(c => c.Status == ComplianceStatus.Alternative);
        var skipped = compliances.Count(c => c.Status == ComplianceStatus.Skipped);

        var totalMeals = todayMeals.Count();
        var complianceScore = totalMeals > 0 
            ? (int)Math.Round(((double)(completed + alternative) / totalMeals) * 100)
            : 0;

        var message = GetMotivationalMessage(complianceScore);

        return new TodayComplianceSummary
        {
            TotalMeals = totalMeals,
            Completed = completed,
            Alternative = alternative,
            Skipped = skipped,
            ComplianceScore = complianceScore,
            MotivationalMessage = message
        };
    }

    private static string GetMotivationalMessage(int score)
    {
        return score switch
        {
            100 => "Mükemmel! Bugün planına tam uyum sağladın 🌟",
            >= 75 => "Harika gidiyorsun! Bugün planına büyük ölçüde uyum sağladın 👏",
            >= 50 => "İyi bir gün geçirdin. Yarın daha da iyisini yapabilirsin 💪",
            _ => "Sorun değil, her gün yeni bir başlangıç ✨"
        };
    }
}
