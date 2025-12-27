import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DropdownProps {
  options: string[];
  className?: string;
}

export function Dropdown({ options, className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className={cn('relative', className)}>
      <button
        className="px-4 py-2 rounded bg-muted text-foreground border w-40 text-left"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        {selected || 'Select...'}
        <span className="float-right">▼</span>
      </button>
      {open && (
        <ul className="absolute left-0 mt-1 w-full rounded bg-card shadow z-10">
          {options.map((opt) => (
            <li
              key={opt}
              className="px-4 py-2 hover:bg-accent/10 cursor-pointer"
              onClick={() => {
                setSelected(opt);
                setOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
