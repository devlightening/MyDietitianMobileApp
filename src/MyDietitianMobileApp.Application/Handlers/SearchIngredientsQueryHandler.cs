using MyDietitianMobileApp.Application.Queries;
using MyDietitianMobileApp.Domain.Repositories;

namespace MyDietitianMobileApp.Application.Handlers
{
    public class SearchIngredientsQueryHandler : ISearchIngredientsHandler
    {
        private readonly IIngredientRepository _ingredientRepository;

        public SearchIngredientsQueryHandler(IIngredientRepository ingredientRepository)
        {
            _ingredientRepository = ingredientRepository;
        }

        public SearchIngredientsResult Handle(SearchIngredientsQuery query)
        {
            var ingredients = _ingredientRepository.Search(query.SearchTerm, query.MaxResults);

            var dtos = ingredients.Select(i => new IngredientDto
            {
                Id = i.Id,
                CanonicalName = i.CanonicalName,
                Aliases = i.Aliases
            });

            return new SearchIngredientsResult(dtos);
        }
    }
}

