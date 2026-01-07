'use client';

'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Check } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ClientSelectProps {
  value?: string | null;
  onSelect: (clientId: string) => void;
  className?: string;
}

export function ClientSelect({ value, onSelect, className }: ClientSelectProps) {
  const t = useTranslations('recipeMatch');
  const { clients, isLoading } = useClients();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedClient = clients.find(c => c.clientId === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredClients = clients.filter(client =>
    client.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (clientId: string) => {
    onSelect(clientId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border',
          'bg-background text-foreground hover:bg-accent/50 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        )}
        disabled={isLoading}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectedClient ? (
            <>
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium truncate">{selectedClient.clientName}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">{t('selectClientPlaceholder')}</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <Card className="absolute z-50 mt-2 w-full max-h-60 overflow-auto border border-border shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t('loading', { ns: 'common' })}
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No clients found
            </div>
          ) : (
            <div className="py-1">
              {filteredClients.map((client) => (
                <button
                  key={client.clientId}
                  type="button"
                  onClick={() => handleSelect(client.clientId)}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="flex-1 font-medium">{client.clientName}</span>
                  {value === client.clientId && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

