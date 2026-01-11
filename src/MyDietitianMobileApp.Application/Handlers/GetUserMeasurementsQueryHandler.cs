using MediatR;
using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Application.Queries;
using MyDietitianMobileApp.Infrastructure.Persistence;

namespace MyDietitianMobileApp.Application.Handlers;

public class GetUserMeasurementsQueryHandler 
    : IRequestHandler<GetUserMeasurementsQuery, GetUserMeasurementsResult>
{
    private readonly AppDbContext _context;

    public GetUserMeasurementsQueryHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<GetUserMeasurementsResult> Handle(
        GetUserMeasurementsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.UserMeasurements
            .Where(m => m.ClientId == request.ClientId);

        // Filter by days if specified
        if (request.LastNDays.HasValue)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-request.LastNDays.Value);
            query = query.Where(m => m.CreatedAt >= cutoffDate);
        }

        var measurements = await query
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);

        var dtos = measurements.Select(m => new UserMeasurementDto
        {
            WeightKg = m.WeightKg,
            HeightCm = m.HeightCm,
            Bmi = m.Bmi,
            Bmr = m.Bmr,
            CreatedAt = m.CreatedAt,
            BmiCategory = GetBmiCategory(m.Bmi)
        }).ToList();

        return new GetUserMeasurementsResult
        {
            Measurements = dtos,
            Latest = dtos.FirstOrDefault()
        };
    }

    private string GetBmiCategory(decimal bmi)
    {
        return bmi switch
        {
            < 18.5m => "Underweight",
            < 25m => "Normal",
            < 30m => "Overweight",
            < 35m => "Obese Class I",
            < 40m => "Obese Class II",
            _ => "Obese Class III"
        };
    }
}
