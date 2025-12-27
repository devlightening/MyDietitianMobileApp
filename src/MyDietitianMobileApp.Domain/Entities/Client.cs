namespace MyDietitianMobileApp.Domain.Entities
{
    public class Client
    {
        public override bool Equals(object obj)
        {
            if (obj is not Client other) return false;
            return Id == other.Id;
        }
        public override int GetHashCode() => Id.GetHashCode();
        public Guid Id { get; private set; }
        public string FullName { get; private set; }
        public Guid? ActiveDietitianId { get; private set; }
        public DateTime? ProgramStartDate { get; private set; }
        public DateTime? ProgramEndDate { get; private set; }
        public bool IsActive { get; private set; }
        public IReadOnlyCollection<AccessKey> AccessKeys => _accessKeys.AsReadOnly();

        private readonly List<AccessKey> _accessKeys = new();

        public Client(Guid id, string fullName, bool isActive)
        {
            Id = id;
            FullName = fullName;
            IsActive = isActive;
        }

        public void SetActiveDietitian(Guid dietitianId, DateTime startDate, DateTime endDate)
        {
            ActiveDietitianId = dietitianId;
            ProgramStartDate = startDate;
            ProgramEndDate = endDate;
        }

        public void Activate() => IsActive = true;
        public void Deactivate() => IsActive = false;

        public void AddAccessKey(AccessKey key)
        {
            if (_accessKeys.Any(k => k.Id == key.Id))
                return;
            if (key.IsActive && _accessKeys.Any(k => k.IsActive && k.DietitianId == key.DietitianId))
                throw new InvalidOperationException("Only one active access key is allowed per client-dietitian pair.");
            _accessKeys.Add(key);
        }
    }
}
