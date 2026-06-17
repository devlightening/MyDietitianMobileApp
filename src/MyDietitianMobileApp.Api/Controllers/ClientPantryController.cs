using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using MediatR;
using MyDietitianMobileApp.Api.Problems;
using MyDietitianMobileApp.Application.Commands;
using MyDietitianMobileApp.Application.Services;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Infrastructure.Persistence;

namespace MyDietitianMobileApp.Api.Controllers;

[Authorize(Roles = "Client")]
[ApiController]
[Route("api/client/pantry")]
public class ClientPantryController : ControllerBase
{
    private readonly AppDbContext _appDb;
    private readonly IClientIdentityResolver _identityResolver;
    private readonly IMediator _mediator;

    public ClientPantryController(
        AppDbContext appDb,
        IClientIdentityResolver identityResolver,
        IMediator mediator)
    {
        _appDb = appDb;
        _identityResolver = identityResolver;
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var identity = await _identityResolver.ResolveClientAsync(User);
        if (!identity.HasValue)
            return Unauthorized(ApiProblems.Unauthorized("AUTH_REQUIRED", "Client hesabi bulunamadi."));

        var items = await QueryPantryAsync(identity.Value.clientId);
        return Ok(new { items });
    }

    /// <summary>
    /// Returns the most recently used ingredients from the client's pantry.
    /// Ordered by UpdatedAtUtc descending — powers the "Son Kullandıklarım" quick-add row.
    /// </summary>
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecent([FromQuery] int limit = 8)
    {
        var identity = await _identityResolver.ResolveClientAsync(User);
        if (!identity.HasValue)
            return Unauthorized(ApiProblems.Unauthorized("AUTH_REQUIRED", "Client hesabi bulunamadi."));

        var safeLimit = Math.Clamp(limit, 1, 20);

        var items = await _appDb.ClientPantryItems
            .AsNoTracking()
            .Where(x => x.ClientId == identity.Value.clientId)
            .Include(x => x.Ingredient)
            .OrderByDescending(x => x.UpdatedAtUtc)
            .Take(safeLimit)
            .Select(x => new { id = x.IngredientId, name = x.Ingredient.CanonicalName })
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpPut]
    [EnableRateLimiting("pantry")]
    public async Task<IActionResult> Replace([FromBody] ReplacePantryRequest request)
    {
        var identity = await _identityResolver.ResolveClientAsync(User);
        if (!identity.HasValue)
            return Unauthorized(ApiProblems.Unauthorized("AUTH_REQUIRED", "Client hesabi bulunamadi."));

        var incoming = (request.Items ?? Array.Empty<PantryItemRequest>())
            .GroupBy(x => x.IngredientId)
            .Select(g => g.Last())
            .ToList();

        if (incoming.Count > 60)
            return BadRequest(ApiProblems.Validation("PANTRY_LIMIT", "Pantry en fazla 60 malzeme tutabilir."));

        var ingredientIds = incoming.Select(x => x.IngredientId).ToList();
        var validIds = ingredientIds.Count == 0
            ? new HashSet<Guid>()
            : (await _appDb.Ingredients
                .Where(x => ingredientIds.Contains(x.Id))
                .Select(x => x.Id)
                .ToListAsync())
                .ToHashSet();

        var invalidId = ingredientIds.FirstOrDefault(x => !validIds.Contains(x));
        if (invalidId != Guid.Empty)
            return BadRequest(ApiProblems.Validation("INGREDIENT_NOT_FOUND", "Gecersiz pantry malzemesi gonderildi."));

        var existing = await _appDb.ClientPantryItems
            .Where(x => x.ClientId == identity.Value.clientId)
            .ToListAsync();

        var incomingByIngredient = incoming.ToDictionary(x => x.IngredientId, x => x);
        var removedCount = existing.Count(x => !incomingByIngredient.ContainsKey(x.IngredientId));
        var addedCount = incoming.Count(x => existing.All(e => e.IngredientId != x.IngredientId));
        var updatedCount = incoming.Count - addedCount;
        var sourceType = NormalizePantrySource(request.SourceType);
        var receiptLines = NormalizeReceiptLines(request.Receipt, incomingByIngredient.Keys.ToHashSet());

        foreach (var stale in existing.Where(x => !incomingByIngredient.ContainsKey(x.IngredientId)).ToList())
            _appDb.ClientPantryItems.Remove(stale);

        foreach (var item in incoming)
        {
            var current = existing.FirstOrDefault(x => x.IngredientId == item.IngredientId);
            if (current == null)
            {
                _appDb.ClientPantryItems.Add(new ClientPantryItem(
                    identity.Value.clientId,
                    item.IngredientId,
                    item.Quantity,
                    item.Unit));
                continue;
            }

            current.SetQuantity(item.Quantity, item.Unit);
        }

        if (sourceType == "receipt" && receiptLines.Count > 0)
        {
            var receiptId = Guid.NewGuid();
            var receiptCurrency = NormalizeCurrency(request.Receipt?.Currency)
                ?? receiptLines.Select(x => NormalizeCurrency(x.Currency)).FirstOrDefault(x => x != null)
                ?? "TRY";
            var receipt = new ClientPantryReceipt(
                receiptId,
                identity.Value.clientId,
                request.Receipt?.SessionId,
                NormalizeUtc(request.Receipt?.SavedAtUtc) ?? DateTime.UtcNow,
                NormalizeUtc(request.Receipt?.ReceiptDate),
                request.Receipt?.StoreName,
                receiptCurrency,
                request.Receipt?.TotalAmount);

            foreach (var line in receiptLines)
            {
                receipt.AddLine(new ClientPantryReceiptLine(
                    Guid.NewGuid(),
                    receiptId,
                    line.IngredientId,
                    line.RawLine,
                    line.ProductName,
                    line.Quantity,
                    line.Unit,
                    line.UnitPrice,
                    line.LineTotal,
                    line.Currency ?? receiptCurrency,
                    line.SortOrder));
            }

            _appDb.ClientPantryReceipts.Add(receipt);
        }

        _appDb.ClientActivities.Add(new ClientActivity(
            identity.Value.clientId,
            await GetActiveDietitianIdAsync(identity.Value.clientId),
            "pantry_updated",
            new
            {
                activeCount = incoming.Count,
                addedCount,
                updatedCount,
                removedCount,
                sourceType
            }));

        await _appDb.SaveChangesAsync();
        var items = await QueryPantryAsync(identity.Value.clientId);
        return Ok(new { items });
    }

