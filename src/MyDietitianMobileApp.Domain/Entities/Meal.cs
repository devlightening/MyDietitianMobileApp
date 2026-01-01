namespace MyDietitianMobileApp.Domain.Entities
{
    public enum MealType
    {
        Breakfast = 1,
        Lunch = 2,
        Dinner = 3,
        Snack = 4
    }

    public class Meal
    {
        public Guid Id { get; private set; }
        public Guid DietDayId { get; private set; }
        public MealType Type { get; private set; }
        public Guid? RecipeId { get; private set; }
        public string? CustomName { get; private set; }
        public IReadOnlyCollection<MealItem> Items => _items.AsReadOnly();

        private readonly List<MealItem> _items = new();

        public Meal(Guid id, Guid dietDayId, MealType type, Guid? recipeId = null, string? customName = null)
        {
            if (recipeId == null && string.IsNullOrWhiteSpace(customName))
                throw new ArgumentException("Either RecipeId or CustomName must be provided.");
            
            Id = id;
            DietDayId = dietDayId;
            Type = type;
            RecipeId = recipeId;
            CustomName = customName;
        }

        public void AddItem(MealItem item)
        {
            if (item.MealId != Id)
                throw new InvalidOperationException("MealItem must belong to this meal.");
            
            if (_items.Any(i => i.IngredientId == item.IngredientId))
                throw new InvalidOperationException($"Ingredient {item.IngredientId} already exists in this meal.");
            
            _items.Add(item);
        }

        public override bool Equals(object obj)
        {
            if (obj is not Meal other) return false;
            return Id == other.Id;
        }

        public override int GetHashCode() => Id.GetHashCode();
    }
}

