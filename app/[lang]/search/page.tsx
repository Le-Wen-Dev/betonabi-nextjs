'use client';

import { Suspense } from 'react';
import SearchPage from './SearchContent';

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchPage />
    </Suspense>
  );
}
