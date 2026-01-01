namespace MyDietitianMobileApp.Domain.Entities
{
    /// <summary>
    /// Configurable scoring configuration for compliance calculation.
    /// Allows per-dietitian or per-plan customization in the future.
    /// </summary>
    public class ComplianceScoreConfig
    {
        public Guid Id { get; private set; }
        public Guid? DietitianId { get; private set; } // null = global default
        public Guid? DietPlanId { get; private set; } // null = dietitian default
        
        // Scoring points
        public int MandatoryDone { get; private set; } = 10;
        public int MandatoryAlternative { get; private set; } = 7;
        public int MandatorySkipped { get; private set; } = 0;
        public int OptionalDone { get; private set; } = 3;
        public int OptionalSkipped { get; private set; } = 0;

        public bool IsDefault => DietitianId == null && DietPlanId == null;
        public bool IsDietitianDefault => DietitianId != null && DietPlanId == null;
        public bool IsPlanSpecific => DietPlanId != null;

        public ComplianceScoreConfig(
            Guid id,
            int mandatoryDone = 10,
            int mandatoryAlternative = 7,
            int mandatorySkipped = 0,
            int optionalDone = 3,
            int optionalSkipped = 0,
            Guid? dietitianId = null,
            Guid? dietPlanId = null)
        {
            if (mandatoryDone < 0 || mandatoryAlternative < 0 || optionalDone < 0)
                throw new ArgumentException("Score values cannot be negative.");
            
            if (dietPlanId != null && dietitianId == null)
                throw new ArgumentException("DietPlanId requires DietitianId.");
            
            Id = id;
            DietitianId = dietitianId;
            DietPlanId = dietPlanId;
            MandatoryDone = mandatoryDone;
            MandatoryAlternative = mandatoryAlternative;
            MandatorySkipped = mandatorySkipped;
            OptionalDone = optionalDone;
            OptionalSkipped = optionalSkipped;
        }

        public void UpdateScores(
            int? mandatoryDone = null,
            int? mandatoryAlternative = null,
            int? mandatorySkipped = null,
            int? optionalDone = null,
            int? optionalSkipped = null)
        {
            if (mandatoryDone.HasValue && mandatoryDone.Value < 0)
                throw new ArgumentException("MandatoryDone cannot be negative.");
            if (mandatoryAlternative.HasValue && mandatoryAlternative.Value < 0)
                throw new ArgumentException("MandatoryAlternative cannot be negative.");
            if (optionalDone.HasValue && optionalDone.Value < 0)
                throw new ArgumentException("OptionalDone cannot be negative.");
            
            MandatoryDone = mandatoryDone ?? MandatoryDone;
            MandatoryAlternative = mandatoryAlternative ?? MandatoryAlternative;
            MandatorySkipped = mandatorySkipped ?? MandatorySkipped;
            OptionalDone = optionalDone ?? OptionalDone;
            OptionalSkipped = optionalSkipped ?? OptionalSkipped;
        }

        public override bool Equals(object obj)
        {
            if (obj is not ComplianceScoreConfig other) return false;
            return Id == other.Id;
        }

        public override int GetHashCode() => Id.GetHashCode();
    }
}

