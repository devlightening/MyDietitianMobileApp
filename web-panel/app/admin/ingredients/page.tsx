'use client';

import { useState } from 'react';
import { useAdminIngredients, useCreateIngredient, useUpdateIngredient, useToggleIngredientActive, AdminIngredient } from '@/hooks/useAdminIngredients';
import { IngredientListTable } from '@/components/admin/IngredientListTable';
import { IngredientCreateEditModal } from '@/components/admin/IngredientCreateEditModal';
import { Button } from '@/components/ui/Button';
import { Filter, PackageCheck, PackageX, Plus, Search, X } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'passive'>('all');

  const allIngredients = ingredients || [];
  const activeCount = allIngredients.filter((ingredient) => ingredient.isActive).length;
  const passiveCount = allIngredients.length - activeCount;
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase('tr-TR');
  const filteredIngredients = allIngredients.filter((ingredient) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && ingredient.isActive) ||
      (statusFilter === 'passive' && !ingredient.isActive);

    if (!matchesStatus) return false;
    if (!normalizedSearch) return true;

    const haystack = [
      ingredient.canonicalName,
      ...(ingredient.aliases || []),
    ].join(' ').toLocaleLowerCase('tr-TR');

    return haystack.includes(normalizedSearch);
  });

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h2>
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h2>
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
    <div className="space-y-6">
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Global katalog
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{t('title')}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {t('subtitle')}. Fiş ve fotoğraf tarama eşleşmelerinin doğru çalışması için kanonik isimleri ve takma isimleri buradan yönet.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          {t('createIngredient')}
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Toplam malzeme</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{allIngredients.length}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PackageCheck className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Aktif kayıt</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{activeCount}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <PackageCheck className="h-5 w-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Pasif kayıt</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{passiveCount}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <PackageX className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </section>

      <Card className="p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Kanonik isim veya takma isim ara..."
              className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Aramayı temizle"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Filter className="h-4 w-4" />
              Durum
            </span>
            {[
              { key: 'all', label: `Tümü (${allIngredients.length})` },
              { key: 'active', label: `Aktif (${activeCount})` },
              { key: 'passive', label: `Pasif (${passiveCount})` },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setStatusFilter(item.key as typeof statusFilter)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  statusFilter === item.key
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
          <span>
            {filteredIngredients.length} sonuç gösteriliyor
            {searchQuery ? ` · "${searchQuery}" araması` : ''}
          </span>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="font-semibold text-primary transition hover:text-primary/80"
            >
              Filtreleri temizle
            </button>
          )}
        </div>
      </Card>

      {/* Content */}
      {allIngredients.length === 0 ? (
        <EmptyState
          title={t('noIngredients')}
          description={t('noIngredientsDescription')}
        />
      ) : filteredIngredients.length === 0 ? (
        <Card className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <Search className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-bold text-foreground">Sonuç bulunamadı</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Arama kelimesini veya durum filtresini değiştirerek tekrar deneyebilirsin.
          </p>
        </Card>
      ) : (
        <Card className="p-4 md:p-6">
          <IngredientListTable
            ingredients={filteredIngredients}
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

