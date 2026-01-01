namespace MyDietitianMobileApp.Domain.Entities
{
    public class DietDay
    {
        public Guid Id { get; private set; }
        public Guid DietPlanId { get; private set; }
        public DateOnly Date { get; private set; }
        public IReadOnlyCollection<Meal> Meals => _meals.AsReadOnly();

        private readonly List<Meal> _meals = new();

        public DietDay(Guid id, Guid dietPlanId, DateOnly date)
        {
            Id = id;
            DietPlanId = dietPlanId;
            Date = date;
        }

        public void AddMeal(Meal meal)
        {
            if (meal.DietDayId != Id)
                throw new InvalidOperationException("Meal must belong to this diet day.");
            
            // Allow multiple meals of same type (e.g., multiple snacks)
            _meals.Add(meal);
        }

        public override bool Equals(object obj)
        {
            if (obj is not DietDay other) return false;
            return Id == other.Id;
        }

        public override int GetHashCode() => Id.GetHashCode();
    }
}

