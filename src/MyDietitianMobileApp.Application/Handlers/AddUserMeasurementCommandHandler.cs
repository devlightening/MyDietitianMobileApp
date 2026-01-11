using MediatR;
using Microsoft.EntityFrameworkCore;
using MyDietitianMobileApp.Application.Commands;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Domain.Services;
using MyDietitianMobileApp.Infrastructure.Persistence;

namespace MyDietitianMobileApp.Application.Handlers;

public class AddUserMeasurementCommandHandler 
    : IRequestHandler<AddUserMeasurementCommand, AddUserMeasurementResult>
{
    private readonly AppDbContext _context;
    private readonly IHealthCalculationService _healthService;

    public AddUserMeasurementCommandHandler(
        AppDbContext context,
        IHealthCalculationService healthService)
    {
        _context = context;
        _healthService = healthService;
    }

    public async Task<AddUserMeasurementResult> Handle(
        AddUserMeasurementCommand request,
        CancellationToken cancellationToken)
    {
        // Business rule: Max 1 measurement per day
        var today = DateTime.UtcNow.Date;
        var existingToday = await _context.UserMeasurements
            .AnyAsync(m => 
                m.ClientId == request.ClientId && 
                m.CreatedAt.Date == today,
                cancellationToken);

        if (existingToday)
        {
            return new AddUserMeasurementResult
            {
                Success = false,
                Message = "You can only add one measurement per day"
            };
        }

        // Calculate BMI and BMR (server-side)
        var bmi = _healthService.CalculateBmi(request.WeightKg, request.HeightCm);
        var bmr = _healthService.CalculateBmr(
            request.WeightKg,
            request.HeightCm,
            request.Age,
            request.Gender
        );

        var measurement = new UserMeasurement(
            request.ClientId,
            request.WeightKg,
            request.HeightCm,
            bmi,
            bmr
        );

        _context.UserMeasurements.Add(measurement);
        await _context.SaveChangesAsync(cancellationToken);

        return new AddUserMeasurementResult
        {
            Success = true,
            Message = "Measurement added successfully",
            Bmi = bmi,
            Bmr = bmr,
            CreatedAt = measurement.CreatedAt
        };
    }
}
