using MediatR;
using MyDietitianMobileApp.Application.DTOs;
using System;
using System.Collections.Generic;

namespace MyDietitianMobileApp.Application.Commands
{
    public record CreateRecipeCommand(
        Guid DietitianId,
        string Name,
        string Description,
        List<CreateRecipeIngredientDto> Ingredients
    ) : IRequest<CreateRecipeResult>;
}
