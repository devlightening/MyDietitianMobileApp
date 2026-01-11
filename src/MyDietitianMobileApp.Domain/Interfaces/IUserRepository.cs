namespace MyDietitianMobileApp.Domain.Interfaces;

// Note: Returns dynamic to avoid circular dependency with Infrastructure
// Actual implementation will return AuthDbContext.UserAccount and Client
public interface IUserRepository
{
    Task<object?> GetByPublicUserIdAsync(string publicUserId);
    Task<object?> GetClientByPublicUserIdAsync(string publicUserId);
}
