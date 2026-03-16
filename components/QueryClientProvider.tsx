'use client';

import { QueryClient, QueryClientProvider as QCP } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export default function QueryClientProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QCP client={queryClient}>{children}</QCP>;
}
