using System;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using MyDietitianMobileApp.Api.Controllers;
using MyDietitianMobileApp.Application.Services;
using MyDietitianMobileApp.Domain.Entities;
using MyDietitianMobileApp.Domain.Enums;
using MyDietitianMobileApp.Infrastructure.Persistence;
using Xunit;

namespace MyDietitianMobileApp.Api.Tests.Pantry;

public class ClientPantryReceiptTests
{
    [Fact]
    public async Task Replace_With_Receipt_Persists_Line_Details_And_Allows_Existing_Items()
    {
        using var db = CreateDbContext();
        var clientId = Guid.NewGuid();
        var tomatoId = Guid.NewGuid();

        db.Clients.Add(new Client(
            clientId,
            "Receipt Client",
            "receipt-client@example.test",
            Gender.Other,
            new DateOnly(1990, 1, 1)));
        db.Ingredients.Add(new Ingredient(tomatoId, "Domates"));
        await db.SaveChangesAsync();

        var controller = new ClientPantryController(
            db,
            new FixedClientIdentityResolver(clientId),
            Mock.Of<IMediator>());

        var firstSavedAt = new DateTime(2026, 6, 17, 12, 58, 0, DateTimeKind.Utc);
        var firstResult = await controller.Replace(CreateReceiptRequest(
            tomatoId,
            firstSavedAt,
            "Domates 0,75 kg x \u20BA32,90 \u20BA32,90",
            0.75m,
            "kg",
            32.90m,
            32.90m));

        firstResult.Should().BeOfType<OkObjectResult>();

        var secondSavedAt = firstSavedAt.AddMinutes(10);
        var secondResult = await controller.Replace(CreateReceiptRequest(
            tomatoId,
            secondSavedAt,
            "Domates 1,00 kg x \u20BA35,00 \u20BA35,00",
            1.00m,
            "kg",
            35.00m,
            35.00m));

        secondResult.Should().BeOfType<OkObjectResult>();

        var pantryItems = await db.ClientPantryItems.ToListAsync();
        pantryItems.Should().ContainSingle();
        pantryItems[0].IngredientId.Should().Be(tomatoId);
        pantryItems[0].Quantity.Should().Be(1.00m);
        pantryItems[0].Unit.Should().Be("kg");

        var receipts = await db.ClientPantryReceipts
            .Include(x => x.Lines)
            .OrderBy(x => x.SavedAtUtc)
            .ToListAsync();
        receipts.Should().HaveCount(2);
        receipts.SelectMany(x => x.Lines).Should().HaveCount(2);

        var firstLine = receipts[0].Lines.Should().ContainSingle().Subject;
        firstLine.RawLine.Should().Be("Domates 0,75 kg x \u20BA32,90 \u20BA32,90");
        firstLine.Quantity.Should().Be(0.75m);
        firstLine.Unit.Should().Be("kg");
        firstLine.UnitPrice.Should().Be(32.90m);
        firstLine.LineTotal.Should().Be(32.90m);
        firstLine.Currency.Should().Be("TRY");

        var recentResult = await controller.GetRecentReceipts();
        recentResult.Should().BeOfType<OkObjectResult>();
        JsonSerializer.Serialize(((OkObjectResult)recentResult).Value).Should().Contain("Domates");
    }

    private static ReplacePantryRequest CreateReceiptRequest(
        Guid ingredientId,
        DateTime savedAtUtc,
        string rawLine,
        decimal quantity,
        string unit,
        decimal unitPrice,
        decimal lineTotal)
    {
        return new ReplacePantryRequest(
            new[]
            {
                new PantryItemRequest(ingredientId, quantity, unit),
            },
            "receipt",
            new PantryReceiptRequest(
                Guid.NewGuid(),
                savedAtUtc,
                null,
                "Gunesli Market",
                "TL",
                null,
                new[]
                {
                    new PantryReceiptLineRequest(
                        ingredientId,
                        rawLine,
                        "Domates",
                        quantity,
                        unit,
                        unitPrice,
                        lineTotal,
                        "TL",
                        0),
                }));
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private sealed class FixedClientIdentityResolver : IClientIdentityResolver
    {
        private readonly Guid _clientId;

        public FixedClientIdentityResolver(Guid clientId)
        {
            _clientId = clientId;
        }

        public Task<(Guid userId, Guid clientId, string publicUserId)?> ResolveClientAsync(ClaimsPrincipal user)
            => Task.FromResult<(Guid userId, Guid clientId, string publicUserId)?>(
                (Guid.NewGuid(), _clientId, "test-client"));
    }
}
