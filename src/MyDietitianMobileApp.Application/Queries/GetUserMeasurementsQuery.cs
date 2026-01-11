using MediatR;

namespace MyDietitianMobileApp.Application.Queries;

public class GetUserMeasurementsQuery : IRequest<GetUserMeasurementsResult>
{
    public Guid ClientId { get; set; }
    public int? LastNDays { get; set; } // null = all, 30 = last 30 days, etc.
}

public class GetUserMeasurementsResult
{
    public List<UserMeasurementDto> Measurements { get; set; } = new();
    public UserMeasurementDto? Latest { get; set; }
}

public class UserMeasurementDto
{
    public decimal WeightKg { get; set; }
    public int HeightCm { get; set; }
    public decimal Bmi { get; set; }
    public decimal Bmr { get; set; }
    public DateTime CreatedAt { get; set; }
    public string BmiCategory { get; set; } = string.Empty; // "Normal", "Overweight", etc.
}
