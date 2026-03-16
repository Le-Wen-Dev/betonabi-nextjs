'use client';

import QueryClientProvider from '@/components/QueryClientProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
