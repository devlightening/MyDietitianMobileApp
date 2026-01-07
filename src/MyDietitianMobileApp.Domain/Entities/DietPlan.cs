namespace MyDietitianMobileApp.Domain.Entities
{
    public enum DietPlanStatus
    {
        Active = 1,
        Completed = 2,
        Expired = 3,
        Draft = 4
    }

    public class DietPlan
    {
        public Guid Id { get; private set; }
        public Guid DietitianId { get; private set; }
        public Guid ClientId { get; private set; }
        public string Name { get; private set; }
        public DateTime StartDate { get; private set; }
        public DateTime EndDate { get; private set; }
        public DietPlanStatus Status { get; private set; }
        public IReadOnlyCollection<DietPlanDay> Days => _days.AsReadOnly();

        private readonly List<DietPlanDay> _days = new();

        public DietPlan(Guid id, Guid dietitianId, Guid clientId, string name, DateTime startDate, DateTime endDate, DietPlanStatus status = DietPlanStatus.Draft)
        {
            if (endDate <= startDate)
                throw new ArgumentException("End date must be after start date.");
            
            Id = id;
            DietitianId = dietitianId;
            ClientId = clientId;
            Name = name;
            StartDate = startDate;
            EndDate = endDate;
            Status = status;
        }

        public void AddDay(DietPlanDay day)
        {
            if (day.DietPlanId != Id)
                throw new InvalidOperationException("Day must belong to this diet plan.");
            
            if (_days.Any(d => d.Date == day.Date))
                throw new InvalidOperationException($"Day for date {day.Date} already exists in this plan.");
            
            _days.Add(day);
        }

        public void Activate() => Status = DietPlanStatus.Active;
        public void Complete() => Status = DietPlanStatus.Completed;
        public void Expire() => Status = DietPlanStatus.Expired;

        public override bool Equals(object obj)
        {
            if (obj is not DietPlan other) return false;
            return Id == other.Id;
        }

        public override int GetHashCode() => Id.GetHashCode();
    }
}

