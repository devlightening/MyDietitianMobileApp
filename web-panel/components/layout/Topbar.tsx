import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function Topbar() {
  return (
    <header className="h-16 w-full flex items-center justify-between px-6 bg-card border-b border-border">
      <div className="font-bold text-xl tracking-tight text-primary">MyDietitian</div>
      <div className="flex items-center gap-4">
        <Button variant="secondary">Profile</Button>
        <Button variant="danger">Logout</Button>
      </div>
    </header>
  );
}
