using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Application.Commands;
using MyDietitianMobileApp.Application.Queries;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Domain.Interfaces;
using MyDietitianMobileApp.Infrastructure.Persistence;

namespace MyDietitianMobileApp.Api.Controllers;

/// <summary>
/// Manages dietitian operations: client management, access keys, client health data
/// </summary>
[Authorize]
[ApiController]
[Route("api/dietitian")]
public class DietitianManagementController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly AuthDbContext _authDb;
    private readonly AppDbContext _appDb;
    private readonly IUserRepository _userRepo;

    public DietitianManagementController(
        IMediator mediator,
        AuthDbContext authDb,
        AppDbContext appDb,
        IUserRepository userRepo)
    {
        _mediator = mediator;
        _authDb = authDb;
        _appDb = appDb;
        _userRepo = userRepo;
    }

    /// <summary>
    /// Get all clients for the authenticated dietitian
    /// </summary>
    [HttpGet("clients")]
    public async Task<IActionResult> GetClients()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _authDb.UserAccounts.FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));
        if (user?.LinkedDietitianId == null)
            return Forbid();

        var query = new GetClientsByDietitianQuery
        {
            DietitianId = user.LinkedDietitianId.Value
        };

        var result = await _mediator.Send(query);

        return Ok(new { clients = result.Clients });
    }

    /// <summary>
    /// Get specific client's measurements
    /// </summary>
    [HttpGet("clients/{publicUserId}/measurements")]
    public async Task<IActionResult> GetClientMeasurements(string publicUserId)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _authDb.UserAccounts.FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));
        if (user?.LinkedDietitianId == null)
            return Forbid();

        var client = await _userRepo.GetClientByPublicUserIdAsync(publicUserId);
        if (client == null)
            return NotFound($"Client with ID {publicUserId} not found");

        var clientEntity = (Client)client;

        var query = new GetUserMeasurementsQuery
        {
            ClientId = clientEntity.Id,
            LastNDays = null
        };

        var result = await _mediator.Send(query);

        return Ok(new
        {
            publicUserId = publicUserId,
            measurements = result.Measurements,
            latest = result.Latest
        });
    }

    /// <summary>
    /// Create premium access key for a client
    /// </summary>
    [HttpPost("access-keys")]
    public async Task<IActionResult> CreateAccessKey([FromBody] CreateAccessKeyRequest request)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _authDb.UserAccounts.FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));
        if (user?.LinkedDietitianId == null)
            return Forbid();

        var dietitian = await _appDb.Dietitians.FindAsync(user.LinkedDietitianId.Value);
        if (dietitian == null || !dietitian.IsActive)
            return BadRequest("Dietitian not found");

        var client = await _userRepo.GetClientByPublicUserIdAsync(request.ClientId);
        if (client == null)
            return NotFound($"Client with ID {request.ClientId} not found");

        var clientEntity = (Client)client;

        if (!DateTime.TryParse(request.StartDate, out var startDate) ||
            !DateTime.TryParse(request.EndDate, out var endDate))
        {
            return BadRequest("Invalid date format");
        }

        var keyValue = GenerateAccessKey();
        var accessKey = new AccessKey(
            Guid.NewGuid(),
            keyValue,
            user.LinkedDietitianId.Value,
            clientEntity.Id,
            startDate,
            endDate,
            true
        );

        _appDb.AccessKeys.Add(accessKey);

        // FAZ 3: Create permanent binding
        var bindCommand = new BindClientToDietitianCommand
        {
            DietitianId = user.LinkedDietitianId.Value,
            ClientId = clientEntity.Id,
            PublicUserId = request.ClientId
        };

        await _mediator.Send(bindCommand);
        await _appDb.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            key = accessKey.Key,
            clientId = request.ClientId,
            startDate = accessKey.StartDate.ToString("yyyy-MM-dd"),
            endDate = accessKey.EndDate.ToString("yyyy-MM-dd")
        });
    }

    private static string GenerateAccessKey()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var random = new Random();
        return new string(Enumerable.Range(0, 12)
            .Select(_ => chars[random.Next(chars.Length)])
            .ToArray());
    }
}

// DTOs
public record CreateAccessKeyRequest(string ClientId, string StartDate, string EndDate);
