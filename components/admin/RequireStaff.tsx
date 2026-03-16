'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Allows admin + author (content staff)
const RequireStaff = ({ children }: { children: ReactNode }) => {
  const { ready, isAuthenticated, isStaff } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}&requiredRole=staff`);
      return;
    }

    if (!isStaff) {
      router.replace('/user/dashboard');
    }
  }, [ready, isAuthenticated, isStaff, router, pathname]);

  if (!ready) return null;
  if (!isAuthenticated || !isStaff) return null;

  return <>{children}</>;
};

export default RequireStaff;
