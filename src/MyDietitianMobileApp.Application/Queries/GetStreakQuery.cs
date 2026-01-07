using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Infrastructure.Persistence;

namespace MyDietitianMobileApp.Application.Queries;

public class GetStreakQuery : IRequest<StreakInfo>
{
    // ClientId extracted from JWT
}

public class StreakInfo
{
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public string StreakMessage { get; set; } = string.Empty;
}

public class GetStreakQueryHandler : IRequestHandler<GetStreakQuery, StreakInfo>
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetStreakQueryHandler(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<StreakInfo> Handle(GetStreakQuery request, CancellationToken cancellationToken)
    {
        var clientIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst("ClientId")?.Value;
        if (string.IsNullOrEmpty(clientIdClaim) || !Guid.TryParse(clientIdClaim, out var clientId))
        {
            throw new UnauthorizedAccessException("Client ID not found in token");
        }

        // Get compliance data for last 90 days
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-90));
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var dailyScores = await CalculateDailyScores(clientId, startDate, today, cancellationToken);

        var currentStreak = CalculateCurrentStreak(dailyScores, today);
        var longestStreak = CalculateLongestStreak(dailyScores);

        return new StreakInfo
        {
            CurrentStreak = currentStreak,
            LongestStreak = longestStreak,
            StreakMessage = GetStreakMessage(currentStreak)
        };
    }

    private async Task<Dictionary<DateOnly, int>> CalculateDailyScores(
        Guid clientId, 
        DateOnly startDate, 
        DateOnly endDate, 
        CancellationToken cancellationToken)
    {
        // Get all plan days and compliances in range
        var planDays = await _context.DietPlanDays
            .Where(d => d.Date >= startDate && d.Date <= endDate)
            .Where(d => d.DietPlan.ClientId == clientId && d.DietPlan.Status == DietPlanStatus.Active)
            .Include(d => d.Meals)
            .ToListAsync(cancellationToken);

        var compliances = await _context.MealCompliances
            .Where(c => c.ClientId == clientId && c.Date >= startDate && c.Date <= endDate)
            .ToListAsync(cancellationToken);

        var scores = new Dictionary<DateOnly, int>();

        foreach (var day in planDays)
        {
            var dayCompliances = compliances.Where(c => c.Date == day.Date).ToList();
            var totalMeals = day.Meals.Count;

            if (totalMeals > 0)
            {
                var completed = dayCompliances.Count(c => c.Status == ComplianceStatus.Done || c.Status == ComplianceStatus.Alternative);
                var score = (int)Math.Round(((double)completed / totalMeals) * 100);
                scores[day.Date] = score;
            }
        }

        return scores;
    }

    private static int CalculateCurrentStreak(Dictionary<DateOnly, int> dailyScores, DateOnly today)
    {
        var streak = 0;
        var date = today;

        while (dailyScores.ContainsKey(date) && dailyScores[date] >= 75)
        {
            streak++;
            date = date.AddDays(-1);
        }

        return streak;
    }

    private static int CalculateLongestStreak(Dictionary<DateOnly, int> dailyScores)
    {
        if (dailyScores.Count == 0) return 0;

        var longest = 0;
        var current = 0;
        var sortedDates = dailyScores.Keys.OrderBy(d => d).ToList();

        for (int i = 0; i < sortedDates.Count; i++)
        {
            if (dailyScores[sortedDates[i]] >= 75)
            {
                current++;
                longest = Math.Max(longest, current);
            }
            else
            {
                current = 0;
            }
        }

        return longest;
    }

    private static string GetStreakMessage(int streak)
    {
        return streak switch
        {
            0 => "Bugün yeni bir başlangıç yapabilirsin 🌱",
            1 => "İyi bir başlangıç yaptın 🌱",
            >= 14 => "İnanılmaz bir alışkanlık oluşturdun 🏆",
            >= 7 => "Bir haftadır harika gidiyorsun! 🎉",
            >= 3 => $"{streak} gündür planına sadıksın 🔥",
            _ => $"{streak} gündür devam ediyorsun 💪"
        };
    }
}
