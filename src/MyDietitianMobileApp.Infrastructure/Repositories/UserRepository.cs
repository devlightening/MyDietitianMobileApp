using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Domain.Interfaces;
using MyDietitianMobileApp.Infrastructure.Persistence;

namespace MyDietitianMobileApp.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AuthDbContext _authContext;
    private readonly AppDbContext _appContext;

    public UserRepository(AuthDbContext authContext, AppDbContext appContext)
    {
        _authContext = authContext;
        _appContext = appContext;
    }

    public async Task<object?> GetByPublicUserIdAsync(string publicUserId)
    {
        return await _authContext.UserAccounts
            .FirstOrDefaultAsync(u => u.PublicUserId == publicUserId);
    }

    public async Task<object?> GetClientByPublicUserIdAsync(string publicUserId)
    {
        var user = await _authContext.UserAccounts
            .FirstOrDefaultAsync(u => u.PublicUserId == publicUserId);
        
        if (user?.LinkedClientId == null)
            return null;

        return await _appContext.Clients.FindAsync(user.LinkedClientId.Value);
    }
}
