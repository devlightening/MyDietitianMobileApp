using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using MyDietitianMobileApp.Application.Commands;
using MyDietitianMobileApp.Application.Handlers;
using MyDietitianMobileApp.Domain.Services;
using Xunit;

namespace MyDietitianMobileApp.Api.Tests.Ingredients;

public class ReceiptImageAnalysisHandlerTests
{
    [Fact]
    public async Task Receipt_Scan_Uses_Only_Evidenced_Raw_Lines_And_Excludes_Non_Food_Rows()
    {
        var vision = new FakeVisionIngredientService(new VisionDetectionResult
        {
            Items = new[] { "Pirinc", "Ekmek" },
            ReceiptItems = new[]
            {
                new VisionReceiptItem
                {
                    RawLine = "Domates 0,75 kg x \u20BA32,90 \u20BA32,90",
                    ProductName = "Domates",
                    Quantity = 0.75m,
                    Unit = "kg",
                    IsFood = true,
                },
                new VisionReceiptItem
                {
                    RawLine = "Yumusatici 1,5 L x 69,90",
                    ProductName = "Yumusatici",
                    Quantity = 1.5m,
                    Unit = "L",
                    IsFood = true,
                },
                new VisionReceiptItem
                {
                    RawLine = "",
                    ProductName = "Ekmek",
                    IsFood = true,
                },
            },
        });
        var resolver = new RecordingResolver();
        resolver.Results["Domates"] = new DetectionResolverResult
        {
            RawLabel = "Domates",
            NormalizedLabel = "domates",
            MatchedIngredientId = Guid.NewGuid(),
            MatchedIngredientName = "Domates",
            Confidence = 1.0,
            MatchType = "canonical",
            IsAutoSelected = true,
            RequiresReview = false,
        };

        var handler = new AnalyzeIngredientImageCommandHandler(
            vision,
            resolver,
            new VisionIngredientOptions(),
            NullLogger<AnalyzeIngredientImageCommandHandler>.Instance);

        var result = await handler.Handle(
            new AnalyzeIngredientImageCommand("base64", "image/jpeg", VisionScanKind.Receipt),
            CancellationToken.None);

        result.TotalDetected.Should().Be(1);
        result.Matched.Should().ContainSingle();
        result.Matched[0].CanonicalName.Should().Be("Domates");
        result.Matched[0].DetectedName.Should().Be("Domates");
        result.Matched[0].RawLine.Should().Be("Domates 0,75 kg x \u20BA32,90 \u20BA32,90");
        result.Matched[0].Quantity.Should().Be(0.75m);
        result.Matched[0].Unit.Should().Be("kg");
        result.Matched[0].UnitPrice.Should().Be(32.90m);
        result.Matched[0].LineTotal.Should().Be(32.90m);
        result.Matched[0].Currency.Should().Be("TRY");
        result.Unmatched.Should().BeEmpty();

        result.Excluded.Should().ContainSingle(row =>
            row.ProductName == "Yumusatici"
            && row.ExcludedReason == "non_food"
            && row.IsFood == false);

        resolver.Calls.Should().ContainSingle();
        resolver.Calls[0].RawLabel.Should().Be("Domates");
        resolver.Calls[0].AllowSemanticFallback.Should().BeFalse();
        resolver.Calls.Should().NotContain(call =>
            call.RawLabel == "Pirinc" || call.RawLabel == "Ekmek" || call.RawLabel == "Yumusatici");
    }

    private sealed class FakeVisionIngredientService : IVisionIngredientService
    {
        private readonly VisionDetectionResult _receiptResult;

        public FakeVisionIngredientService(VisionDetectionResult receiptResult)
        {
            _receiptResult = receiptResult;
        }

        public VisionFeatureStatus GetStatus() => VisionFeatureStatus.Active;

        public Task<VisionDetectionResult> DetectFoodNamesAsync(
            string base64Image,
            string mediaType,
            CancellationToken cancellationToken = default)
            => Task.FromResult(VisionDetectionResult.Empty);

        public Task<VisionDetectionResult> DetectReceiptItemsAsync(
            string base64Image,
            string mediaType,
            CancellationToken cancellationToken = default)
            => Task.FromResult(_receiptResult);
    }

    private sealed class RecordingResolver : IIngredientDetectionResolver
    {
        public Dictionary<string, DetectionResolverResult> Results { get; } = new(StringComparer.OrdinalIgnoreCase);

        public List<(string RawLabel, bool AllowSemanticFallback)> Calls { get; } = new();

        public Task<DetectionResolverResult> ResolveAsync(
            string rawLabel,
            Guid sessionId,
            bool allowSemanticFallback = true,
            CancellationToken cancellationToken = default)
        {
            Calls.Add((rawLabel, allowSemanticFallback));

            var normalized = rawLabel.Trim().ToLowerInvariant();
            return Task.FromResult(
                Results.TryGetValue(rawLabel, out var result)
                    ? result
                    : DetectionResolverResult.Unresolved(rawLabel, normalized));
        }
    }
}
