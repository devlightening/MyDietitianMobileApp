using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Domain.Repositories;
using System;
using System.Linq;

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

        public IEnumerable<Ingredient> Search(string searchTerm, int maxResults = 20)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return Enumerable.Empty<Ingredient>();

            var normalized = searchTerm.Trim().ToLower();
            
            // First, get all active ingredients that match CanonicalName
            var matchingByName = _context.Ingredients
                .Where(i => i.IsActive && EF.Functions.ILike(i.CanonicalName, $"%{normalized}%"))
                .ToList();
            
            // Then, filter in memory for aliases match and combine results
            var matchingByAlias = _context.Ingredients
                .Where(i => i.IsActive)
                .ToList()
                .Where(i => i.Aliases.Any(alias => alias.Contains(normalized, StringComparison.OrdinalIgnoreCase)))
                .Where(i => !matchingByName.Any(m => m.Id == i.Id)); // Avoid duplicates
            
            var allMatches = matchingByName.Concat(matchingByAlias)
                .OrderBy(i => i.CanonicalName)
                .Take(maxResults)
                .ToList();
            
            return allMatches;
        }

        public IEnumerable<Ingredient> GetAll()
        {
            return _context.Ingredients
                .OrderBy(i => i.CanonicalName)
                .ToList();
        }

        public bool ExistsByCanonicalName(string canonicalName, Guid? excludeId = null)
        {
            var normalized = canonicalName.Trim().ToLower();
            var query = _context.Ingredients.AsQueryable();

            if (excludeId.HasValue)
            {
                query = query.Where(i => i.Id != excludeId.Value);
            }

            return query.Any(i => i.CanonicalName.ToLower() == normalized);
        }
    }
}
