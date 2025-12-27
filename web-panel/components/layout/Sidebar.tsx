import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menu = [
  { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { label: 'Clients', href: '/clients', icon: '👤' },
  { label: 'Recipes', href: '/recipes', icon: '🍲' },
  { label: 'Access Keys', href: '/access-keys', icon: '🔑' },
  { label: 'Profile', href: '/profile', icon: '⚙️' },
];

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  return (
    <aside className={cn('h-full bg-sidebar border-r flex flex-col py-4 px-2 w-56 transition-all', collapsed && 'w-16')}> 
      <nav className="flex-1 flex flex-col gap-2">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded hover:bg-accent/10 transition-colors',
              pathname?.startsWith(item.href) && 'bg-accent/10 text-accent font-semibold',
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
