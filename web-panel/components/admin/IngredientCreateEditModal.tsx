'use client';

import { useState, useEffect } from 'react';
import { AdminIngredient } from '@/hooks/useAdminIngredients';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { X, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface IngredientCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { canonicalName: string; aliases: string[]; isActive: boolean }) => void;
  initialData?: AdminIngredient | null;
  isLoading?: boolean;
}

export function IngredientCreateEditModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: IngredientCreateEditModalProps) {
  const t = useTranslations('admin.ingredients');
  const tCommon = useTranslations('common');

  const [canonicalName, setCanonicalName] = useState('');
  const [aliases, setAliases] = useState<string[]>([]);
  const [newAlias, setNewAlias] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setCanonicalName(initialData.canonicalName);
      setAliases(initialData.aliases || []);
      setIsActive(initialData.isActive);
    } else {
      setCanonicalName('');
      setAliases([]);
      setIsActive(true);
    }
    setNewAlias('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddAlias = () => {
    if (newAlias.trim() && !aliases.includes(newAlias.trim())) {
      setAliases([...aliases, newAlias.trim()]);
      setNewAlias('');
    }
  };

  const handleRemoveAlias = (index: number) => {
    setAliases(aliases.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canonicalName.trim()) return;

    onSubmit({
      canonicalName: canonicalName.trim(),
      aliases: aliases.filter(a => a.trim()),
      isActive,
    });
  };

  const canSubmit = canonicalName.trim() && !isLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {initialData ? t('editIngredient') : t('createIngredient')}
            </h2>
            <Button variant="secondary" onClick={onClose} className="px-3 py-1">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('canonicalName')} <span className="text-destructive">*</span>
              </label>
              <Input
                value={canonicalName}
                onChange={(e) => setCanonicalName(e.target.value)}
                placeholder={t('canonicalNamePlaceholder')}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('aliases')}
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newAlias}
                    onChange={(e) => setNewAlias(e.target.value)}
                    placeholder={t('aliasPlaceholder')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAlias();
                      }
                    }}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddAlias}
                    disabled={!newAlias.trim() || isLoading}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {aliases.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {aliases.map((alias, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-muted rounded-md"
                      >
                        <span className="text-sm">{alias}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAlias(index)}
                          className="text-muted-foreground hover:text-foreground"
                          disabled={isLoading}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm text-foreground">
                {t('isActive')}
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={!canSubmit}>
                {isLoading ? tCommon('loading') : initialData ? t('update') : t('create')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

