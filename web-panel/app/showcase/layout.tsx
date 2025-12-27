import { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function ShowcaseLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout>
      <div className="flex justify-end mb-6">
        <ThemeToggle />
      </div>
      {children}
    </AppLayout>
  );
}
