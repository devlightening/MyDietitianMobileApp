namespace MyDietitianMobileApp.Application.Commands
{
    public class CreateRecipeCommand
    {
        public Guid DietitianId { get; }
        public string Name { get; }
        public string Description { get; }
        public IEnumerable<Guid> MandatoryIngredientIds { get; }
        public IEnumerable<Guid> OptionalIngredientIds { get; }
        public IEnumerable<Guid> ProhibitedIngredientIds { get; }
        public CreateRecipeCommand(
            Guid dietitianId,
            string name,
            string description,
            IEnumerable<Guid> mandatoryIngredientIds,
            IEnumerable<Guid> optionalIngredientIds,
            IEnumerable<Guid> prohibitedIngredientIds)
        {
            DietitianId = dietitianId;
            Name = name;
            Description = description;
            MandatoryIngredientIds = mandatoryIngredientIds;
            OptionalIngredientIds = optionalIngredientIds;
            ProhibitedIngredientIds = prohibitedIngredientIds;
        }
    }
    public class CreateRecipeResult
    {
        public Guid RecipeId { get; }
        public CreateRecipeResult(Guid recipeId) => RecipeId = recipeId;
    }
    public interface ICreateRecipeHandler
    {
        CreateRecipeResult Handle(CreateRecipeCommand command);
    }
}
