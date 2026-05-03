'use client';

import { v4 as uuidv4 } from 'uuid';
import type { EducationEntry } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface EducationProps {
  data: EducationEntry[];
  onChange: (data: EducationEntry[]) => void;
}

export default function Education({ data, onChange }: EducationProps) {
  const update = (index: number, field: keyof EducationEntry, value: unknown) => {
    const updated = [...data];
    (updated[index] as any)[field] = value;
    onChange(updated);
  };

  const add = () => {
    onChange([
      ...data,
      { id: uuidv4(), institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '' },
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
      {data.map((edu, i) => (
        <div
          key={edu.id}
          className="p-4 bg-[#111111] rounded-xl border border-[#27272A] space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A1A1AA]">Education #{i + 1}</span>
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
              label="Institution"
              value={edu.institution}
              onChange={(e) => update(i, 'institution', e.target.value)}
              placeholder="University of XYZ"
            />
            <Input
              label="Degree"
              value={edu.degree}
              onChange={(e) => update(i, 'degree', e.target.value)}
              placeholder="Bachelor's"
            />
            <Input
              label="Field of Study"
              value={edu.field}
              onChange={(e) => update(i, 'field', e.target.value)}
              placeholder="Computer Science"
            />
            <Input
              label="Grade"
              value={edu.grade}
              onChange={(e) => update(i, 'grade', e.target.value)}
              placeholder="3.8 GPA"
            />
            <Input
              label="Start Date"
              value={edu.startDate}
              onChange={(e) => update(i, 'startDate', e.target.value)}
              placeholder="Sep 2016"
            />
            <Input
              label="End Date"
              value={edu.endDate}
              onChange={(e) => update(i, 'endDate', e.target.value)}
              placeholder="Jun 2020"
            />
          </div>
        </div>
      ))}
      <Button variant="ghost" onClick={add} className="w-full border border-dashed border-[#27272A] cursor-pointer" type="button">
        + Add Education
      </Button>
    </div>
  );
}
