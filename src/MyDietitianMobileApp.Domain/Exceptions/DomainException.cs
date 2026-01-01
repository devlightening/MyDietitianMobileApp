namespace MyDietitianMobileApp.Domain.Exceptions;

/// <summary>
/// Domain-level exception with a standardized error code for API error responses.
/// Use this for business rule violations instead of generic exceptions.
/// </summary>
public class DomainException : Exception
{
    /// <summary>
    /// Error code that will be returned in the API response (e.g., "DIETITIAN_NOT_FOUND")
    /// </summary>
    public string Code { get; }

    public DomainException(string code, string message)
        : base(message)
    {
        Code = code;
    }

    public DomainException(string code, string message, Exception innerException)
        : base(message, innerException)
    {
        Code = code;
    }
}

