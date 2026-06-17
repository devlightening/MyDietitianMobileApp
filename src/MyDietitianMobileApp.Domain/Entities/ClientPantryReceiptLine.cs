namespace MyDietitianMobileApp.Domain.Entities;

public class ClientPantryReceiptLine
{
    public Guid Id { get; private set; }
    public Guid ReceiptId { get; private set; }
    public Guid IngredientId { get; private set; }
    public string RawLine { get; private set; } = string.Empty;
    public string ProductName { get; private set; } = string.Empty;
    public decimal? Quantity { get; private set; }
    public string? Unit { get; private set; }
    public decimal? UnitPrice { get; private set; }
    public decimal? LineTotal { get; private set; }
    public string Currency { get; private set; } = "TRY";
    public int SortOrder { get; private set; }

    public ClientPantryReceipt Receipt { get; private set; } = null!;
    public Ingredient Ingredient { get; private set; } = null!;

    private ClientPantryReceiptLine() { }

    public ClientPantryReceiptLine(
        Guid id,
        Guid receiptId,
        Guid ingredientId,
        string rawLine,
        string productName,
        decimal? quantity,
        string? unit,
        decimal? unitPrice,
        decimal? lineTotal,
        string? currency,
        int sortOrder)
    {
        Id = id;
        ReceiptId = receiptId;
        IngredientId = ingredientId;
        RawLine = rawLine.Trim();
        ProductName = productName.Trim();
        Quantity = quantity;
        Unit = string.IsNullOrWhiteSpace(unit) ? null : unit.Trim();
        UnitPrice = unitPrice;
        LineTotal = lineTotal;
        Currency = NormalizeCurrency(currency);
        SortOrder = sortOrder;
    }

    private static string NormalizeCurrency(string? currency)
    {
        if (string.IsNullOrWhiteSpace(currency))
            return "TRY";

        var normalized = currency.Trim().ToUpperInvariant();
        return normalized is "\u20BA" or "TL" ? "TRY" : normalized;
    }
}
