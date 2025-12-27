namespace MyDietitianMobileApp.Application.Commands
{
    public class CreateAccessKeyCommand
    {
        public Guid DietitianId { get; }
        public Guid ClientId { get; }
        public DateTime StartDate { get; }
        public DateTime EndDate { get; }
        public string Key { get; }

        public CreateAccessKeyCommand(Guid dietitianId, Guid clientId, DateTime startDate, DateTime endDate, string key)
        {
            DietitianId = dietitianId;
            ClientId = clientId;
            StartDate = startDate;
            EndDate = endDate;
            Key = key;
        }
    }
    public class CreateAccessKeyResult
    {
        public Guid AccessKeyId { get; }
        public CreateAccessKeyResult(Guid accessKeyId) => AccessKeyId = accessKeyId;
    }
    public interface ICreateAccessKeyHandler
    {
        CreateAccessKeyResult Handle(CreateAccessKeyCommand command);
    }
}
