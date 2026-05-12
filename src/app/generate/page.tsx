// src/app/generate/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import CVPreview from '@/components/preview/CVPreview';
import ExportButtons from '@/components/export/ExportButtons';
import Button from '@/components/ui/Button';
import Navbar from '@/components/layout/Navbar';

export default function GenerateResultPage() {
  const searchParams = useSearchParams();
  const [html, setHtml] = useState<string>('');
  const [style, setStyle] = useState<string>('modern');

  useEffect(() => {
    const htmlParam = searchParams.get('html');
    const styleParam = searchParams.get('style');
    if (htmlParam) setHtml(decodeURIComponent(htmlParam));
    if (styleParam) setStyle(styleParam);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar showLogin={false} showJobMatcher={false} showUploadNew={false} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {html ? (
          <>
            <CVPreview html={html} generating={false} />
            <div className="mt-6 flex gap-4">
              <ExportButtons html={html} style={style as any} disabled={false} />
              <Button variant="secondary" onClick={() => (window.location.href = '/')}>Back to Builder</Button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">No generated CV to display.</p>
        )}
      </main>
    </div>
  );
}
