'use client';

import { X, Plus } from 'lucide-react';
import { IngredientAutocomplete } from '@/components/ingredients/IngredientAutocomplete';
import type { IngredientOption } from '@/components/ingredients/IngredientAutocomplete';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface IngredientChipListProps {
  ingredients: IngredientOption[];
  onAdd: (ingredient: IngredientOption) => void;
  onRemove: (ingredientId: string) => void;
  className?: string;
}

export type { IngredientOption };

export function IngredientChipList({
  ingredients,
  onAdd,
  onRemove,
  className,
}: IngredientChipListProps) {
  const t = useTranslations('recipeMatch');

  const handleIngredientSelect = (ingredient: IngredientOption) => {
    // Check if ingredient already exists
    if (ingredients.some(ing => ing.id === ingredient.id)) {
      return;
    }
    onAdd(ingredient);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{t('clientIngredients')}</label>
        <span className="text-xs text-muted-foreground">{ingredients.length} ingredients</span>
      </div>

      {/* Ingredient Chips */}
      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ingredient) => (
            <Badge
              key={ingredient.id}
              variant="secondary"
              className="flex items-center gap-2 px-3 py-1.5 text-sm"
            >
              <span>{ingredient.canonicalName}</span>
              <button
                type="button"
                onClick={() => onRemove(ingredient.id)}
                className="ml-1 hover:text-destructive transition-colors"
                aria-label={`Remove ${ingredient.canonicalName}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add Ingredient Input */}
      <Card className="p-4 border-dashed">
        <div className="space-y-2">
          <IngredientAutocomplete
            onSelect={handleIngredientSelect}
            placeholder={t('addIngredient')}
            className="w-full"
          />
          {ingredients.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {t('noIngredientsDescription')}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

