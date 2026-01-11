using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Application.Commands;
using MyDietitianMobileApp.Application.Queries;
using MyDietitianMobileApp.Infrastructure.Persistence;
using System.Security.Claims;

namespace MyDietitianMobileApp.Api.Controllers;

/// <summary>
/// Manages diet plans: creation, retrieval, and alternative meal decisions
/// </summary>
[Authorize]
[ApiController]
[Route("api/diet-plans")]
public class DietPlanController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly AuthDbContext _authDb;

    public DietPlanController(IMediator mediator, AuthDbContext authDb)
    {
        _mediator = mediator;
        _authDb = authDb;
    }

    /// <summary>
    /// Create new diet plan
    /// </summary>
    [HttpPost]
    [Authorize("Dietitian")]
    public async Task<IActionResult> CreateDietPlan([FromBody] CreateDietPlanCommand command)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized();

        var user = await _authDb.UserAccounts.FirstOrDefaultAsync(u => u.Id == userId && u.Role == "Dietitian");
        if (user?.LinkedDietitianId == null)
            return Unauthorized();

        var createCommand = new CreateDietPlanCommand(
            user.LinkedDietitianId.Value,
            command.ClientId,
            command.Name,
            command.StartDate,
            command.EndDate,
            command.Days);

        var result = await _mediator.Send(createCommand);
        return result.Success ? Ok(result) : BadRequest(result.ErrorMessage);
    }

    /// <summary>
    /// Get diet plan for a client
    /// </summary>
    [HttpGet("{clientId}")]
    [Authorize("Dietitian")]
    public async Task<IActionResult> GetDietPlan(Guid clientId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized();

        var user = await _authDb.UserAccounts.FirstOrDefaultAsync(u => u.Id == userId && u.Role == "Dietitian");
        if (user?.LinkedDietitianId == null)
            return Unauthorized();

        var query = new GetDietPlanByClientQuery(user.LinkedDietitianId.Value, clientId);
        var result = await _mediator.Send(query);
        
        return result != null 
            ? Ok(result) 
            : NotFound("No active diet plan found for this client.");
    }

    /// <summary>
    /// Get alternative meal recommendation
    /// </summary>
    [HttpPost("decide-alternative")]
    [Authorize("Dietitian")]
    public async Task<IActionResult> DecideAlternative([FromBody] DecideAlternativeMealQuery query)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized();

        var user = await _authDb.UserAccounts.FirstOrDefaultAsync(u => u.Id == userId && u.Role == "Dietitian");
        if (user?.LinkedDietitianId == null)
            return Unauthorized();

        var decisionQuery = new DecideAlternativeMealQuery(
            user.LinkedDietitianId.Value,
            query.PlannedRecipeId,
            query.MealType,
            query.ClientAvailableIngredients);

        var result = await _mediator.Send(decisionQuery);
        return Ok(result);
    }

    /// <summary>
    /// Get today's plan for mobile client
    /// </summary>
    [HttpGet("today")]
    [Authorize("Client")]
    public async Task<IActionResult> GetTodayPlan()
    {
        try
        {
            var query = new GetTodayPlanQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
    }
}
