namespace MyDietitianMobileApp.Application.Commands
{
    public class ActivateAccessKeyForClientCommand
    {
        public Guid ClientId { get; }
        public Guid AccessKeyId { get; }
        public ActivateAccessKeyForClientCommand(Guid clientId, Guid accessKeyId)
        {
            ClientId = clientId;
            AccessKeyId = accessKeyId;
        }
    }
    public class ActivateAccessKeyForClientResult
    {
        public bool Success { get; }
        public ActivateAccessKeyForClientResult(bool success) => Success = success;
    }
    public interface IActivateAccessKeyForClientHandler
    {
        ActivateAccessKeyForClientResult Handle(ActivateAccessKeyForClientCommand command);
    }
}
