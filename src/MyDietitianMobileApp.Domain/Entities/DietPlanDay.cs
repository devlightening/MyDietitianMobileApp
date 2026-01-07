namespace MyDietitianMobileApp.Domain.Entities
{
    public class DietPlanDay
    {
        public Guid Id { get; private set; }
        public Guid DietPlanId { get; private set; }
        public DateOnly Date { get; private set; }
        public int? DailyTargetCalories { get; private set; }
        public IReadOnlyCollection<DietPlanMeal> Meals => _meals.AsReadOnly();

        // Navigation property for EF Core
        public DietPlan DietPlan { get; private set; } = null!;

        private readonly List<DietPlanMeal> _meals = new();

        public DietPlanDay(Guid id, Guid dietPlanId, DateOnly date, int? dailyTargetCalories = null)
        {
            Id = id;
            DietPlanId = dietPlanId;
            Date = date;
            DailyTargetCalories = dailyTargetCalories;
        }

        public void AddMeal(DietPlanMeal meal)
        {
            if (meal.DietPlanDayId != Id)
                throw new InvalidOperationException("Meal must belong to this diet plan day.");
            
            _meals.Add(meal);
        }

        public override bool Equals(object obj)
        {
            if (obj is not DietPlanDay other) return false;
            return Id == other.Id;
        }

        public override int GetHashCode() => Id.GetHashCode();
    }
}

