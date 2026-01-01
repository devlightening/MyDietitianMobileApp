using MyDietitianMobileApp.Application.Queries;
using MyDietitianMobileApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MyDietitianMobileApp.Application.Handlers;

public class ListAccessKeysByDietitianQueryHandler : IListAccessKeysByDietitianHandler
{
    private readonly AppDbContext _context;

    public ListAccessKeysByDietitianQueryHandler(AppDbContext context)
    {
        _context = context;
    }

    public ListAccessKeysByDietitianResult Handle(ListAccessKeysByDietitianQuery query)
    {
        var accessKeys = _context.AccessKeys
            .Where(ak => ak.DietitianId == query.DietitianId)
            .Select(ak => new AccessKeyDto
            {
                Id = ak.Id,
                Key = ak.Key,
                DietitianId = ak.DietitianId,
                ClientId = ak.ClientId,
                StartDate = ak.StartDate,
                EndDate = ak.EndDate,
                IsActive = ak.IsActive
            })
            .ToList();

        return new ListAccessKeysByDietitianResult(accessKeys);
    }
}

