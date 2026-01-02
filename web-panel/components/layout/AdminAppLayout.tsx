"use client";

import { AdminSidebar } from './AdminSidebar';
import { Topbar } from './Topbar';
import { ReactNode } from 'react';

export function AdminAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-7xl mx-auto p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

