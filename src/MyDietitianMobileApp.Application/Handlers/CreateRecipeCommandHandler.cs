using MyDietitianMobileApp.Application.Commands;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MyDietitianMobileApp.Application.Handlers
{
    public class CreateRecipeCommandHandler : ICreateRecipeHandler
    {
        private readonly IDietitianRepository _dietitianRepository;
        private readonly IIngredientRepository _ingredientRepository;
        public CreateRecipeCommandHandler(IDietitianRepository dietitianRepository, IIngredientRepository ingredientRepository)
        {
            _dietitianRepository = dietitianRepository;
            _ingredientRepository = ingredientRepository;
        }
        public CreateRecipeResult Handle(CreateRecipeCommand command)
        {
            var dietitian = _dietitianRepository.GetById(command.DietitianId);
            if (dietitian == null || !dietitian.IsActive)
                throw new InvalidOperationException("Dietitian not found or inactive.");
            var recipe = new Recipe(Guid.NewGuid(), command.DietitianId, command.Name, command.Description);
            foreach (var ingredientId in command.MandatoryIngredientIds)
            {
                var ingredient = _ingredientRepository.GetById(ingredientId);
                if (ingredient == null)
                    throw new InvalidOperationException($"Ingredient {ingredientId} not found.");
                recipe.AddMandatoryIngredient(ingredient);
            }
            foreach (var ingredientId in command.OptionalIngredientIds)
            {
                var ingredient = _ingredientRepository.GetById(ingredientId);
                if (ingredient == null)
                    throw new InvalidOperationException($"Ingredient {ingredientId} not found.");
                recipe.AddOptionalIngredient(ingredient);
            }
            foreach (var ingredientId in command.ProhibitedIngredientIds)
            {
                var ingredient = _ingredientRepository.GetById(ingredientId);
                if (ingredient == null)
                    throw new InvalidOperationException($"Ingredient {ingredientId} not found.");
                recipe.AddProhibitedIngredient(ingredient);
            }
            dietitian.AddRecipe(recipe);
            return new CreateRecipeResult(recipe.Id);
        }
    }
}
