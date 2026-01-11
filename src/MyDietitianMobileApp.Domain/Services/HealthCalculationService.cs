namespace MyDietitianMobileApp.Domain.Services;

public interface IHealthCalculationService
{
    decimal CalculateBmi(decimal weightKg, int heightCm);
    decimal CalculateBmr(decimal weightKg, int heightCm, int age, string gender);
}

public class HealthCalculationService : IHealthCalculationService
{
    public decimal CalculateBmi(decimal weightKg, int heightCm)
    {
        // BMI = weight / (height in meters)²
        decimal heightM = heightCm / 100m;
        decimal bmi = weightKg / (heightM * heightM);
        return Math.Round(bmi, 2);
    }

    public decimal CalculateBmr(decimal weightKg, int heightCm, int age, string gender)
    {
        // Mifflin-St Jeor Equation
        // Men: BMR = 10*weight + 6.25*height - 5*age + 5
        // Women: BMR = 10*weight + 6.25*height - 5*age - 161
        
        decimal bmr = 10 * weightKg + 6.25m * heightCm - 5 * age;
        
        bmr += gender.ToLower() switch
        {
            "male" => 5,
            "female" => -161,
            _ => -78 // Average if unknown
        };
        
        return Math.Round(bmr, 0);
    }
}
