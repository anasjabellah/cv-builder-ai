'use client';

import type { CVStyle } from '@/types';

interface StylePickerProps {
  selected: CVStyle;
  onSelect: (style: CVStyle) => void;
}

const STYLES: { id: CVStyle; name: string; description: string; colors: string; preview: string }[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column with navy sidebar. Clean, professional.',
    colors: 'bg-[#0F172A]',
    preview: 'linear-gradient(180deg, #0F172A 30%, #FFFFFF 30%)',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional single-column. Formal, serif typography.',
    colors: 'bg-[#F8F8F8] border border-[#E5E7EB]',
    preview: '#FFFFFF',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold purple gradient. Fun, modern, eye-catching.',
    colors: 'bg-gradient-to-b from-[#7C3AED] to-[#4F46E5]',
    preview: 'linear-gradient(180deg, #7C3AED, #4F46E5)',
  },
];

export default function StylePicker({ selected, onSelect }: StylePickerProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {STYLES.map((style) => (
        <button
          key={style.id}
          type="button"
          onClick={() => onSelect(style.id)}
          className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
            selected === style.id
              ? 'border-[#7C3AED] bg-[#7C3AED]/5'
              : 'border-[#27272A] bg-[#111111] hover:border-[#7C3AED]/50'
          }`}
        >
          {selected === style.id && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
          <div
            className="w-full h-16 rounded-lg mb-2"
            style={{
              background:
                style.id === 'modern'
                  ? 'linear-gradient(180deg, #0F172A 30%, #FFFFFF 30%)'
                  : style.id === 'creative'
                  ? 'linear-gradient(180deg, #7C3AED, #4F46E5)'
                  : '#FFFFFF',
              border: style.id === 'classic' ? '1px solid #E5E7EB' : 'none',
            }}
          />
          <span className="text-sm font-medium text-white">{style.name}</span>
          <span className="text-xs text-[#A1A1AA] text-center leading-tight">
            {style.description}
          </span>
        </button>
      ))}
    </div>
  );
}
