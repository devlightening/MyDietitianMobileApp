using MyDietitianMobileApp.Domain.Entities;

namespace MyDietitianMobileApp.Domain.Services
{
    /// <summary>
    /// Decision result for whether a client can cook a planned meal or needs an alternative
    /// </summary>
    public class AlternativeMealDecision
    {
        public bool CanCookOriginal { get; }
        public List<Guid> MissingIngredients { get; }
        public AlternativeRecipeRecommendation? AlternativeRecommendation { get; }
        public string Explanation { get; }

        public AlternativeMealDecision(
            bool canCookOriginal,
            List<Guid> missingIngredients,
            AlternativeRecipeRecommendation? alternativeRecommendation,
            string explanation)
        {
            CanCookOriginal = canCookOriginal;
            MissingIngredients = missingIngredients ?? new List<Guid>();
            AlternativeRecommendation = alternativeRecommendation;
            Explanation = explanation;
        }

        public static AlternativeMealDecision CanCook(string explanation)
        {
            return new AlternativeMealDecision(true, new List<Guid>(), null, explanation);
        }

        public static AlternativeMealDecision NeedsAlternative(
            List<Guid> missingIngredients,
            AlternativeRecipeRecommendation? alternative,
            string explanation)
        {
            return new AlternativeMealDecision(false, missingIngredients, alternative, explanation);
        }
    }

    /// <summary>
    /// Recommendation for an alternative recipe
    /// </summary>
    public class AlternativeRecipeRecommendation
    {
        public Guid RecipeId { get; }
        public string RecipeName { get; }
        public decimal MatchPercentage { get; }
        public List<Guid> MissingIngredientsForAlternative { get; }
        public string NutritionalComparison { get; }

        public AlternativeRecipeRecommendation(
            Guid recipeId,
            string recipeName,
            decimal matchPercentage,
            List<Guid> missingIngredientsForAlternative,
            string nutritionalComparison)
        {
            RecipeId = recipeId;
            RecipeName = recipeName;
            MatchPercentage = matchPercentage;
            MissingIngredientsForAlternative = missingIngredientsForAlternative ?? new List<Guid>();
            NutritionalComparison = nutritionalComparison;
        }
    }

    /// <summary>
    /// Domain service for determining if a client needs an alternative meal
    /// and providing the best alternative recommendation
    /// </summary>
    public interface IAlternativeMealDecisionService
    {
        Task<AlternativeMealDecision> DecideForMealAsync(
            Guid plannedRecipeId,
            MealType mealType,
            List<Guid> clientAvailableIngredients,
            Guid dietitianId,
            CancellationToken cancellationToken = default);
    }
}
