namespace MyDietitianMobileApp.Domain.Entities
{
    public class MealItem
    {
        public Guid Id { get; private set; }
        public Guid MealId { get; private set; }
        public Guid IngredientId { get; private set; }
        public bool IsMandatory { get; private set; }
        public decimal? Amount { get; private set; }
        public string? Unit { get; private set; }

        public MealItem(Guid id, Guid mealId, Guid ingredientId, bool isMandatory, decimal? amount = null, string? unit = null)
        {
            Id = id;
            MealId = mealId;
            IngredientId = ingredientId;
            IsMandatory = isMandatory;
            Amount = amount;
            Unit = unit;
        }

        public override bool Equals(object obj)
        {
            if (obj is not MealItem other) return false;
            return Id == other.Id;
        }

        public override int GetHashCode() => Id.GetHashCode();
    }
}

