'use client';

import { useCallback, useState, useRef } from 'react';
import type { CVFormData } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CVUploadProps {
  onParsed: (data: CVFormData) => void;
  onError: (message: string) => void;
}

export default function CVUpload({ onParsed, onError }: CVUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const allowed = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];
      if (!allowed.includes(file.type)) {
        onError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
        return;
      }

      setFileName(file.name);
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/parse-cv', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to parse CV');
        }

        onParsed(data.formData);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to parse CV');
      } finally {
        setLoading(false);
      }
    },
    [onParsed, onError]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="lg" message="Reading your CV..." />
        {fileName && (
          <p className="mt-4 text-sm text-[#A1A1AA]">{fileName}</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-[#7C3AED] bg-[#7C3AED]/10'
            : 'border-[#27272A] bg-[#111111] hover:border-[#7C3AED]/50 hover:bg-[#111111]/80'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#7C3AED]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <p className="text-base font-medium text-white">
              Drop your CV here, or click to browse
            </p>
            <p className="text-sm text-[#A1A1AA] mt-1">
              Supports PDF, DOC, DOCX
            </p>
          </div>
          {fileName && (
            <p className="text-sm text-[#7C3AED]">{fileName}</p>
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  );
}
