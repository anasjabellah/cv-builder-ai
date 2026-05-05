'use client';

import { useState, useRef } from 'react';
import type { CVFormData } from '@/types';
import Button from '@/components/ui/Button';

interface Props {
  formData: CVFormData;
  onGenerated: (html: string) => void;
}

export default function CloneDesignButton({ formData, onGenerated }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('image', file);
      form.append('formData', JSON.stringify(formData));

      const response = await fetch('/api/clone-design', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to clone design');
      }

      const { html } = await response.json();
      onGenerated(html);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        loading={isLoading}
        className="cursor-pointer"
        type="button"
      >
        {isLoading ? 'AI is analyzing the design...' : '🎨 Clone a Design'}
      </Button>
      {error && (
        <p className="text-red-500 text-sm mt-1 absolute top-full left-0 whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  );
}
