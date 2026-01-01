using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Domain.Repositories;
using System;

namespace MyDietitianMobileApp.Infrastructure.Persistence
{
    public class IngredientRepository : IIngredientRepository
    {
        private readonly AppDbContext _context;
        public IngredientRepository(AppDbContext context)
        {
            _context = context;
        }
        public Ingredient GetById(Guid id)
        {
            return _context.Ingredients.FirstOrDefault(i => i.Id == id);
        }
    }
}
