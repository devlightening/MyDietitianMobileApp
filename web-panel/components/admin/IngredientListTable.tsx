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
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="w-[220px] p-4 text-left text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {t('canonicalName')}
            </th>
            <th className="p-4 text-left text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {t('aliases')}
            </th>
            <th className="w-[120px] p-4 text-left text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {t('status')}
            </th>
            <th className="w-[300px] p-4 text-right text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => (
            <tr
              key={ingredient.id}
              className="border-b border-border transition-colors last:border-0 hover:bg-muted/40"
            >
              <td className="p-4 align-middle">
                <span
                  className={`text-base font-semibold ${
                    ingredient.isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {ingredient.canonicalName}
                </span>
              </td>
              <td className="p-4 align-middle">
                {ingredient.aliases && ingredient.aliases.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {ingredient.aliases.slice(0, 18).map((alias, idx) => (
                      <Badge key={`${alias}-${idx}`} variant="secondary" className="text-xs">
                        {alias}
                      </Badge>
                    ))}
                    {ingredient.aliases.length > 18 && (
                      <Badge variant="secondary" className="text-xs">
                        +{ingredient.aliases.length - 18}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Alias yok</span>
                )}
              </td>
              <td className="p-4 align-middle">
                <Badge
                  variant="secondary"
                  className={
                    ingredient.isActive
                      ? 'border-green-500/30 bg-green-500/15 text-green-500'
                      : 'border-border bg-muted text-muted-foreground'
                  }
                >
                  {ingredient.isActive ? t('active') : t('passive')}
                </Badge>
              </td>
              <td className="p-4 align-middle">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(ingredient)}
                    className="px-3 py-2 text-sm"
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    {t('edit')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onToggleActive(ingredient.id, !ingredient.isActive)}
                    className="px-3 py-2 text-sm"
                  >
                    {ingredient.isActive ? (
                      <>
                        <PowerOff className="mr-1 h-4 w-4" />
                        {t('deactivate')}
                      </>
                    ) : (
                      <>
                        <Power className="mr-1 h-4 w-4" />
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
