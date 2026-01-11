namespace MyDietitianMobileApp.Domain.Entities;

public class UserMeasurement
{
    public Guid Id { get; private set; }
    public Guid ClientId { get; private set; }
    
    public decimal WeightKg { get; private set; }
    public int HeightCm { get; private set; }
    
    /// <summary>
    /// Body Mass Index - calculated server-side
    /// BMI = weight / (height/100)²
    /// </summary>
    public decimal Bmi { get; private set; }
    
    /// <summary>
    /// Basal Metabolic Rate - calculated server-side
    /// Uses Mifflin-St Jeor equation
    /// </summary>
    public decimal Bmr { get; private set; }
    
    public DateTime CreatedAt { get; private set; }

    private UserMeasurement() { } // EF Core

    public UserMeasurement(
        Guid clientId,
        decimal weightKg,
        int heightCm,
        decimal bmi,
        decimal bmr)
    {
        if (weightKg <= 0 || weightKg > 500)
            throw new ArgumentException("Weight must be between 0 and 500 kg");
            
        if (heightCm <= 0 || heightCm > 300)
            throw new ArgumentException("Height must be between 0 and 300 cm");

        Id = Guid.NewGuid();
        ClientId = clientId;
        WeightKg = weightKg;
        HeightCm = heightCm;
        Bmi = bmi;
        Bmr = bmr;
        CreatedAt = DateTime.UtcNow;
    }
}
