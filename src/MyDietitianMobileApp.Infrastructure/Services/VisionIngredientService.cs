using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using MyDietitianMobileApp.Domain.Services;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace MyDietitianMobileApp.Infrastructure.Services;

/// <summary>
/// GPT-4o Vision-based ingredient and receipt reader.
/// </summary>
public sealed class VisionIngredientService : IVisionIngredientService
{
    private static readonly JsonSerializerOptions LaxJsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        AllowTrailingCommas = true,
    };

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly VisionIngredientOptions _options;
    private readonly ILogger<VisionIngredientService> _logger;

    public VisionIngredientService(
        IHttpClientFactory httpClientFactory,
        VisionIngredientOptions options,
        ILogger<VisionIngredientService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _options = options;
        _logger = logger;
    }

    public VisionFeatureStatus GetStatus()
    {
        var key = _options.ApiKey ?? Environment.GetEnvironmentVariable(_options.ApiKeyEnvVar);
        return string.IsNullOrWhiteSpace(key)
            ? VisionFeatureStatus.ApiKeyMissing
            : VisionFeatureStatus.Active;
    }

    public Task<VisionDetectionResult> DetectFoodNamesAsync(
        string base64Image,
        string mediaType,
        CancellationToken cancellationToken = default)
    {
        var prompt =
            "Gorselde acikca gorulen veya okunabilir etikette yazan yiyecekleri tani. " +
            "Ambalajli urunde yalnizca etikette/ambalajda okunan gida turunu kullan; icerigini tahmin etme. " +
            "Gorduklerini yaz, gormedigini yazma, eksik gorunenleri tamamlama. Turkce, kucuk harf, tekil. " +
            "JSON: {\"items\":[\"domates\",\"marul\"]}.";

        return DetectItemsAsync(
            base64Image,
            mediaType,
            prompt,
            "Vision ingredient detection",
            expectReceiptRows: false,
            maxTokens: 180,
            imageDetail: "low",
            cancellationToken: cancellationToken);
    }

    public Task<VisionDetectionResult> DetectReceiptItemsAsync(
        string base64Image,
        string mediaType,
        CancellationToken cancellationToken = default)
    {
        const string prompt =
            "Bu gorsel bir market fisi. Sadece fiste metin olarak okunan urun satirlarini cikar; gorselde/fiste yazmayan hicbir urunu tahmin etme, tamamlama veya oneri olarak ekleme. " +
            "Her satir icin rawLine alanina fiste okudugun satiri aynen yaz. ProductName alanina yalnizca o satirdan temizlenmis urun adini yaz. " +
            "Fiyat, adet, KDV, kampanya, toplam, nakit, para ustu, tarih, saat, kasa, fis no ve magaza bilgisi gibi satirlari urun yapma. " +
            "Temizlik, kozmetik, kagit, ev gereci ve yenilemeyen urunlerde isFood=false yaz ve excludedReason doldur. " +
            "Yenilebilir mutfak urunlerinde isFood=true yaz. Marka varsa mumkunse sadelestir; urun turunu koru. " +
            "Satirda acikca okunuyorsa unitPrice, lineTotal ve currency alanlarini doldur; okunmuyorsa null birak. " +
            "Ornek: 'PINAR TAM YAGLI SUT 1L' -> 'sut', 'BANVIT TAVUK GOGSU' -> 'tavuk gogsu'. " +
            "Turkce, kucuk harf, kisa ve acik yaz. JSON: {\"items\":[{\"rawLine\":\"Domates 0,75 kg x 32,90 32,90\",\"productName\":\"domates\",\"quantity\":0.75,\"unit\":\"kg\",\"unitPrice\":32.90,\"lineTotal\":32.90,\"currency\":\"TRY\",\"isFood\":true,\"excludedReason\":null},{\"rawLine\":\"Yumusatici 1,5 L x 69,90 69,90\",\"productName\":\"yumusatici\",\"quantity\":1.5,\"unit\":\"l\",\"unitPrice\":69.90,\"lineTotal\":69.90,\"currency\":\"TRY\",\"isFood\":false,\"excludedReason\":\"non_food\"}]}.";

        return DetectItemsAsync(
            base64Image,
            mediaType,
            prompt,
            "Receipt ingredient detection",
            expectReceiptRows: true,
            maxTokens: 3000,
            imageDetail: "high",
            cancellationToken: cancellationToken);
    }

    private async Task<VisionDetectionResult> DetectItemsAsync(
        string base64Image,
        string mediaType,
        string systemPrompt,
        string operationName,
        bool expectReceiptRows,
        int maxTokens,
        string imageDetail,
        CancellationToken cancellationToken)
    {
        try
        {
            var apiKey = _options.ApiKey ?? Environment.GetEnvironmentVariable(_options.ApiKeyEnvVar);
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                _logger.LogWarning("{Operation} skipped: OPENAI_API_KEY is not configured.", operationName);
                return VisionDetectionResult.Empty;
            }

            var approxBytes = GetApproxBytes(base64Image);
            if (approxBytes > _options.MaxImageBytes)
            {
                _logger.LogWarning(
                    "{Operation}: image too large ({Bytes} bytes approx, max {Max}). Skipping.",
                    operationName,
                    approxBytes,
                    _options.MaxImageBytes);
                return VisionDetectionResult.ImageTooLarge;
            }

            if (approxBytes > _options.TargetImageBytes)
            {
                var normalized = await TryNormalizeImageAsync(
                    base64Image,
                    operationName,
                    cancellationToken);
                if (normalized is not null)
                {
                    base64Image = normalized.Base64Image;
                    mediaType = normalized.MediaType;
                    approxBytes = normalized.ApproxBytes;
                }
            }

            var dataUri = $"data:{mediaType};base64,{base64Image}";

            var requestBody = new
            {
                model = _options.ModelName,
                max_tokens = maxTokens,
                temperature = 0.0,
                response_format = new { type = "json_object" },
                messages = new object[]
                {
                    new
                    {
                        role = "system",
                        content = systemPrompt,
                    },
                    new
                    {
                        role = "user",
                        content = new object[]
                        {
                            new
                            {
                                type = "image_url",
                                image_url = new
                                {
                                    url = dataUri,
                                    detail = imageDetail,
                                }
                            }
                        }
                    }
                }
            };

            var client = _httpClientFactory.CreateClient("openai");
            var request = new HttpRequestMessage(HttpMethod.Post, "v1/chat/completions")
            {
                Content = new StringContent(
                    JsonSerializer.Serialize(requestBody),
                    Encoding.UTF8,
                    "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(_options.TimeoutSeconds));

            var response = await client.SendAsync(request, cts.Token);
            var responseBody = await response.Content.ReadAsStringAsync(cts.Token);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "{Operation} API error {Status}: {Body}",
                    operationName,
                    response.StatusCode,
                    responseBody);
                return VisionDetectionResult.Empty;
            }

            return ParseResult(responseBody, expectReceiptRows);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "{Operation} threw an exception. Returning empty list.", operationName);
            return VisionDetectionResult.Empty;
        }
    }

    private static long GetApproxBytes(string base64Image)
        => (long)base64Image.Length * 3 / 4;

    private async Task<NormalizedImage?> TryNormalizeImageAsync(
        string base64Image,
        string operationName,
        CancellationToken cancellationToken)
    {
        var candidates = new[]
        {
            new { Width = 1600, Quality = 75 },
            new { Width = 1280, Quality = 65 },
            new { Width = 1024, Quality = 60 },
        };

        try
        {
            var sourceBytes = Convert.FromBase64String(base64Image);
            NormalizedImage? best = null;

            foreach (var candidate in candidates)
            {
                using var image = Image.Load(sourceBytes);
                if (image.Width > candidate.Width)
                {
                    image.Mutate(ctx => ctx.Resize(new ResizeOptions
                    {
                        Mode = ResizeMode.Max,
                        Size = new Size(candidate.Width, 0),
                    }));
                }

                await using var stream = new MemoryStream();
                await image.SaveAsJpegAsync(
                    stream,
                    new JpegEncoder { Quality = candidate.Quality },
                    cancellationToken);

                var normalizedBytes = stream.ToArray();
                best = new NormalizedImage(
                    Convert.ToBase64String(normalizedBytes),
                    "image/jpeg",
                    normalizedBytes.Length);

                if (best.ApproxBytes <= _options.TargetImageBytes)
                {
                    break;
                }
            }

            if (best is not null)
            {
                _logger.LogInformation(
                    "{Operation}: normalized image to {Bytes} bytes approx (target {Target}).",
                    operationName,
                    best.ApproxBytes,
                    _options.TargetImageBytes);
            }

            return best;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "{Operation}: image normalization failed. Continuing with original image.", operationName);
            return null;
        }
    }

    private VisionDetectionResult ParseResult(string responseBody, bool expectReceiptRows)
    {
        try
        {
            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement;

            var promptTokens = 0;
            var completionTokens = 0;
            if (root.TryGetProperty("usage", out var usage))
            {
                if (usage.TryGetProperty("prompt_tokens", out var pt)) promptTokens = pt.GetInt32();
                if (usage.TryGetProperty("completion_tokens", out var ct)) completionTokens = ct.GetInt32();
            }

            var choice = root.GetProperty("choices")[0];
            var finishReason = choice.TryGetProperty("finish_reason", out var finish)
                ? finish.GetString()
                : null;

            _logger.LogInformation(
                "Vision API usage: model={Model} prompt_tokens={Prompt} completion_tokens={Completion} total={Total} finish_reason={FinishReason}",
                _options.ModelName,
                promptTokens,
                completionTokens,
                promptTokens + completionTokens,
                finishReason);

            if (string.Equals(finishReason, "length", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning(
                    "Vision response was truncated by max_tokens. Increase receipt maxTokens or simplify the receipt schema.");
            }

            var content = choice
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? string.Empty;

            var parsed = JsonSerializer.Deserialize<VisionRawResponse>(content, LaxJsonOptions);
            var items = Array.Empty<string>() as IReadOnlyList<string>;
            var receiptItems = Array.Empty<VisionReceiptItem>() as IReadOnlyList<VisionReceiptItem>;

            if (parsed?.Items is not null && parsed.Items.Count > 0)
            {
                if (expectReceiptRows)
                {
                    receiptItems = parsed.Items
                        .Select(ParseReceiptItem)
                        .Where(item => !string.IsNullOrWhiteSpace(item.RawLine) && !string.IsNullOrWhiteSpace(item.ProductName))
                        .Take(Math.Max(_options.MaxDetectedItems, 40))
                        .ToList()
                        .AsReadOnly();

                    items = receiptItems
                        .Where(item => item.IsFood && string.IsNullOrWhiteSpace(item.ExcludedReason))
                        .Select(item => item.ProductName.Trim())
                        .Where(s => !string.IsNullOrWhiteSpace(s))
                        .ToList()
                        .AsReadOnly();
                }
                else
                {
                    items = parsed.Items
                        .Select(ParseItemName)
                        .Where(s => !string.IsNullOrWhiteSpace(s))
                        .Select(s => s.Trim())
                        .Take(_options.MaxDetectedItems)
                        .ToList()
                        .AsReadOnly();
                }
            }

            return new VisionDetectionResult
            {
                Items = items,
                ReceiptItems = receiptItems,
                PromptTokens = promptTokens,
                CompletionTokens = completionTokens,
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse vision response.");
            return VisionDetectionResult.Empty;
        }
    }

    private sealed class VisionRawResponse
    {
        [JsonPropertyName("items")]
        public List<JsonElement>? Items { get; set; }
    }

    private static string ParseItemName(JsonElement item)
    {
        return item.ValueKind == JsonValueKind.String
            ? item.GetString() ?? string.Empty
            : GetString(item, "productName") ?? GetString(item, "name") ?? string.Empty;
    }

    private static VisionReceiptItem ParseReceiptItem(JsonElement item)
    {
        if (item.ValueKind == JsonValueKind.String)
        {
            var value = item.GetString()?.Trim() ?? string.Empty;
            return new VisionReceiptItem
            {
                RawLine = value,
                ProductName = value,
                IsFood = true,
            };
        }

        if (item.ValueKind != JsonValueKind.Object)
            return new VisionReceiptItem();

        return new VisionReceiptItem
        {
            RawLine = GetString(item, "rawLine") ?? string.Empty,
            ProductName = GetString(item, "productName") ?? GetString(item, "name") ?? string.Empty,
            Quantity = GetDecimal(item, "quantity"),
            Unit = GetString(item, "unit"),
            UnitPrice = GetDecimal(item, "unitPrice"),
            LineTotal = GetDecimal(item, "lineTotal"),
            Currency = GetString(item, "currency"),
            IsFood = GetBool(item, "isFood") ?? true,
            ExcludedReason = GetString(item, "excludedReason"),
        };
    }

    private static string? GetString(JsonElement item, string propertyName)
    {
        return item.TryGetProperty(propertyName, out var value) && value.ValueKind != JsonValueKind.Null
            ? value.ToString()?.Trim()
            : null;
    }

    private static bool? GetBool(JsonElement item, string propertyName)
    {
        if (!item.TryGetProperty(propertyName, out var value))
            return null;

        if (value.ValueKind is JsonValueKind.True or JsonValueKind.False)
            return value.GetBoolean();

        return bool.TryParse(value.ToString(), out var parsed) ? parsed : null;
    }

    private static decimal? GetDecimal(JsonElement item, string propertyName)
    {
        if (!item.TryGetProperty(propertyName, out var value) || value.ValueKind == JsonValueKind.Null)
            return null;

        if (value.ValueKind == JsonValueKind.Number && value.TryGetDecimal(out var number))
            return number;

        var raw = value.ToString()?.Replace(',', '.');
        return decimal.TryParse(raw, System.Globalization.NumberStyles.Number, System.Globalization.CultureInfo.InvariantCulture, out var parsed)
            ? parsed
            : null;
    }

    private sealed record NormalizedImage(string Base64Image, string MediaType, long ApproxBytes);
}