    [HttpGet("receipts/recent")]
    public async Task<IActionResult> GetRecentReceipts([FromQuery] int limit = 10)
    {
        var identity = await _identityResolver.ResolveClientAsync(User);
        if (!identity.HasValue)
            return Unauthorized(ApiProblems.Unauthorized("AUTH_REQUIRED", "Client hesabi bulunamadi."));

        var safeLimit = Math.Clamp(limit, 1, 20);
        var receipts = await _appDb.ClientPantryReceipts
            .AsNoTracking()
            .Where(x => x.ClientId == identity.Value.clientId)
            .OrderByDescending(x => x.SavedAtUtc)
            .Take(safeLimit)
            .Select(x => new
            {
                id = x.Id,
                sessionId = x.SessionId,
                savedAtUtc = x.SavedAtUtc,
                receiptDate = x.ReceiptDate,
                storeName = x.StoreName,
                currency = x.Currency,
                totalAmount = x.TotalAmount,
                lines = x.Lines
                    .OrderBy(line => line.SortOrder)
                    .Select(line => new
                    {
                        id = line.Id,
                        ingredientId = line.IngredientId,
                        ingredientName = line.Ingredient.CanonicalName,
                        rawLine = line.RawLine,
                        productName = line.ProductName,
                        quantity = line.Quantity,
                        unit = line.Unit,
                        unitPrice = line.UnitPrice,
                        lineTotal = line.LineTotal,
                        currency = line.Currency,
                        sortOrder = line.SortOrder,
                    })
                    .ToList(),
            })
            .ToListAsync();

        return Ok(new { receipts });
    }

