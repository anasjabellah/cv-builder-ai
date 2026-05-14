'use client';

import { useState } from 'react';
import type { CVFormData } from '@/types';
import Button from '@/shared/ui/Button';
import Toast from '@/shared/ui/Toast';

interface ExportButtonsProps {
  html: string | null;
  formData: CVFormData;
  style: string;
  disabled?: boolean;
}

export default function ExportButtons({ html, formData, style, disabled = false }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<'pdf' | 'word' | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = async (format: 'pdf' | 'word') => {
    if (disabled) {
      showToast('Please sign in to use this feature');
      return;
    }
    setExporting(format);
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html,
          format,
          filename: `${formData.personalInfo.fullName || 'cv'}-${style}`,
          formData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Export failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.personalInfo.fullName || 'cv'}-${style}.${format === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to export ${format.toUpperCase()}. Please try again.`;
      showToast(msg);
    } finally {
      setExporting(null);
    }
  };


  return (
    <>
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-4 py-2 rounded-md shadow-lg z-50 text-sm">
          {toast}
        </div>
      )}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={() => handleExport('pdf')}
          loading={exporting === 'pdf'}
          disabled={disabled || (!html && exporting !== 'pdf')}
          className="flex-1 cursor-pointer"
          type="button"
        >
          {exporting === 'pdf' ? 'Exporting...' : '📄 Download PDF'}
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleExport('word')}
          loading={exporting === 'word'}
          disabled={disabled}
          className="flex-1 cursor-pointer"
          type="button"
        >
          {exporting === 'word' ? 'Exporting...' : '📝 Download Word'}
        </Button>
      </div>
    </>
  );
}
