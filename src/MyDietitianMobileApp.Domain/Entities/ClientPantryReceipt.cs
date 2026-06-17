namespace MyDietitianMobileApp.Domain.Entities;

public class ClientPantryReceipt
{
    public Guid Id { get; private set; }
    public Guid ClientId { get; private set; }
    public Guid? SessionId { get; private set; }
    public DateTime SavedAtUtc { get; private set; }
    public DateTime? ReceiptDate { get; private set; }
    public string? StoreName { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public decimal? TotalAmount { get; private set; }

    public Client Client { get; private set; } = null!;
    public IReadOnlyCollection<ClientPantryReceiptLine> Lines => _lines.AsReadOnly();

    private readonly List<ClientPantryReceiptLine> _lines = new();

    private ClientPantryReceipt() { }

    public ClientPantryReceipt(
        Guid id,
        Guid clientId,
        Guid? sessionId,
        DateTime savedAtUtc,
        DateTime? receiptDate,
        string? storeName,
        string? currency,
        decimal? totalAmount)
    {
        Id = id;
        ClientId = clientId;
        SessionId = sessionId;
        SavedAtUtc = savedAtUtc;
        ReceiptDate = receiptDate;
        StoreName = string.IsNullOrWhiteSpace(storeName) ? null : storeName.Trim();
        Currency = NormalizeCurrency(currency);
        TotalAmount = totalAmount;
    }

    public void AddLine(ClientPantryReceiptLine line)
    {
        _lines.Add(line);
    }

    private static string NormalizeCurrency(string? currency)
    {
        if (string.IsNullOrWhiteSpace(currency))
            return "TRY";

        var normalized = currency.Trim().ToUpperInvariant();
        return normalized is "\u20BA" or "TL" ? "TRY" : normalized;
    }
}