    [HttpPost("analyze-receipt")]
    [EnableRateLimiting("kitchen-vision")]
    [RequestSizeLimit(16 * 1024 * 1024)]
    public async Task<IActionResult> AnalyzeReceipt(
        [FromBody] AnalyzeReceiptRequest request,
        CancellationToken cancellationToken)
    {
        var identity = await _identityResolver.ResolveClientAsync(User);
        if (!identity.HasValue)
            return Unauthorized(ApiProblems.Unauthorized("AUTH_REQUIRED", "Client hesabi bulunamadi."));

        if (string.IsNullOrWhiteSpace(request.Base64Image))
            return BadRequest(ApiProblems.Validation("BASE64_REQUIRED", "base64Image alani bos olamaz."));

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        var mediaType = (request.MediaType ?? "image/jpeg").ToLowerInvariant();
        if (!allowedTypes.Contains(mediaType))
            return BadRequest(ApiProblems.Validation("UNSUPPORTED_MEDIA", "Desteklenmeyen goruntu turu."));

        var command = new AnalyzeIngredientImageCommand(
            request.Base64Image,
            mediaType,
            VisionScanKind.Receipt);
        var result = await _mediator.Send(command, cancellationToken);

        if (result.Reason == "image_too_large")
        {
            return StatusCode(StatusCodes.Status413PayloadTooLarge, new
            {
                code = "IMAGE_TOO_LARGE",
                message = result.UserMessage ?? "Fotoğraf çok büyük. Lütfen daha küçük bir fotoğraf seçin.",
                reason = result.Reason,
                userMessage = result.UserMessage,
            });
        }

        return Ok(new
        {
            sessionId = result.SessionId,
            featureStatus = result.FeatureStatus,
            totalDetected = result.TotalDetected,
            promptTokens = result.PromptTokens,
            completionTokens = result.CompletionTokens,
            reason = result.Reason,
            userMessage = result.UserMessage,
            matched = result.Matched.Select(m => new
            {
                ingredientId = m.IngredientId,
                canonicalName = m.CanonicalName,
                confidence = m.Confidence,
                detectedName = m.DetectedName,
                rawLine = m.RawLine,
                quantity = m.Quantity,
                unit = m.Unit,
                unitPrice = m.UnitPrice,
                lineTotal = m.LineTotal,
                currency = m.Currency,
                normalizedLabel = m.NormalizedLabel,
                matchedBy = m.MatchedBy,
                mappingType = m.MappingType,
                isAutoSelected = m.IsAutoSelected,
                requiresConfirmation = m.RequiresConfirmation,
            }),
            unmatched = result.Unmatched,
            receiptRows = result.ReceiptRows.Select(r => new
            {
                rawLine = r.RawLine,
                productName = r.ProductName,
                quantity = r.Quantity,
                unit = r.Unit,
                unitPrice = r.UnitPrice,
                lineTotal = r.LineTotal,
                currency = r.Currency,
                isFood = r.IsFood,
                excludedReason = r.ExcludedReason,
            }),
            excluded = result.Excluded.Select(r => new
            {
                rawLine = r.RawLine,
                productName = r.ProductName,
                quantity = r.Quantity,
                unit = r.Unit,
                unitPrice = r.UnitPrice,
                lineTotal = r.LineTotal,
                currency = r.Currency,
                isFood = r.IsFood,
                excludedReason = r.ExcludedReason,
            }),
        });
    }

    [HttpDelete("{ingredientId:guid}")]
    [EnableRateLimiting("pantry")]
    public async Task<IActionResult> Delete(Guid ingredientId)
    {
        var identity = await _identityResolver.ResolveClientAsync(User);
        if (!identity.HasValue)
            return Unauthorized(ApiProblems.Unauthorized("AUTH_REQUIRED", "Client hesabi bulunamadi."));

        var current = await _appDb.ClientPantryItems
            .Include(x => x.Ingredient)
            .FirstOrDefaultAsync(x => x.ClientId == identity.Value.clientId && x.IngredientId == ingredientId);

        if (current == null)
            return NotFound(ApiProblems.NotFound("PANTRY_ITEM_NOT_FOUND", "Pantry malzemesi bulunamadi."));

        _appDb.ClientPantryItems.Remove(current);
        _appDb.ClientActivities.Add(new ClientActivity(
            identity.Value.clientId,
            await GetActiveDietitianIdAsync(identity.Value.clientId),
            "pantry_item_removed",
            new
            {
                ingredientId,
                ingredientName = current.Ingredient?.CanonicalName,
                quantity = current.Quantity,
                unit = current.Unit
            }));
        await _appDb.SaveChangesAsync();
        return NoContent();
    }

