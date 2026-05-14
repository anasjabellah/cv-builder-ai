'use client';

import { v4 as uuidv4 } from 'uuid';
import type { SkillGroup } from '@/types';
import Input from '@/shared/ui/Input';
import Button from '@/shared/ui/Button';

interface SkillsProps {
  data: SkillGroup[];
  onChange: (data: SkillGroup[]) => void;
}

export default function Skills({ data, onChange }: SkillsProps) {
  const update = (index: number, field: keyof SkillGroup, value: unknown) => {
    const updated = [...data];
    (updated[index] as any)[field] = value;
    onChange(updated);
  };

  const updateItems = (index: number, itemsStr: string) => {
    const updated = [...data];
    updated[index].items = itemsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onChange(updated);
  };

  const add = () => {
    onChange([...data, { id: uuidv4(), category: '', items: [] }]);
  };

  const remove = (index: number) => {
    if (data.length <= 1) return;
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {data.map((group, i) => (
        <div
          key={group.id}
          className="p-4 bg-[#111111] rounded-xl border border-[#27272A] space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A1A1AA]">Skill Group #{i + 1}</span>
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
              label="Category"
              value={group.category}
              onChange={(e) => update(i, 'category', e.target.value)}
              placeholder="Programming Languages"
            />
            <Input
              label="Skills (comma-separated)"
              value={group.items.join(', ')}
              onChange={(e) => updateItems(i, e.target.value)}
              placeholder="JavaScript, TypeScript, Python"
            />
          </div>
        </div>
      ))}
      <Button variant="ghost" onClick={add} className="w-full border border-dashed border-[#27272A] cursor-pointer" type="button">
        + Add Skill Group
      </Button>
    </div>
  );
}
