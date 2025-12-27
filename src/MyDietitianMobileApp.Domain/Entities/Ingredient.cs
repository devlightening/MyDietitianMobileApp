namespace MyDietitianMobileApp.Domain.Entities
{
    public class Ingredient
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; }
        public bool IsMandatory { get; private set; }
        public bool IsProhibited { get; private set; }

        public Ingredient(Guid id, string name, bool isMandatory, bool isProhibited)
        {
            if (isMandatory && isProhibited)
                throw new ArgumentException("Ingredient cannot be both mandatory and prohibited.");
            Id = id;
            Name = name;
            IsMandatory = isMandatory;
            IsProhibited = isProhibited;
        }

        public override bool Equals(object obj)
        {
            if (obj is not Ingredient other) return false;
            return Id == other.Id;
        }
        public override int GetHashCode() => Id.GetHashCode();
    }
}
