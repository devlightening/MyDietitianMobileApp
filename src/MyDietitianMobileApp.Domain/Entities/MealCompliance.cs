namespace MyDietitianMobileApp.Domain.Entities
{
    public class MealCompliance
    {
        public Guid Id { get; private set; }
        public Guid ClientId { get; private set; }
        public Guid DietPlanMealId { get; private set; }
        public ComplianceStatus Status { get; private set; }
        public Guid? AlternativeRecipeId { get; private set; }
        public DateTime MarkedAt { get; private set; }
        public DateOnly Date { get; private set; }

        // Navigation properties
        public Client Client { get; private set; } = null!;
        public DietPlanMeal DietPlanMeal { get; private set; } = null!;

        // Constructor for EF Core
        private MealCompliance() { }

        public MealCompliance(
            Guid id,
            Guid clientId,
            Guid dietPlanMealId,
            ComplianceStatus status,
            Guid? alternativeRecipeId,
            DateTime markedAt,
            DateOnly date)
        {
            Id = id;
            ClientId = clientId;
            DietPlanMealId = dietPlanMealId;
            Status = status;
            AlternativeRecipeId = alternativeRecipeId;
            MarkedAt = markedAt;
            Date = date;

            ValidateCompliance();
        }

        public void UpdateStatus(ComplianceStatus status, Guid? alternativeRecipeId)
        {
            Status = status;
            AlternativeRecipeId = alternativeRecipeId;
            MarkedAt = DateTime.UtcNow;

            ValidateCompliance();
        }

        private void ValidateCompliance()
        {
            // Alternative status should have alternativeRecipeId
            if (Status == ComplianceStatus.Alternative && !AlternativeRecipeId.HasValue)
            {
                throw new InvalidOperationException("Alternative status requires an alternative recipe ID");
            }
        }
    }
}