    private async Task<List<object>> QueryPantryAsync(Guid clientId)
    {
        var items = await _appDb.ClientPantryItems
            .AsNoTracking()
            .Where(x => x.ClientId == clientId)
            .Include(x => x.Ingredient)
            .OrderByDescending(x => x.UpdatedAtUtc)
            .Select(x => new
            {
                ingredientId = x.IngredientId,
                ingredientName = x.Ingredient.CanonicalName,
                quantity = x.Quantity,
                unit = x.Unit,
                updatedAtUtc = x.UpdatedAtUtc
            })
            .ToListAsync();

        var ingredientIds = items.Select(x => x.ingredientId).ToHashSet();
        var latestReceiptLines = ingredientIds.Count == 0
            ? []
            : await _appDb.ClientPantryReceiptLines
                .AsNoTracking()
                .Where(x => ingredientIds.Contains(x.IngredientId) && x.Receipt.ClientId == clientId)
                .OrderByDescending(x => x.Receipt.SavedAtUtc)
                .ThenBy(x => x.SortOrder)
                .Select(x => new
                {
                    x.IngredientId,
                    receiptId = x.ReceiptId,
                    savedAtUtc = x.Receipt.SavedAtUtc,
                    rawLine = x.RawLine,
                    productName = x.ProductName,
                    quantity = x.Quantity,
                    unit = x.Unit,
                    unitPrice = x.UnitPrice,
                    lineTotal = x.LineTotal,
                    currency = x.Currency,
                })
                .ToListAsync();

        var latestByIngredient = latestReceiptLines
            .GroupBy(x => x.IngredientId)
            .ToDictionary(g => g.Key, g => g.First());

        return items
            .Select(x => new
            {
                x.ingredientId,
                x.ingredientName,
                x.quantity,
                x.unit,
                x.updatedAtUtc,
                lastReceiptLine = latestByIngredient.TryGetValue(x.ingredientId, out var line)
                    ? new
                    {
                        line.receiptId,
                        line.savedAtUtc,
                        line.rawLine,
                        line.productName,
                        line.quantity,
                        line.unit,
                        line.unitPrice,
                        line.lineTotal,
                        line.currency,
                    }
                    : null,
            })
            .Cast<object>()
            .ToList();
    }

    private async Task<Guid?> GetActiveDietitianIdAsync(Guid clientId)
    {
        return await _appDb.Clients
            .AsNoTracking()
            .Where(x => x.Id == clientId)
            .Select(x => x.ActiveDietitianId)
            .FirstOrDefaultAsync();
    }

    private static string NormalizePantrySource(string? sourceType)
    {
        var normalized = sourceType?.Trim().ToLowerInvariant();
        return normalized switch
        {
            "barcode" => "barcode",
            "photo" => "photo",
            "receipt" => "receipt",
            _ => "manual"
        };
    }

    private static List<PantryReceiptLineRequest> NormalizeReceiptLines(
        PantryReceiptRequest? receipt,
        HashSet<Guid> selectedIngredientIds)
    {
        if (receipt?.Lines == null || selectedIngredientIds.Count == 0)
            return [];

        return receipt.Lines
            .Where(line =>
                selectedIngredientIds.Contains(line.IngredientId)
                && !string.IsNullOrWhiteSpace(line.RawLine)
                && !string.IsNullOrWhiteSpace(line.ProductName))
            .Select((line, index) => line with
            {
                RawLine = line.RawLine.Trim(),
                ProductName = line.ProductName.Trim(),
                Unit = string.IsNullOrWhiteSpace(line.Unit) ? null : line.Unit.Trim(),
                Currency = NormalizeCurrency(line.Currency) ?? "TRY",
                SortOrder = line.SortOrder >= 0 ? line.SortOrder : index,
            })
            .OrderBy(line => line.SortOrder)
            .Take(80)
            .ToList();
    }

    private static DateTime? NormalizeUtc(DateTime? value)
    {
        if (!value.HasValue)
            return null;

        return value.Value.Kind switch
        {
            DateTimeKind.Utc => value.Value,
            DateTimeKind.Local => value.Value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value.Value, DateTimeKind.Utc),
        };
    }

    private static string? NormalizeCurrency(string? currency)
    {
        if (string.IsNullOrWhiteSpace(currency))
            return null;

        var normalized = currency.Trim().ToUpperInvariant();
        return normalized is "\u20BA" or "TL" ? "TRY" : normalized;
    }
}

public sealed record PantryItemRequest(Guid IngredientId, decimal? Quantity, string? Unit);

public sealed record PantryReceiptLineRequest(
    Guid IngredientId,
    string RawLine,
    string ProductName,
    decimal? Quantity,
    string? Unit,
    decimal? UnitPrice,
    decimal? LineTotal,
    string? Currency,
    int SortOrder);

public sealed record PantryReceiptRequest(
    Guid? SessionId,
    DateTime? SavedAtUtc,
    DateTime? ReceiptDate,
    string? StoreName,
    string? Currency,
    decimal? TotalAmount,
    IReadOnlyList<PantryReceiptLineRequest> Lines);

public sealed record ReplacePantryRequest(
    IReadOnlyList<PantryItemRequest> Items,
    string? SourceType = null,
    PantryReceiptRequest? Receipt = null);

public sealed record AnalyzeReceiptRequest(string? Base64Image, string? MediaType = "image/jpeg");
