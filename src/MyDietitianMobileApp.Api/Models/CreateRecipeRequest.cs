namespace MyDietitianMobileApp.Api.Models
{
    public class CreateRecipeRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<Guid> MandatoryIngredientIds { get; set; } = new();
        public List<Guid> OptionalIngredientIds { get; set; } = new();
        public List<Guid> ProhibitedIngredientIds { get; set; } = new();
    }
}

