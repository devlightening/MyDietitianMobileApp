'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Search, AlertCircle, ChefHat } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ClientSelect } from '@/components/recipe-match/ClientSelect';
import { IngredientChipList } from '@/components/recipe-match/IngredientChipList';
import type { IngredientOption } from '@/components/recipe-match/IngredientChipList';
import { RecipeMatchCard, RecipeMatchResult } from '@/components/recipe-match/RecipeMatchCard';
import { RecipeMatchSkeleton } from '@/components/recipe-match/RecipeMatchSkeleton';
import EmptyState from '@/components/states/EmptyState';
import ErrorState from '@/components/states/ErrorState';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { ApiError } from '@/lib/api';

// Backend returns RecipeMatchResultDto with camelCase properties (ASP.NET Core default)
interface RecipeMatchResponse {
  recipeId: string;
  recipeName: string;
  matchPercentage: number;
  matchedIngredients: string[];
  missingMandatoryIngredients: string[];
  missingOptionalIngredients: string[];
  isFullyMatch: boolean;
}

async function matchRecipes(ingredientIds: string[]): Promise<RecipeMatchResult[]> {
  const res = await api.post<RecipeMatchResponse[]>('/api/recipes/match', ingredientIds);
  // Backend returns camelCase by default, so direct mapping should work
  return res.data.map(item => ({
    recipeId: item.recipeId,
    recipeName: item.recipeName,
    matchPercentage: item.matchPercentage,
    matchedIngredients: item.matchedIngredients ?? [],
    missingMandatoryIngredients: item.missingMandatoryIngredients ?? [],
    missingOptionalIngredients: item.missingOptionalIngredients ?? [],
    isFullyMatch: item.isFullyMatch,
  }));
}

export default function RecipeMatchPage() {
  const t = useTranslations('recipeMatch');
  const tCommon = useTranslations('common');

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);

  const matchMutation = useMutation<RecipeMatchResult[], ApiError, string[]>({
    mutationFn: matchRecipes,
    retry: 1,
  });

  const handleFindRecipes = () => {
    if (ingredients.length === 0) return;
    const ingredientIds = ingredients.map(ing => ing.id);
    matchMutation.mutate(ingredientIds);
  };

  const handleAddIngredient = (ingredient: IngredientOption) => {
    setIngredients(prev => [...prev, ingredient]);
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== ingredientId));
  };

  const handleViewRecipe = (recipeId: string) => {
    // TODO: Navigate to recipe detail page
    console.log('View recipe:', recipeId);
  };

  const handleRecommend = (recipeId: string) => {
    // TODO: Implement recommendation feature
    console.log('Recommend recipe:', recipeId, 'to client:', selectedClientId);
  };

  const canFindRecipes = ingredients.length > 0 && !matchMutation.isPending;
  const hasResults = matchMutation.data && matchMutation.data.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{t('title')}</h2>
        <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      {/* Step 1: Client Selection */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('selectClient')}
            </label>
            <ClientSelect
              value={selectedClientId}
              onSelect={setSelectedClientId}
            />
          </div>
        </div>
      </Card>

      {/* Step 2: Ingredients */}
      {selectedClientId && (
        <Card className="p-6">
          <IngredientChipList
            ingredients={ingredients}
            onAdd={handleAddIngredient}
            onRemove={handleRemoveIngredient}
          />
        </Card>
      )}

      {/* Step 3: Find Recipes Button */}
      {selectedClientId && ingredients.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="primary"
            onClick={handleFindRecipes}
            disabled={!canFindRecipes}
            loading={matchMutation.isPending}
            className="px-8 py-3 text-base"
          >
            <Search className="h-5 w-5 mr-2" />
            {matchMutation.isPending ? t('finding') : t('findRecipes')}
          </Button>
        </div>
      )}

      {/* Empty States */}
      {!selectedClientId && (
        <EmptyState
          title={t('noClientSelected')}
          description={t('noClientSelectedDescription')}
          icon={<ChefHat className="h-8 w-8 text-muted-foreground" />}
        />
      )}

      {selectedClientId && ingredients.length === 0 && !matchMutation.data && (
        <EmptyState
          title={t('noIngredients')}
          description={t('noIngredientsDescription')}
          icon={<ChefHat className="h-8 w-8 text-muted-foreground" />}
        />
      )}

      {/* Loading State */}
      {matchMutation.isPending && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <RecipeMatchSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {matchMutation.isError && (
        <ErrorState
          title={t('failedToMatch')}
          message={matchMutation.error?.message || tCommon('error')}
          onRetry={() => {
            if (ingredients.length > 0) {
              const ingredientIds = ingredients.map(ing => ing.id);
              matchMutation.mutate(ingredientIds);
            }
          }}
        />
      )}

      {/* Results */}
      {hasResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Found {matchMutation.data!.length} matching recipe{matchMutation.data!.length !== 1 ? 's' : ''}
            </h3>
          </div>
          {matchMutation.data!.map((match) => (
            <RecipeMatchCard
              key={match.recipeId}
              match={match}
              onViewRecipe={handleViewRecipe}
              onRecommend={handleRecommend}
            />
          ))}
        </div>
      )}

      {/* No Results */}
      {matchMutation.data && matchMutation.data.length === 0 && !matchMutation.isPending && (
        <EmptyState
          title={t('noMatches')}
          description={t('noMatchesDescription')}
          icon={<AlertCircle className="h-8 w-8 text-muted-foreground" />}
        />
      )}
    </div>
  );
}

