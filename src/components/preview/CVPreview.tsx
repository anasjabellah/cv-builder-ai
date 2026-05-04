'use client';

import { useRef, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CVPreviewProps {
  html: string | null;
  generating: boolean;
}

export default function CVPreview({ html, generating }: CVPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (html && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  if (generating) {
    return (
      <div className="w-full aspect-[210/297] bg-[#111111] rounded-xl border border-[#27272A] flex items-center justify-center">
        <LoadingSpinner size="lg" message="AI is designing your CV..." />
      </div>
    );
  }

  if (!html) {
    return (
      <div className="w-full aspect-[210/297] bg-[#111111] rounded-xl border-2 border-dashed border-[#27272A] flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <p className="text-sm text-[#A1A1AA]">Your CV preview will appear here</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-[#27272A] overflow-hidden bg-white">
      <iframe
        ref={iframeRef}
        title="CV Preview"
        className="w-full aspect-[210/297]"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
