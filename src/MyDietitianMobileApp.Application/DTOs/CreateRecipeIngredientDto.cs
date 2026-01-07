namespace MyDietitianMobileApp.Application.DTOs
{
    public record CreateRecipeIngredientDto(
        Guid IngredientId,
        bool IsMandatory,
        bool IsProhibited
    );
}

