using MediatR;
using MyDietitianMobileApp.Application.Commands;
using MyDietitianMobileApp.Domain.Enums;
using MyDietitianMobileApp.Domain.Services;
using Microsoft.Extensions.Logging;
using System.Globalization;
using System.Text.RegularExpressions;

namespace MyDietitianMobileApp.Application.Handlers;

/// <summary>
/// Orchestrates: vision detection → parallel resolver (VisionLabelMappings + normalization) → deduplication.
/// </summary>
public class AnalyzeIngredientImageCommandHandler
    : IRequestHandler<AnalyzeIngredientImageCommand, AnalyzeIngredientImageResult>
{
    private readonly IVisionIngredientService _visionService;
    private readonly IIngredientDetectionResolver _resolver;
    private readonly VisionIngredientOptions _visionOptions;
    private readonly ILogger<AnalyzeIngredientImageCommandHandler> _logger;

    public AnalyzeIngredientImageCommandHandler(
        IVisionIngredientService visionService,
        IIngredientDetectionResolver resolver,
        VisionIngredientOptions visionOptions,
        ILogger<AnalyzeIngredientImageCommandHandler> logger)
    {
        _visionService = visionService;
        _resolver = resolver;
        _visionOptions = visionOptions;
        _logger = logger;
    }

    public async Task<AnalyzeIngredientImageResult> Handle(
        AnalyzeIngredientImageCommand request,
        CancellationToken cancellationToken)
    {
        var sessionId = Guid.NewGuid();

        // Step 0: Fail-fast if feature is not available — return a meaningful status
        var featureStatus = _visionService.GetStatus();
        if (featureStatus != VisionFeatureStatus.Active)
        {
            _logger.LogInformation(
                "Vision ingredient detection skipped: feature status = {Status}.", featureStatus);
            return new AnalyzeIngredientImageResult
            {
                SessionId     = sessionId,
                TotalDetected = 0,
                FeatureStatus = featureStatus.ToString().ToLowerInvariant(),
                // "active" | "disabled" | "apikeymissing" — matches VisionFeatureStatus type in vision.ts
            };
        }

        var closedSet = _visionOptions.ClosedSetCanonicalNames
            .Select(IngredientAcquisitionPolicy.NormalizeLookupKey)
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .ToHashSet(StringComparer.Ordinal);

        // Step 1: Call vision service — get raw food name strings + token usage
        var detectionResult = request.ScanKind == VisionScanKind.Receipt
            ? await _visionService.DetectReceiptItemsAsync(
                request.Base64Image, request.MediaType, cancellationToken)
            : await _visionService.DetectFoodNamesAsync(
                request.Base64Image, request.MediaType, cancellationToken);
        if (detectionResult.Reason == "image_too_large")
        {
            _logger.LogWarning(
                "Image analysis aborted: image too large. SessionId={SessionId}", sessionId);
            return new AnalyzeIngredientImageResult
            {
                SessionId     = sessionId,
                TotalDetected = 0,
                FeatureStatus = "active",
                Reason        = "image_too_large",
                UserMessage   = "Fotoğraf çok büyük. Lütfen daha küçük bir fotoğraf seçin.",
            };
        }

        var receiptRows = request.ScanKind == VisionScanKind.Receipt
            ? detectionResult.ReceiptItems
                .Select(NormalizeReceiptRow)
                .ToList()
            : new List<ReceiptScanRowDto>();

        var excludedRows = request.ScanKind == VisionScanKind.Receipt
            ? receiptRows
                .Where(row => !row.IsFood || !string.IsNullOrWhiteSpace(row.ExcludedReason))
                .ToList()
            : new List<ReceiptScanRowDto>();

        var candidateLabels = request.ScanKind == VisionScanKind.Receipt
            ? receiptRows
                .Where(row => row.IsFood && string.IsNullOrWhiteSpace(row.ExcludedReason))
                .Select(row => (rawName: row.ProductName, receiptRow: (ReceiptScanRowDto?)row))
                .Where(row => !string.IsNullOrWhiteSpace(row.rawName) && !string.IsNullOrWhiteSpace(row.receiptRow?.RawLine))
                .ToList()
            : detectionResult.Items
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Select(name => (rawName: name, receiptRow: (ReceiptScanRowDto?)null))
                .ToList();

        if (candidateLabels.Count == 0)
        {
            _logger.LogInformation("Vision returned no items for the provided image.");
            return new AnalyzeIngredientImageResult
            {
                SessionId        = sessionId,
                TotalDetected    = 0,
                FeatureStatus    = "active",
                ReceiptRows      = receiptRows,
                Excluded         = excludedRows,
                PromptTokens     = detectionResult.PromptTokens,
                CompletionTokens = detectionResult.CompletionTokens,
            };
        }

        _logger.LogInformation("Vision detected {Count} raw food names.", candidateLabels.Count);

        // Step 2: Resolve each label sequentially.
        // AppDbContext is not thread-safe — concurrent Task.WhenAll calls on the same scoped context
        // throw "A second operation was started on this context instance before a previous operation completed."
        var results = new List<(string rawName, ReceiptScanRowDto? receiptRow, DetectionResolverResult resolveResult)>();
        foreach (var (name, receiptRow) in candidateLabels)
        {
            _logger.LogInformation(
                "Vision resolve: rawLabel='{Raw}' rawLine='{RawLine}' startedResolution=true",
                name,
                receiptRow?.RawLine);

            var resolveResult = await _resolver.ResolveAsync(
                name,
                sessionId,
                allowSemanticFallback: false,
                cancellationToken);

            _logger.LogInformation(
                "Vision resolve: rawLabel='{Raw}' normalizedLabel='{Norm}' completedResolution=true matchType={MatchType} matched={Matched} confidence={Conf:F2} autoSelected={Auto}",
                name,
                resolveResult.NormalizedLabel,
                resolveResult.MatchType,
                resolveResult.MatchedIngredientId.HasValue,
                resolveResult.Confidence,
                resolveResult.IsAutoSelected);

            results.Add((rawName: name, receiptRow, resolveResult));
        }

        // Step 3: Split matched vs unmatched; apply closed-set filter
        var matched = new List<DetectedIngredientDto>();
        var unmatched = new List<string>();

        foreach (var (rawName, receiptRow, resolveResult) in results)
        {
            if (resolveResult.MatchType == "unresolved"
                || !resolveResult.MatchedIngredientId.HasValue
                || string.IsNullOrWhiteSpace(resolveResult.MatchedIngredientName))
            {
                unmatched.Add(rawName);
                continue;
            }

            // Closed-set enforcement: only active when EnforceClosedSetInResolver = true.
            // Default (false): resolver returns any match from the full Ingredients table.
            // Set to true only in controlled Faz 1 demos requiring strict closed-set behavior.
            if (_visionOptions.EnforceClosedSetInResolver && closedSet.Count > 0)
            {
                var canonicalKey = IngredientAcquisitionPolicy.NormalizeLookupKey(resolveResult.MatchedIngredientName);
                if (!closedSet.Contains(canonicalKey))
                {
                    unmatched.Add(rawName);
                    continue;
                }
            }

            matched.Add(new DetectedIngredientDto
            {
                IngredientId         = resolveResult.MatchedIngredientId.Value,
                CanonicalName        = resolveResult.MatchedIngredientName,
                Confidence           = resolveResult.Confidence,
                DetectedName         = rawName,
                RawLine              = receiptRow?.RawLine,
                Quantity             = receiptRow?.Quantity,
                Unit                 = receiptRow?.Unit,
                UnitPrice            = receiptRow?.UnitPrice,
                LineTotal            = receiptRow?.LineTotal,
                Currency             = receiptRow?.Currency,
                NormalizedLabel      = resolveResult.NormalizedLabel,
                MatchedBy            = resolveResult.MatchType,
                MappingType          = MappingType.ExactIngredient,
                IsAutoSelected       = resolveResult.IsAutoSelected,
                RequiresConfirmation = resolveResult.RequiresReview,
            });
        }

        // Step 4: Deduplicate — same IngredientId from different raw names → keep highest confidence
        var deduped = matched
            .GroupBy(m => m.IngredientId)
            .Select(g => g.OrderByDescending(m => m.Confidence).First())
            .ToList();

        _logger.LogInformation(
            "Image analysis complete: {Matched} matched ({AutoSelected} auto-selected), {Unmatched} unmatched (from {Total} detected).",
            deduped.Count,
            deduped.Count(m => !m.RequiresConfirmation),
            unmatched.Count,
            candidateLabels.Count);

        return new AnalyzeIngredientImageResult
        {
            SessionId        = sessionId,
            Matched          = deduped,
            Unmatched        = unmatched,
            ReceiptRows      = receiptRows,
            Excluded         = excludedRows,
            TotalDetected    = candidateLabels.Count,
            FeatureStatus    = "active",
            PromptTokens     = detectionResult.PromptTokens,
            CompletionTokens = detectionResult.CompletionTokens,
        };
    }

    private static ReceiptScanRowDto NormalizeReceiptRow(VisionReceiptItem item)
    {
        var rawLine = item.RawLine?.Trim() ?? string.Empty;
        var productName = item.ProductName?.Trim() ?? string.Empty;
        var excludedReason = FirstNonEmpty(item.ExcludedReason, GetDeterministicExclusionReason(productName, rawLine));
        var isFood = item.IsFood && string.IsNullOrWhiteSpace(excludedReason);
        var prices = ParsePricesFromRawLine(rawLine);

        return new ReceiptScanRowDto
        {
            RawLine = rawLine,
            ProductName = productName,
            Quantity = item.Quantity,
            Unit = item.Unit?.Trim(),
            UnitPrice = prices.UnitPrice ?? item.UnitPrice,
            LineTotal = prices.LineTotal ?? item.LineTotal,
            Currency = prices.Currency ?? NormalizeCurrency(item.Currency),
            IsFood = isFood,
            ExcludedReason = excludedReason,
        };
    }

    private static ReceiptPriceInfo ParsePricesFromRawLine(string rawLine)
    {
        if (string.IsNullOrWhiteSpace(rawLine))
            return new ReceiptPriceInfo(null, null, null);

        var currency = rawLine.Contains('\u20BA') || rawLine.Contains("TL", StringComparison.OrdinalIgnoreCase)
            ? "TRY"
            : null;
        var priceSegment = Regex.Split(rawLine, @"\s[xX]\s").LastOrDefault() ?? rawLine;
        var matches = Regex.Matches(priceSegment, @"(?:\u20BA|TL|TRY)?\s*(\d{1,6}(?:[.,]\d{3})*[.,]\d{2}|\d+[.,]\d{2})", RegexOptions.IgnoreCase)
            .Select(match => ParseTurkishMoney(match.Groups[1].Value))
            .Where(value => value.HasValue)
            .Select(value => value!.Value)
            .ToList();

        if (matches.Count == 0)
            return new ReceiptPriceInfo(null, null, currency);

        if (matches.Count == 1)
            return new ReceiptPriceInfo(null, matches[0], currency ?? "TRY");

        return new ReceiptPriceInfo(matches[^2], matches[^1], currency ?? "TRY");
    }

    private static decimal? ParseTurkishMoney(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return null;

        var normalized = raw.Trim().Replace(" ", string.Empty);
        if (normalized.Contains(','))
        {
            normalized = normalized.Replace(".", string.Empty).Replace(',', '.');
        }

        return decimal.TryParse(normalized, NumberStyles.Number, CultureInfo.InvariantCulture, out var value)
            ? value
            : null;
    }

    private static string? NormalizeCurrency(string? currency)
    {
        if (string.IsNullOrWhiteSpace(currency))
            return null;

        var normalized = currency.Trim().ToUpperInvariant();
        return normalized is "\u20BA" or "TL" or "TRY" ? "TRY" : normalized;
    }

    private sealed record ReceiptPriceInfo(decimal? UnitPrice, decimal? LineTotal, string? Currency);

    private static string? FirstNonEmpty(params string?[] values)
        => values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value))?.Trim();

    private static string? GetDeterministicExclusionReason(string productName, string rawLine)
    {
        var text = IngredientAcquisitionPolicy.NormalizeLookupKey($"{productName} {rawLine}");
        if (string.IsNullOrWhiteSpace(text))
            return "empty";

        var nonProductKeywords = new[]
        {
            "toplam", "nakit", "para ustu", "paraustu", "tarih", "saat", "fis no",
            "fisno", "kasa", "kdv", "vergi", "vkn", "tel", "tesekkur", "yeni urunler"
        };
        if (nonProductKeywords.Any(text.Contains))
            return "non_product_row";

        var nonFoodKeywords = new[]
        {
            "yumusatici", "yuzey temizleyici", "temizleyici", "bulasik deterjani",
            "deterjan", "temizlik bezi", "camasir suyu", "bulasik sunger",
            "sunger", "sungeri", "camasir", "kozmetik", "kagit havlu", "pecete"
        };
        if (nonFoodKeywords.Any(text.Contains))
            return "non_food";

        return null;
    }
}
