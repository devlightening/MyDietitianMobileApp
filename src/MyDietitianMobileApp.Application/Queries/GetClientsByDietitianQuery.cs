using MediatR;

namespace MyDietitianMobileApp.Application.Queries;

public class GetClientsByDietitianQuery : IRequest<GetClientsByDietitianResult>
{
    public Guid DietitianId { get; set; }
}

public class GetClientsByDietitianResult
{
    public List<ClientSummaryDto> Clients { get; set; } = new();
}

public class ClientSummaryDto
{
    public string PublicUserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public decimal? CurrentWeight { get; set; }
    public DateTime LinkedAt { get; set; }
}
