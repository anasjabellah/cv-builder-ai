'use client';

import { v4 as uuidv4 } from 'uuid';
import type { LanguageEntry, LanguageLevel } from '@/types';
import Input from '@/shared/ui/Input';
import Button from '@/shared/ui/Button';

const LEVELS: LanguageLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Native'];

interface LanguagesProps {
  data: LanguageEntry[];
  onChange: (data: LanguageEntry[]) => void;
}

export default function Languages({ data, onChange }: LanguagesProps) {
  const update = (index: number, field: keyof LanguageEntry, value: unknown) => {
    const updated = [...data];
    (updated[index] as any)[field] = value;
    onChange(updated);
  };

  const add = () => {
    onChange([...data, { id: uuidv4(), name: '', level: 'Intermediate' }]);
  };

  const remove = (index: number) => {
    if (data.length <= 1) return;
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {data.map((lang, i) => (
        <div
          key={lang.id}
          className="p-4 bg-[#111111] rounded-xl border border-[#27272A] space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A1A1AA]">Language #{i + 1}</span>
            <button
              onClick={() => remove(i)}
              className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
              type="button"
              title="Remove"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Language"
              value={lang.name}
              onChange={(e) => update(i, 'name', e.target.value)}
              placeholder="English"
            />
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#A1A1AA]">
                Level
              </label>
              <select
                value={lang.level}
                onChange={(e) => update(i, 'level', e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C3AED] transition-colors"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
      <Button variant="ghost" onClick={add} className="w-full border border-dashed border-[#27272A] cursor-pointer" type="button">
        + Add Language
      </Button>
    </div>
  );
}
