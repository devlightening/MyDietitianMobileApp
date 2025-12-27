namespace MyDietitianMobileApp.Domain.Entities
{
    public class Dietitian
    {
        public override bool Equals(object obj)
        {
            if (obj is not Dietitian other) return false;
            return Id == other.Id;
        }
        public override int GetHashCode() => Id.GetHashCode();
        public Guid Id { get; private set; }
        public string FullName { get; private set; }
        public string ClinicName { get; private set; }
        public bool IsActive { get; private set; }
        public IReadOnlyCollection<Client> Clients => _clients.AsReadOnly();
        public IReadOnlyCollection<Recipe> Recipes => _recipes.AsReadOnly();

        private readonly List<Client> _clients = new();
        private readonly List<Recipe> _recipes = new();

        public Dietitian(Guid id, string fullName, string clinicName, bool isActive)
        {
            Id = id;
            FullName = fullName;
            ClinicName = clinicName;
            IsActive = isActive;
        }

        public void Activate() => IsActive = true;
        public void Deactivate() => IsActive = false;

        public void AddClient(Client client)
        {
            if (_clients.Any(c => c.Id == client.Id))
                return;
            _clients.Add(client);
        }

        public void AddRecipe(Recipe recipe)
        {
            if (_recipes.Any(r => r.Id == recipe.Id))
                return;
            _recipes.Add(recipe);
        }
    }
}
