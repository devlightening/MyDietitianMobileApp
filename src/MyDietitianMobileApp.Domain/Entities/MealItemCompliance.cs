namespace MyDietitianMobileApp.Domain.Entities
{
    public enum ComplianceStatus
    {
        Done = 1,           // ✅ Yapıldı
        Skipped = 2,       // ❌ Atlanıldı
        Alternative = 3    // ⚠️ Alternatif kullanıldı
    }

    public class MealItemCompliance
    {
        public Guid Id { get; private set; }
        public Guid ClientId { get; private set; }
        public Guid DietPlanId { get; private set; }
        public Guid DietDayId { get; private set; }
        public Guid MealId { get; private set; }
        public Guid MealItemId { get; private set; }
        public Guid IngredientId { get; private set; }
        public ComplianceStatus Status { get; private set; }
        public Guid? AlternativeIngredientId { get; private set; }
        public DateTime MarkedAt { get; private set; }
        
        // Timezone support: Client's timezone offset in minutes
        // Example: +180 for UTC+3 (Turkey), -300 for UTC-5 (EST)
        public int? ClientTimezoneOffsetMinutes { get; private set; }

        public MealItemCompliance(
            Guid id,
            Guid clientId,
            Guid dietPlanId,
            Guid dietDayId,
            Guid mealId,
            Guid mealItemId,
            Guid ingredientId,
            ComplianceStatus status,
            DateTime markedAt,
            Guid? alternativeIngredientId = null,
            int? clientTimezoneOffsetMinutes = null)
        {
            if (status == ComplianceStatus.Alternative && alternativeIngredientId == null)
                throw new ArgumentException("AlternativeIngredientId must be provided when status is Alternative.");
            
            Id = id;
            ClientId = clientId;
            DietPlanId = dietPlanId;
            DietDayId = dietDayId;
            MealId = mealId;
            MealItemId = mealItemId;
            IngredientId = ingredientId;
            Status = status;
            AlternativeIngredientId = alternativeIngredientId;
            MarkedAt = markedAt;
            ClientTimezoneOffsetMinutes = clientTimezoneOffsetMinutes;
        }

        public void UpdateStatus(ComplianceStatus newStatus, Guid? alternativeIngredientId = null)
        {
            if (newStatus == ComplianceStatus.Alternative && alternativeIngredientId == null)
                throw new ArgumentException("AlternativeIngredientId must be provided when status is Alternative.");
            
            Status = newStatus;
            AlternativeIngredientId = alternativeIngredientId;
            MarkedAt = DateTime.UtcNow;
        }

        /// <summary>
        /// Gets the client's local date for this compliance entry.
        /// </summary>
        public DateOnly GetClientLocalDate()
        {
            if (ClientTimezoneOffsetMinutes.HasValue)
            {
                var clientLocalTime = MarkedAt.AddMinutes(ClientTimezoneOffsetMinutes.Value);
                return DateOnly.FromDateTime(clientLocalTime);
            }
            
            // Fallback to UTC date if timezone not provided
            return DateOnly.FromDateTime(MarkedAt);
        }

        public override bool Equals(object obj)
        {
            if (obj is not MealItemCompliance other) return false;
            return Id == other.Id;
        }

        public override int GetHashCode() => Id.GetHashCode();
    }
}

