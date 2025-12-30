import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menu = [
  { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { label: 'Recipes', href: '/dashboard/recipes', icon: '🍲' },
  { label: 'Access Keys', href: '/dashboard/access-keys', icon: '🔑' },
];

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  return (
    <aside className={cn('h-full bg-card border-r border-border flex flex-col py-4 px-2 w-56 transition-all', collapsed && 'w-16')}> 
      <nav className="flex-1 flex flex-col gap-2">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-foreground',
              pathname?.startsWith(item.href) && 'bg-primary/10 text-primary font-semibold',
              collapsed && 'justify-center px-0'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
