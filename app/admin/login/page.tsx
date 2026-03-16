'use client';

import { Suspense } from 'react';
import LoginPage from './LoginContent';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
