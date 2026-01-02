'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { AppLayout } from '@/components/layout/AppLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user has admin token by trying to access an admin endpoint
    const checkAdminAccess = async () => {
      try {
        await api.get('/api/admin/ingredients');
        // If we get here, user has admin access
        setIsChecking(false);
      } catch (error: any) {
        // If 401 or 403, redirect to login
        if (error?.status === 401 || error?.status === 403) {
          router.push('/auth/login');
        } else {
          setIsChecking(false);
        }
      }
    };

    checkAdminAccess();
  }, [router]);

  if (isChecking) {
    return (
      <AppLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}

