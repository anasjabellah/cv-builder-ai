'use client';

import { v4 as uuidv4 } from 'uuid';
import type { ExperienceEntry } from '@/types';
import Input from '@/shared/ui/Input';
import Textarea from '@/shared/ui/Textarea';
import Button from '@/shared/ui/Button';

interface WorkExperienceProps {
  errors?: { startDate?: string; endDate?: string }[];
  data: ExperienceEntry[];
  onChange: (data: ExperienceEntry[]) => void;
}

export default function WorkExperience({ data, onChange, errors }: WorkExperienceProps) {
  const update = (index: number, field: keyof ExperienceEntry, value: unknown) => {
    const updated = [...data];
    (updated[index] as any)[field] = value;
    onChange(updated);
  };

  const add = () => {
    onChange([
      ...data,
      { id: uuidv4(), company: '', position: '', startDate: '', endDate: '', current: false, description: '' },
    ]);
  };

  const remove = (index: number) => {
    if (data.length <= 1) return;
    onChange(data.filter((_, i) => i !== index));
  };

  const move = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === data.length - 1)
    )
      return;
    const updated = [...data];
    const target = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {data.map((exp, i) => (
        <div
          key={exp.id}
          className="p-4 bg-[#111111] rounded-xl border border-[#27272A] space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A1A1AA]">Experience #{i + 1}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => move(i, 'up')}
                disabled={i === 0}
                className="p-1 text-[#A1A1AA] hover:text-white disabled:opacity-30 cursor-pointer"
                type="button"
              >
                ↑
              </button>
              <button
                onClick={() => move(i, 'down')}
                disabled={i === data.length - 1}
                className="p-1 text-[#A1A1AA] hover:text-white disabled:opacity-30 cursor-pointer"
                type="button"
              >
                ↓
              </button>
              <button
                onClick={() => remove(i)}
                className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                type="button"
                title="Remove"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Company"
              value={exp.company}
              onChange={(e) => update(i, 'company', e.target.value)}
              placeholder="Acme Inc."
            />
            <Input
              label="Position"
              value={exp.position}
              onChange={(e) => update(i, 'position', e.target.value)}
              placeholder="Software Engineer"
            />
            <Input
              label="Start Date"
              value={exp.startDate}
              onChange={(e) => update(i, 'startDate', e.target.value)}
              placeholder="Jan 2020"
              error={errors?.[i]?.startDate}
            />
            <div className="space-y-1">
              <Input
                label="End Date"
                value={exp.endDate}
                onChange={(e) => update(i, 'endDate', e.target.value)}
                placeholder="Dec 2023"
                disabled={exp.current}
                error={errors?.[i]?.endDate}
              />
              <label className="flex items-center gap-2 text-xs text-[#A1A1AA] cursor-pointer">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => update(i, 'current', e.target.checked)}
                  className="rounded border-[#27272A] bg-[#1A1A1A] text-[#7C3AED] focus:ring-[#7C3AED]"
                />
                Currently working here
              </label>
            </div>
          </div>
          <Textarea
            label="Description"
            value={exp.description}
            onChange={(e) => update(i, 'description', e.target.value)}
            placeholder="Describe your responsibilities and achievements..."
            rows={3}
          />
        </div>
      ))}
      <Button variant="ghost" onClick={add} className="w-full border border-dashed border-[#27272A] cursor-pointer" type="button">
        + Add Experience
      </Button>
    </div>
  );
}
