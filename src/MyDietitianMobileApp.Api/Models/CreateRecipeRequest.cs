namespace MyDietitianMobileApp.Api.Models
{
    public class CreateRecipeRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<IngredientRequestModel> Ingredients { get; set; } = new();
    }

    public class IngredientRequestModel
    {
        public Guid IngredientId { get; set; }
        public bool IsMandatory { get; set; }
        public bool IsProhibited { get; set; }
    }
}
