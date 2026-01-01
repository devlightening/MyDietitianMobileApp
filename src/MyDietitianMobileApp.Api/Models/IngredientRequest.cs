namespace MyDietitianMobileApp.Api.Models
{
    public class CreateIngredientRequest
    {
        public string CanonicalName { get; set; } = string.Empty;
        public List<string> Aliases { get; set; } = new();
        public bool IsActive { get; set; } = true;
    }

    public class UpdateIngredientRequest
    {
        public string CanonicalName { get; set; } = string.Empty;
        public List<string> Aliases { get; set; } = new();
        public bool IsActive { get; set; }
    }

    public class ToggleIngredientActiveRequest
    {
        public bool IsActive { get; set; }
    }
}

