using MediatR;

namespace MyDietitianMobileApp.Application.Commands;

public class AddUserMeasurementCommand : IRequest<AddUserMeasurementResult>
{
    public Guid ClientId { get; set; }
    public decimal WeightKg { get; set; }
    public int HeightCm { get; set; }
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
}

public class AddUserMeasurementResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public decimal Bmi { get; set; }
    public decimal Bmr { get; set; }
    public DateTime CreatedAt { get; set; }
}
