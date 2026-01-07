export interface AlternativeDecisionRequest {
  dietitianId?: string; // Set by backend from JWT
  plannedRecipeId: string;
  mealType: number;
  clientAvailableIngredients: string[];
}

export interface AlternativeRecipe {
  recipeId: string;
  recipeName: string;
  matchPercentage: number;
}

export interface AlternativeDecisionResponse {
  canCookOriginal: boolean;
  explanation: string;
  alternativeRecipe?: AlternativeRecipe;
  missingMandatoryIngredients: string[];
  prohibitedIngredientsPresent: string[];
}

export interface Ingredient {
  id: string;
  canonicalName: string;
  aliases?: string[];
}
