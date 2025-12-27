using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Domain.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MyDietitianMobileApp.Infrastructure.Persistence
{
    public class UserAccount
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string Role { get; set; } // "Dietitian" or "Client"
        public Guid? LinkedDietitianId { get; set; } // For Dietitian
        public Guid? LinkedClientId { get; set; } // For Client
        public Guid? ActiveDietitianContextId { get; set; } // For Client context
    }

    public class AuthDbContext : DbContext
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options) { }
        public DbSet<UserAccount> UserAccounts { get; set; }
    }

    public class PasswordHasherService
    {
        private readonly PasswordHasher<UserAccount> _hasher = new();
        public string HashPassword(UserAccount user, string password) => _hasher.HashPassword(user, password);
        public bool VerifyPassword(UserAccount user, string password) =>
            _hasher.VerifyHashedPassword(user, user.PasswordHash, password) == PasswordVerificationResult.Success;
    }
}
