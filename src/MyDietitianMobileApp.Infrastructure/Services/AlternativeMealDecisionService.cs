using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Domain.Repositories;
using MyDietitianMobileApp.Domain.Services;
using MyDietitianMobileApp.Infrastructure.Persistence;

namespace MyDietitianMobileApp.Infrastructure.Services
{
    public class AlternativeMealDecisionService : IAlternativeMealDecisionService
    {
        private readonly AppDbContext _context;
        private readonly IRecipeRepository _recipeRepository;

        public AlternativeMealDecisionService(AppDbContext context, IRecipeRepository recipeRepository)
        {
            _context = context;
            _recipeRepository = recipeRepository;
        }

        public async Task<AlternativeMealDecision> DecideForMealAsync(
            Guid plannedRecipeId,
            MealType mealType,
            List<Guid> clientAvailableIngredients,
            Guid dietitianId,
            CancellationToken cancellationToken = default)
        {
            // Get the planned recipe
            var allRecipes = await _recipeRepository.GetAllWithIngredientsAsync(cancellationToken);
            var plannedRecipe = allRecipes.FirstOrDefault(r => r.Id == plannedRecipeId);
            
            if (plannedRecipe == null)
            {
                return AlternativeMealDecision.NeedsAlternative(
                    new List<Guid>(),
                    null,
                    "Planned recipe not found.");
            }

            // Check if client has prohibited ingredients
            var prohibitedIngredients = plannedRecipe.ProhibitedIngredients.Select(i => i.Id).ToList();
            var hasProhibitedIngredient = prohibitedIngredients.Any(pid => clientAvailableIngredients.Contains(pid));

            if (hasProhibitedIngredient)
            {
                // Cannot cook this recipe at all - find alternative
                return await FindBestAlternativeAsync(
                    plannedRecipe,
                    mealType,
                    clientAvailableIngredients,
                    dietitianId,
                    "Client has prohibited ingredients for this recipe.",
                    cancellationToken);
            }

            // Check for mandatory ingredients
            var mandatoryIngredientIds = plannedRecipe.MandatoryIngredients.Select(i => i.Id).ToList();
            var missingMandatory = mandatoryIngredientIds.Except(clientAvailableIngredients).ToList();

            if (missingMandatory.Any())
            {
                // Missing mandatory ingredients - find alternative
                var missingNames = plannedRecipe.MandatoryIngredients
                    .Where(i => missingMandatory.Contains(i.Id))
                    .Select(i => i.Name)
                    .ToList();

                var explanation = $"Missing mandatory ingredients: {string.Join(", ", missingNames)}";

                return await FindBestAlternativeAsync(
                    plannedRecipe,
                    mealType,
                    clientAvailableIngredients,
                    dietitianId,
                    explanation,
                    cancellationToken);
            }

            // Check optional ingredients
            var allRequiredIngredients = plannedRecipe.MandatoryIngredients
                .Union(plannedRecipe.OptionalIngredients)
                .Select(i => i.Id)
                .ToList();

            var availableIngredients = allRequiredIngredients.Intersect(clientAvailableIngredients).ToList();
            var matchPercentage = allRequiredIngredients.Any()
                ? (decimal)availableIngredients.Count / allRequiredIngredients.Count * 100
                : 100m;

            // If match is high enough (e.g., 80%+), allow cooking original recipe
            if (matchPercentage >= 80m)
            {
                return AlternativeMealDecision.CanCook(
                    $"You have {matchPercentage:F0}% of ingredients for {plannedRecipe.Name}. You can cook this recipe!");
            }

            // Match is low - find alternative
            var missingOptionalIds = plannedRecipe.OptionalIngredients
                .Select(i => i.Id)
                .Except(clientAvailableIngredients)
                .ToList();

            var missingOptionalNames = plannedRecipe.OptionalIngredients
                .Where(i => missingOptionalIds.Contains(i.Id))
                .Select(i => i.Name)
                .ToList();

            var lowMatchExplanation = $"You only have {matchPercentage:F0}% of ingredients. Missing optional ingredients: {string.Join(", ", missingOptionalNames)}";

            return await FindBestAlternativeAsync(
                plannedRecipe,
                mealType,
                clientAvailableIngredients,
                dietitianId,
                lowMatchExplanation,
                cancellationToken);
        }

        private async Task<AlternativeMealDecision> FindBestAlternativeAsync(
            Recipe originalRecipe,
            MealType mealType,
            List<Guid> clientAvailableIngredients,
            Guid dietitianId,
            string reasonForAlternative,
            CancellationToken cancellationToken)
        {
            // Get all recipes for this dietitian (excluding the original recipe)
            var allRecipes = await _recipeRepository.GetAllWithIngredientsAsync(cancellationToken);
            var dietitianRecipes = allRecipes
                .Where(r => r.DietitianId == dietitianId && r.Id != originalRecipe.Id)
                .ToList();

            if (!dietitianRecipes.Any())
            {
                return AlternativeMealDecision.NeedsAlternative(
                    new List<Guid>(),
                    null,
                    $"{reasonForAlternative} No alternative recipes available.");
            }

            // Match each recipe
            var matches = new List<(Recipe recipe, decimal matchPercentage, List<Guid> missingIngredients)>();

            foreach (var recipe in dietitianRecipes)
            {
                // Skip if has prohibited ingredients
                var prohibitedIds = recipe.ProhibitedIngredients.Select(i => i.Id).ToList();
                if (prohibitedIds.Any(pid => clientAvailableIngredients.Contains(pid)))
                    continue;

                // Skip if missing mandatory ingredients
                var mandatoryIds = recipe.MandatoryIngredients.Select(i => i.Id).ToList();
                var hasMandatory = mandatoryIds.All(mid => clientAvailableIngredients.Contains(mid));
                if (!hasMandatory)
                    continue;

                // Calculate match percentage
                var allRequiredIds = recipe.MandatoryIngredients
                    .Union(recipe.OptionalIngredients)
                    .Select(i => i.Id)
                    .ToList();

                var availableIds = allRequiredIds.Intersect(clientAvailableIngredients).ToList();
                var percentage = allRequiredIds.Any()
                    ? (decimal)availableIds.Count / allRequiredIds.Count * 100
                    : 100m;

                var missingIds = allRequiredIds.Except(clientAvailableIngredients).ToList();

                matches.Add((recipe, percentage, missingIds));
            }

            // Get best match (highest percentage)
            var bestMatch = matches.OrderByDescending(m => m.matchPercentage).FirstOrDefault();

            if (bestMatch.recipe == null)
            {
                return AlternativeMealDecision.NeedsAlternative(
                    new List<Guid>(),
                    null,
                    $"{reasonForAlternative} No suitable alternative recipes found (all have prohibited ingredients or missing mandatory ingredients).");
            }

            var recommendation = new AlternativeRecipeRecommendation(
                bestMatch.recipe.Id,
                bestMatch.recipe.Name,
                bestMatch.matchPercentage,
                bestMatch.missingIngredients,
                "Nutritional comparison not yet implemented"); // TODO: Add nutritional comparison

            var explanation = $"{reasonForAlternative} We recommend '{bestMatch.recipe.Name}' as an alternative ({bestMatch.matchPercentage:F0}% ingredient match).";

            return AlternativeMealDecision.NeedsAlternative(
                new List<Guid>(),
                recommendation,
                explanation);
        }
    }
}
