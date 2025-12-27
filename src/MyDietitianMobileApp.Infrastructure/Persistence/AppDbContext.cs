using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Domain.Entities;

namespace MyDietitianMobileApp.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public DbSet<Dietitian> Dietitians { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Recipe> Recipes { get; set; }
        public DbSet<Ingredient> Ingredients { get; set; }
        public DbSet<AccessKey> AccessKeys { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Multi-tenant filtering: DietitianId on relevant entities
            modelBuilder.Entity<Client>()
                .HasIndex(c => c.ActiveDietitianId);
            modelBuilder.Entity<Recipe>()
                .HasIndex(r => r.DietitianId);
            modelBuilder.Entity<AccessKey>()
                .HasIndex(a => new { a.DietitianId, a.ClientId });
            // Add further configuration as needed
        }
    }
}
