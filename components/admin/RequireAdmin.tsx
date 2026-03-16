'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { ready, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}&requiredRole=admin`);
      return;
    }

    if (!isAdmin) {
      router.replace('/admin/articles');
    }
  }, [ready, isAuthenticated, isAdmin, router, pathname]);

  if (!ready) return null;
  if (!isAuthenticated || !isAdmin) return null;

  return <>{children}</>;
};

export default RequireAdmin;
