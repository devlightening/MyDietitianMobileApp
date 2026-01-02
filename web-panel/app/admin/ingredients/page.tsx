'use client';

import { useState } from 'react';
import { useAdminIngredients, useCreateIngredient, useUpdateIngredient, useToggleIngredientActive, AdminIngredient } from '@/hooks/useAdminIngredients';
import { IngredientListTable } from '@/components/admin/IngredientListTable';
import { IngredientCreateEditModal } from '@/components/admin/IngredientCreateEditModal';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getErrorTranslationKey } from '@/lib/error-utils';
import { ApiError } from '@/lib/api';
import EmptyState from '@/components/states/EmptyState';
import ErrorState from '@/components/states/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';

export default function AdminIngredientsPage() {
  const t = useTranslations('admin.ingredients');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');

  const { data: ingredients, isLoading, isError, error, refetch } = useAdminIngredients();
  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient();
  const toggleMutation = useToggleIngredientActive();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<AdminIngredient | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = () => {
    setEditingIngredient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (ingredient: AdminIngredient) => {
    setEditingIngredient(ingredient);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: { canonicalName: string; aliases: string[]; isActive: boolean }) => {
    try {
      if (editingIngredient) {
        await updateMutation.mutateAsync({ id: editingIngredient.id, data });
        showNotification('success', t('updateSuccess'));
      } else {
        await createMutation.mutateAsync(data);
        showNotification('success', t('createSuccess'));
      }
      setIsModalOpen(false);
      setEditingIngredient(null);
    } catch (error: any) {
      const errorMessage = error && typeof error === 'object' && 'code' in error
        ? tErrors(getErrorTranslationKey((error as ApiError).code) as any)
        : error?.message || t('errorOccurred');
      showNotification('error', errorMessage);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await toggleMutation.mutateAsync({ id, isActive });
      showNotification('success', isActive ? t('activateSuccess') : t('deactivateSuccess'));
    } catch (error: any) {
      const errorMessage = error && typeof error === 'object' && 'code' in error
        ? tErrors(getErrorTranslationKey((error as ApiError).code) as any)
        : error?.message || t('errorOccurred');
      showNotification('error', errorMessage);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{t('title')}</h2>
            <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
          </div>
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    const errorMessage = error && typeof error === 'object' && 'code' in error
      ? tErrors(getErrorTranslationKey((error as ApiError).code) as any)
      : error && typeof error === 'object' && 'message' in error
        ? (error as ApiError).message
        : tCommon('error');

    return (
      <div className="space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{t('title')}</h2>
            <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
          </div>
        </div>
        <ErrorState
          title={t('failedToLoad')}
          message={errorMessage}
          onRetry={() => refetch()}
          retryLabel={tCommon('retry')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t('title')}</h2>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          {t('createIngredient')}
        </Button>
      </div>

      {/* Content */}
      {ingredients && ingredients.length === 0 ? (
        <EmptyState
          title={t('noIngredients')}
          description={t('noIngredientsDescription')}
        />
      ) : (
        <Card className="p-6">
          <IngredientListTable
            ingredients={ingredients || []}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
          />
        </Card>
      )}

      {/* Create/Edit Modal */}
      <IngredientCreateEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIngredient(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingIngredient}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

