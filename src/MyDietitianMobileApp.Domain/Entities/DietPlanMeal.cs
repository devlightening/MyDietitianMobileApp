namespace MyDietitianMobileApp.Domain.Entities
{
    public enum MealType
    {
        Breakfast = 1,
        Lunch = 2,
        Dinner = 3,
        Snack = 4
    }

    public class DietPlanMeal
    {
        public Guid Id { get; private set; }
        public Guid DietPlanDayId { get; private set; }
        public MealType Type { get; private set; }
        public Guid? PlannedRecipeId { get; private set; }
        public string? CustomName { get; private set; }
        public bool IsMandatory { get; private set; }

        // Navigation property for EF Core
        public DietPlanDay DietPlanDay { get; private set; } = null!;

        // Keeping Items for now if needed for manual customization, but focusing on PlannedRecipeId as per requirements
        public IReadOnlyCollection<MealItem> Items => _items.AsReadOnly();

        private readonly List<MealItem> _items = new();

        public DietPlanMeal(Guid id, Guid dietPlanDayId, MealType type, Guid? plannedRecipeId = null, string? customName = null, bool isMandatory = false)
        {
            if (plannedRecipeId == null && string.IsNullOrWhiteSpace(customName))
                throw new ArgumentException("Either PlannedRecipeId or CustomName must be provided.");
            
            Id = id;
            DietPlanDayId = dietPlanDayId;
            Type = type;
            PlannedRecipeId = plannedRecipeId;
            CustomName = customName;
            IsMandatory = isMandatory;
        }

        public void AddItem(MealItem item)
        {
            if (item.MealId != Id)
                throw new InvalidOperationException("MealItem must belong to this meal.");
            
            if (_items.Any(i => i.IngredientId == item.IngredientId))
                throw new InvalidOperationException($"Ingredient {item.IngredientId} already exists in this meal.");
            
            _items.Add(item);
        }

        public void SetMandatory(bool isMandatory)
        {
            IsMandatory = isMandatory;
        }

        public override bool Equals(object obj)
        {
            if (obj is not DietPlanMeal other) return false;
            return Id == other.Id;
        }

        public override int GetHashCode() => Id.GetHashCode();
    }
}

