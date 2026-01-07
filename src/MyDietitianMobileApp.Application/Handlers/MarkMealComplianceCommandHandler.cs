using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Application.Commands;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Infrastructure.Persistence;

namespace MyDietitianMobileApp.Application.Handlers;

public class MarkMealComplianceCommandHandler : IRequestHandler<MarkMealComplianceCommand, MarkMealComplianceResult>
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public MarkMealComplianceCommandHandler(AppDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<MarkMealComplianceResult> Handle(MarkMealComplianceCommand request, CancellationToken cancellationToken)
    {
        var clientIdClaim = _httpContextAccessor.HttpContext?.User.FindFirst("ClientId")?.Value;
        if (string.IsNullOrEmpty(clientIdClaim) || !Guid.TryParse(clientIdClaim, out var clientId))
        {
            return new MarkMealComplianceResult
            {
                Success = false,
                Message = "Yetkilendirme hatası"
            };
        }

        // Validate meal belongs to client's active plan
        var meal = await _context.DietPlanMeals
            .Include(m => m.DietPlanDay)
                .ThenInclude(d => d.DietPlan)
            .FirstOrDefaultAsync(m => m.Id == request.MealId, cancellationToken);

        if (meal == null || meal.DietPlanDay.DietPlan.ClientId != clientId)
        {
            return new MarkMealComplianceResult
            {
                Success = false,
                Message = "Öğün bulunamadı veya yetkisiz erişim"
            };
        }

        // Validate meal is for today
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (meal.DietPlanDay.Date != today)
        {
            return new MarkMealComplianceResult
            {
                Success = false,
                Message = "Bu öğün bugünkü plan için değil"
            };
        }

        // Check for existing compliance (idempotent update)
        var existingCompliance = await _context.MealCompliances
            .FirstOrDefaultAsync(c =>
                c.ClientId == clientId &&
                c.DietPlanMealId == request.MealId &&
                c.Date == today,
                cancellationToken);

        if (existingCompliance != null)
        {
            // Update existing
            existingCompliance.UpdateStatus(request.Status, request.AlternativeRecipeId);
        }
        else
        {
            // Create new
            var compliance = new MealCompliance(
                Guid.NewGuid(),
                clientId,
                request.MealId,
                request.Status,
                request.AlternativeRecipeId,
                DateTime.UtcNow,
                today
            );

            _context.MealCompliances.Add(compliance);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Return encouraging message based on status
        var message = GetEncouragingMessage(request.Status);

        return new MarkMealComplianceResult
        {
            Success = true,
            Message = message
        };
    }

    private static string GetEncouragingMessage(ComplianceStatus status)
    {
        return status switch
        {
            ComplianceStatus.Done => "Harika, bu öğünü tamamladın 👏",
            ComplianceStatus.Alternative => "Alternatif seçmen gayet normal",
            ComplianceStatus.Skipped => "Sorun değil, yarın devam edebilirsin",
            _ => "Kaydedildi"
        };
    }
}
