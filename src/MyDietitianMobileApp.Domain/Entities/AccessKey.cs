namespace MyDietitianMobileApp.Domain.Entities
{
    public class AccessKey
    {
        public Guid Id { get; private set; }
        public string Key { get; private set; }
        public Guid DietitianId { get; private set; }
        public Guid ClientId { get; private set; }
        public DateTime StartDate { get; private set; }
        public DateTime EndDate { get; private set; }
        public bool IsActive { get; private set; }

        public AccessKey(Guid id, string key, Guid dietitianId, Guid clientId, DateTime startDate, DateTime endDate, bool isActive)
        {
            Id = id;
            Key = key;
            DietitianId = dietitianId;
            ClientId = clientId;
            StartDate = startDate;
            EndDate = endDate;
            IsActive = isActive;
        }

        public bool IsValid(DateTime now)
        {
            return IsActive && now >= StartDate && now <= EndDate;
        }

        public void Deactivate() => IsActive = false;

        public override bool Equals(object obj)
        {
            if (obj is not AccessKey other) return false;
            return Id == other.Id;
        }
        public override int GetHashCode() => Id.GetHashCode();
    }
}
