'use client';

import { useState } from 'react';
import type { CVFormData } from '@/types';
import Button from '@/components/ui/Button';

interface ExportButtonsProps {
  html: string | null;
  formData: CVFormData;
  style: string;
}

export default function ExportButtons({ html, formData, style }: ExportButtonsProps) {
  const [exporting, setExporting] = useState<'pdf' | 'word' | null>(null);

  const handleExport = async (format: 'pdf' | 'word') => {
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
    } catch {
      alert(`Failed to export ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        variant="secondary"
        onClick={() => handleExport('pdf')}
        loading={exporting === 'pdf'}
        disabled={!html && exporting !== 'pdf'}
        className="flex-1 cursor-pointer"
        type="button"
      >
        {exporting === 'pdf' ? 'Exporting...' : '📄 Download PDF'}
      </Button>
      <Button
        variant="secondary"
        onClick={() => handleExport('word')}
        loading={exporting === 'word'}
        className="flex-1 cursor-pointer"
        type="button"
      >
        {exporting === 'word' ? 'Exporting...' : '📝 Download Word'}
      </Button>
    </div>
  );
}
