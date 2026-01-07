'use client';

import { CheckCircle2, XCircle, AlertCircle, Eye, Send } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MatchScoreBar } from './MatchScoreBar';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export interface RecipeMatchResult {
  recipeId: string;
  recipeName: string;
  matchPercentage: number;
  matchedIngredients: string[];
  missingMandatoryIngredients: string[];
  missingOptionalIngredients: string[];
  isFullyMatch: boolean;
}

interface RecipeMatchCardProps {
  match: RecipeMatchResult;
  onViewRecipe?: (recipeId: string) => void;
  onRecommend?: (recipeId: string) => void;
  className?: string;
}

export function RecipeMatchCard({
  match,
  onViewRecipe,
  onRecommend,
  className,
}: RecipeMatchCardProps) {
  const t = useTranslations('recipeMatch');

  return (
    <Card className={cn('p-6 hover:shadow-md transition-shadow', className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
            {match.recipeName}
          </h3>
          <MatchScoreBar score={match.matchPercentage} />
        </div>
        <Badge
          variant={match.isFullyMatch ? 'primary' : 'secondary'}
          className="ml-4 flex-shrink-0"
        >
          {match.isFullyMatch ? t('fullMatch') : t('partialMatch')}
        </Badge>
      </div>

      {/* Matched Ingredients */}
      {match.matchedIngredients.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-foreground">{t('matchedIngredients')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {match.matchedIngredients.map((ingredient, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
              >
                {ingredient}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Missing Mandatory Ingredients */}
      {match.missingMandatoryIngredients.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-foreground">{t('missingMandatory')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {match.missingMandatoryIngredients.map((ingredient, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
              >
                {ingredient}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Missing Optional Ingredients */}
      {match.missingOptionalIngredients.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-foreground">{t('missingOptional')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {match.missingOptionalIngredients.map((ingredient, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
              >
                {ingredient}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-border">
        {onViewRecipe && (
          <Button
            variant="secondary"
            onClick={() => onViewRecipe(match.recipeId)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            {t('viewRecipe')}
          </Button>
        )}
        {onRecommend && (
          <Button
            variant="primary"
            onClick={() => onRecommend(match.recipeId)}
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-2" />
            {t('recommendToClient')}
          </Button>
        )}
      </div>
    </Card>
  );
}

