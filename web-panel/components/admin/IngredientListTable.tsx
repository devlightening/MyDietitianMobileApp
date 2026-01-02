'use client';

import { AdminIngredient } from '@/hooks/useAdminIngredients';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Edit, Power, PowerOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface IngredientListTableProps {
  ingredients: AdminIngredient[];
  onEdit: (ingredient: AdminIngredient) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export function IngredientListTable({
  ingredients,
  onEdit,
  onToggleActive,
}: IngredientListTableProps) {
  const t = useTranslations('admin.ingredients');

  if (ingredients.length === 0) {
    return null; // Empty state handled by parent
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-4 font-semibold text-foreground">
              {t('canonicalName')}
            </th>
            <th className="text-left p-4 font-semibold text-foreground">
              {t('aliases')}
            </th>
            <th className="text-left p-4 font-semibold text-foreground">
              {t('status')}
            </th>
            <th className="text-right p-4 font-semibold text-foreground">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => (
            <tr
              key={ingredient.id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td className="p-4">
                <span className={!ingredient.isActive ? 'text-muted-foreground' : ''}>
                  {ingredient.canonicalName}
                </span>
              </td>
              <td className="p-4">
                {ingredient.aliases && ingredient.aliases.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {ingredient.aliases.map((alias, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {alias}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </td>
              <td className="p-4">
                <Badge
                  variant="secondary"
                  className={ingredient.isActive ? 'bg-green-500/20 text-green-500 border-green-500/30' : ''}
                >
                  {ingredient.isActive ? t('active') : t('passive')}
                </Badge>
              </td>
              <td className="p-4">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(ingredient)}
                    className="text-sm px-3 py-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    {t('edit')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onToggleActive(ingredient.id, !ingredient.isActive)}
                    className="text-sm px-3 py-1"
                  >
                    {ingredient.isActive ? (
                      <>
                        <PowerOff className="w-4 h-4 mr-1" />
                        {t('deactivate')}
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4 mr-1" />
                        {t('activate')}
                      </>
                    )}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

