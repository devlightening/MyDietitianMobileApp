namespace MyDietitianMobileApp.Domain.Entities
{
    public class DietPlan
    {
        public Guid Id { get; private set; }
        public Guid DietitianId { get; private set; }
        public Guid ClientId { get; private set; }
        public string Name { get; private set; }
        public DateTime StartDate { get; private set; }
        public DateTime EndDate { get; private set; }
        public bool IsActive { get; private set; }
        public IReadOnlyCollection<DietDay> Days => _days.AsReadOnly();

        private readonly List<DietDay> _days = new();

        public DietPlan(Guid id, Guid dietitianId, Guid clientId, string name, DateTime startDate, DateTime endDate, bool isActive)
        {
            if (endDate <= startDate)
                throw new ArgumentException("End date must be after start date.");
            
            Id = id;
            DietitianId = dietitianId;
            ClientId = clientId;
            Name = name;
            StartDate = startDate;
            EndDate = endDate;
            IsActive = isActive;
        }

        public void AddDay(DietDay day)
        {
            if (day.DietPlanId != Id)
                throw new InvalidOperationException("Day must belong to this diet plan.");
            
            if (_days.Any(d => d.Date == day.Date))
                throw new InvalidOperationException($"Day for date {day.Date} already exists in this plan.");
            
            _days.Add(day);
        }

        public void Activate() => IsActive = true;
        public void Deactivate() => IsActive = false;

        public override bool Equals(object obj)
        {
            if (obj is not DietPlan other) return false;
            return Id == other.Id;
        }

        public override int GetHashCode() => Id.GetHashCode();
    }
}

