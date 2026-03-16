'use client';

import { Suspense } from 'react';
import AdminEditor from './EditorContent';

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading editor...</div>}>
      <AdminEditor />
    </Suspense>
  );
}
