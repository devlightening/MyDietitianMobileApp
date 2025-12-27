using MyDietitianMobileApp.Application.Commands;
using MyDietitianMobileApp.Domain.Entities;
using System;

namespace MyDietitianMobileApp.Application.Handlers
{
    public class CreateAccessKeyCommandHandler : ICreateAccessKeyHandler
    {
        private readonly IDietitianRepository _dietitianRepository;
        private readonly IClientRepository _clientRepository;
        public CreateAccessKeyCommandHandler(IDietitianRepository dietitianRepository, IClientRepository clientRepository)
        {
            _dietitianRepository = dietitianRepository;
            _clientRepository = clientRepository;
        }
        public CreateAccessKeyResult Handle(CreateAccessKeyCommand command)
        {
            if (command.EndDate <= command.StartDate)
                throw new ArgumentException("End date must be after start date.");
            var dietitian = _dietitianRepository.GetById(command.DietitianId);
            if (dietitian == null || !dietitian.IsActive)
                throw new InvalidOperationException("Dietitian not found or inactive.");
            var client = _clientRepository.GetById(command.ClientId);
            if (client == null || !client.IsActive)
                throw new InvalidOperationException("Client not found or inactive.");
            var accessKey = new AccessKey(Guid.NewGuid(), command.Key, command.DietitianId, command.ClientId, command.StartDate, command.EndDate, true);
            client.AddAccessKey(accessKey);
            dietitian.AddClient(client); // optional: ensure association
            return new CreateAccessKeyResult(accessKey.Id);
        }
    }

    public interface IDietitianRepository
    {
        Dietitian GetById(Guid id);
    }
    public interface IClientRepository
    {
        Client GetById(Guid id);
    }
}
