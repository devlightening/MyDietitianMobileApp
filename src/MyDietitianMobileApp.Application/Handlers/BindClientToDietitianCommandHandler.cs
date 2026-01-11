using MediatR;
using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Application.Commands;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Infrastructure.Persistence;

namespace MyDietitianMobileApp.Application.Handlers;

public class BindClientToDietitianCommandHandler 
    : IRequestHandler<BindClientToDietitianCommand, BindClientToDietitianResult>
{
    private readonly AppDbContext _context;

    public BindClientToDietitianCommandHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<BindClientToDietitianResult> Handle(
        BindClientToDietitianCommand request,
        CancellationToken cancellationToken)
    {
        // Business rule: 1 client = 1 active dietitian at a time
        var existingActiveLink = await _context.DietitianClientLinks
            .FirstOrDefaultAsync(l => 
                l.ClientId == request.ClientId && 
                l.IsActive,
                cancellationToken);

        bool deactivatedPrevious = false;

        using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            // Deactivate previous link if exists
            if (existingActiveLink != null)
            {
                existingActiveLink.Deactivate();
                deactivatedPrevious = true;
            }

            // Create new link
            var newLink = new DietitianClientLink(
                request.DietitianId,
                request.ClientId,
                request.PublicUserId
            );

            _context.DietitianClientLinks.Add(newLink);
            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return new BindClientToDietitianResult
            {
                Success = true,
                Message = "Client successfully linked to dietitian",
                LinkId = newLink.Id,
                DeactivatedPreviousLink = deactivatedPrevious
            };
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return new BindClientToDietitianResult
            {
                Success = false,
                Message = $"Failed to create link: {ex.Message}"
            };
        }
    }
}
