using MyDietitianMobileApp.Domain.Entities;

namespace MyDietitianMobileApp.Api.Models
{
    public class MarkComplianceRequest
    {
        public Guid MealItemId { get; set; }
        public string Status { get; set; } = string.Empty; // "Done", "Skipped", "Alternative"
        public Guid? AlternativeIngredientId { get; set; }
        public int? ClientTimezoneOffsetMinutes { get; set; }
    }

    public class MarkComplianceResponse
    {
        public bool Success { get; set; }
        public decimal DailyCompliancePercentage { get; set; }
        public Guid ComplianceId { get; set; }
    }
}

