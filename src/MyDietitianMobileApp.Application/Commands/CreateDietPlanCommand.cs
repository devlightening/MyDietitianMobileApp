using MyDietitianMobileApp.Domain.Entities;
using MediatR;

namespace MyDietitianMobileApp.Application.Commands
{
    public class CreateDietPlanCommand : IRequest<CreateDietPlanResult>
    {
        public Guid DietitianId { get; }
        public Guid ClientId { get; }
        public string Name { get; }
        public DateTime StartDate { get; }
        public DateTime EndDate { get; }
        public List<CreateDietPlanDayDto> Days { get; }

        public CreateDietPlanCommand(
            Guid dietitianId,
            Guid clientId,
            string name,
            DateTime startDate,
            DateTime endDate,
            List<CreateDietPlanDayDto> days)
        {
            DietitianId = dietitianId;
            ClientId = clientId;
            Name = name;
            StartDate = startDate;
            EndDate = endDate;
            Days = days ?? new List<CreateDietPlanDayDto>();
        }
    }

    public class CreateDietPlanDayDto
    {
        public DateOnly Date { get; set; }
        public int? DailyTargetCalories { get; set; }
        public List<CreateDietPlanMealDto> Meals { get; set; } = new();
    }

    public class CreateDietPlanMealDto
    {
        public MealType Type { get; set; }
        public Guid? PlannedRecipeId { get; set; }
        public string? CustomName { get; set; }
        public bool IsMandatory { get; set; }
    }

    public class CreateDietPlanResult
    {
        public Guid DietPlanId { get; }
        public bool Success { get; }
        public string? ErrorMessage { get; }

        public CreateDietPlanResult(Guid dietPlanId, bool success, string? errorMessage = null)
        {
            DietPlanId = dietPlanId;
            Success = success;
            ErrorMessage = errorMessage;
        }
    }
}
