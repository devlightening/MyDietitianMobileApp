'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { AdminAppLayout } from '@/components/layout/AdminAppLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Don't check auth on login page
    if (pathname === '/admin/login') {
      setIsChecking(false);
      return;
    }

    // Check if user has admin token by trying to access an admin endpoint
    const checkAdminAccess = async () => {
      try {
        await api.get('/api/admin/ingredients');
        // If we get here, user has admin access
        setIsChecking(false);
      } catch (error: any) {
        // If 401 or 403, redirect to admin login
        if (error?.status === 401 || error?.status === 403) {
          router.push('/admin/login');
        } else {
          setIsChecking(false);
        }
      }
    };

    checkAdminAccess();
  }, [router, pathname]);

  // Don't wrap login page with AdminAppLayout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isChecking) {
    return (
      <AdminAppLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminAppLayout>
    );
  }

  return <AdminAppLayout>{children}</AdminAppLayout>;
}

