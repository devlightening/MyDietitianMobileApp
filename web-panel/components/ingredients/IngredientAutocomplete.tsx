'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import { Search, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IngredientOption {
  id: string;
  canonicalName: string;
}

interface IngredientAutocompleteProps {
  value?: IngredientOption | null;
  onSelect: (ingredient: IngredientOption) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface IngredientDto {
  id: string;
  canonicalName: string;
  aliases: string[];
}

async function searchIngredients(query: string): Promise<IngredientOption[]> {
  if (!query.trim()) return [];
  
  try {
    const res = await api.get<{ ingredients: IngredientDto[] }>(`/api/ingredients/search?q=${encodeURIComponent(query)}`);
    return res.data.ingredients.map(ing => ({
      id: ing.id,
      canonicalName: ing.canonicalName,
    }));
  } catch (error) {
    console.error('Failed to search ingredients:', error);
    return [];
  }
}

export function IngredientAutocomplete({
  value,
  onSelect,
  onClear,
  placeholder = 'Search ingredient...',
  disabled = false,
  className,
}: IngredientAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<IngredientOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Debounced search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (value) {
      // If ingredient is selected, don't search
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (!searchTerm.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const results = await searchIngredients(searchTerm);
      setResults(results);
      setIsLoading(false);
      setIsOpen(true);
    }, 300);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchTerm, value]);

  const handleSelect = (ingredient: IngredientOption) => {
    onSelect(ingredient);
    setSearchTerm(ingredient.canonicalName);
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    // If user clears the selected ingredient, clear the value
    if (value && newValue !== value.canonicalName) {
      if (onClear) {
        onClear();
      }
    }
  };

  const handleInputFocus = () => {
    if (results.length > 0 && !value) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent form submission on Enter if dropdown is open
    if (e.key === 'Enter' && isOpen && results.length > 0) {
      e.preventDefault();
      handleSelect(results[0]);
    }
    
    // Close on Escape
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={value ? value.canonicalName : searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || !!value}
          className={cn(
            'pl-9 pr-9',
            value && 'pr-9'
          )}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && !value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !value && (results.length > 0 || isLoading) && (
        <Card className="absolute z-50 mt-1 w-full max-h-60 overflow-auto border border-border shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No ingredients found
            </div>
          ) : (
            <div className="py-1">
              {results.map((ingredient) => (
                <button
                  key={ingredient.id}
                  type="button"
                  onClick={() => handleSelect(ingredient)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none flex items-center gap-2"
                >
                  <span className="flex-1">{ingredient.canonicalName}</span>
                  {value?.id === ingredient.id && (
                    <Check className="h-4 w-4 text-primary" />
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

