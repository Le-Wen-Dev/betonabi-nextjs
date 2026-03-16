'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { ready, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    // Nếu admin login thì đưa về admin area
    if (isAdmin) {
      router.replace('/admin/dashboard');
    }
  }, [ready, isAuthenticated, isAdmin, router, pathname]);

  if (!ready) return null;
  if (!isAuthenticated) return null;
  if (isAdmin) return null;

  return <>{children}</>;
};

export default RequireAuth;
