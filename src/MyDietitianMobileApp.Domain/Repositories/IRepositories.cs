using MyDietitianMobileApp.Domain.Entities;

namespace MyDietitianMobileApp.Domain.Repositories
{
    public interface IClientRepository
    {
        Client GetById(Guid id);
    }

    public interface IDietitianRepository
    {
        Dietitian GetById(Guid id);
    }

    public interface IIngredientRepository
    {
        Ingredient GetById(Guid id);
    }

    public interface IRecipeRepository
    {
        IEnumerable<Recipe> ListByDietitianId(Guid dietitianId);
    }
}

