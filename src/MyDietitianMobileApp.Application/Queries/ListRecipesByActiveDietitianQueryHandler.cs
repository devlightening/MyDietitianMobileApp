using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Domain.Repositories;
using System;
using System.Collections.Generic;

namespace MyDietitianMobileApp.Application.Queries
{
    public class ListRecipesByActiveDietitianQueryHandler : IListRecipesByActiveDietitianHandler
    {
        private readonly IRecipeRepository _recipeRepository;
        public ListRecipesByActiveDietitianQueryHandler(IRecipeRepository recipeRepository)
        {
            _recipeRepository = recipeRepository;
        }
        public ListRecipesByActiveDietitianResult Handle(ListRecipesByActiveDietitianQuery query)
        {
            var recipes = _recipeRepository.ListByDietitianId(query.DietitianId);
            var result = new List<RecipeDto>();
            foreach (var recipe in recipes)
            {
                result.Add(new RecipeDto
                {
                    Id = recipe.Id,
                    Name = recipe.Name,
                    Description = recipe.Description
                });
            }
            return new ListRecipesByActiveDietitianResult(result);
        }
    }
}
