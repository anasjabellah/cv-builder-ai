'use client';

import { v4 as uuidv4 } from 'uuid';
import type { CertificationEntry } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface CertificationsProps {
  data: CertificationEntry[];
  onChange: (data: CertificationEntry[]) => void;
}

export default function Certifications({ data, onChange }: CertificationsProps) {
  const update = (index: number, field: keyof CertificationEntry, value: unknown) => {
    const updated = [...data];
    (updated[index] as any)[field] = value;
    onChange(updated);
  };

  const add = () => {
    onChange([...data, { id: uuidv4(), name: '', issuer: '', date: '' }]);
  };

  const remove = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {data.length === 0 && (
        <p className="text-sm text-[#52525B] italic">No certifications added yet.</p>
      )}
      {data.map((cert, i) => (
        <div
          key={cert.id}
          className="p-4 bg-[#111111] rounded-xl border border-[#27272A] space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#A1A1AA]">Certification #{i + 1}</span>
            <button
              onClick={() => remove(i)}
              className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
              type="button"
              title="Remove"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Name"
              value={cert.name}
              onChange={(e) => update(i, 'name', e.target.value)}
              placeholder="AWS Certified Developer"
            />
            <Input
              label="Issuer"
              value={cert.issuer}
              onChange={(e) => update(i, 'issuer', e.target.value)}
              placeholder="Amazon Web Services"
            />
            <Input
              label="Date"
              value={cert.date}
              onChange={(e) => update(i, 'date', e.target.value)}
              placeholder="Jan 2023"
            />
          </div>
        </div>
      ))}
      <Button variant="ghost" onClick={add} className="w-full border border-dashed border-[#27272A] cursor-pointer" type="button">
        + Add Certification
      </Button>
    </div>
  );
}
