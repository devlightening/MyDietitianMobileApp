using MyDietitianMobileApp.Domain.Entities;
using MediatR;

namespace MyDietitianMobileApp.Application.Queries
{
    public class GetDietPlanByClientQuery : IRequest<GetDietPlanByClientResult?>
    {
        public Guid DietitianId { get; }
        public Guid ClientId { get; }
        public bool ActiveOnly { get; }

        public GetDietPlanByClientQuery(Guid dietitianId, Guid clientId, bool activeOnly = true)
        {
            DietitianId = dietitianId;
            ClientId = clientId;
            ActiveOnly = activeOnly;
        }
    }

    public class GetDietPlanByClientResult
    {
        public Guid DietPlanId { get; set; }
        public Guid DietitianId { get; set; }
        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DietPlanStatus Status { get; set; }
        public List<DietPlanDayDto> Days { get; set; } = new();
    }

    public class DietPlanDayDto
    {
        public Guid Id { get; set; }
        public DateOnly Date { get; set; }
        public int? DailyTargetCalories { get; set; }
        public List<DietPlanMealDto> Meals { get; set; } = new();
    }

    public class DietPlanMealDto
    {
        public Guid Id { get; set; }
        public MealType Type { get; set; }
        public Guid? PlannedRecipeId { get; set; }
        public string? PlannedRecipeName { get; set; }
        public string? CustomName { get; set; }
        public bool IsMandatory { get; set; }
    }
}
