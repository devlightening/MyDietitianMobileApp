import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={cn('bg-card rounded-xl shadow-lg p-6 min-w-[320px] max-w-full')}
        role="dialog" aria-modal="true">
        {title && <div className="text-lg font-semibold mb-2">{title}</div>}
        {children}
        <button
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  );
}
