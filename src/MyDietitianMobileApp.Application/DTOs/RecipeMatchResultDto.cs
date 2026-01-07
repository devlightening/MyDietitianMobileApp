namespace MyDietitianMobileApp.Application.DTOs
{
    public class RecipeMatchResultDto
    {
        public Guid RecipeId { get; set; }
        public string RecipeName { get; set; }
        public int MatchPercentage { get; set; }
        public List<string> MatchedIngredients { get; set; }
        public List<string> MissingMandatoryIngredients { get; set; }
        public List<string> MissingOptionalIngredients { get; set; }
        public bool IsFullyMatch { get; set; }
    }
}
