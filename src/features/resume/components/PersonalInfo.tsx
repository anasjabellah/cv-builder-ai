'use client';

import type { PersonalInfo } from '@/types';
import Input from '@/shared/ui/Input';

interface PersonalInfoProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
  errors?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
}

export default function PersonalInfo({ data, onChange, errors }: PersonalInfoProps) {
  const update = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          value={data.fullName}
          onChange={(e) => update('fullName', e.target.value)}
          placeholder="John Doe"
          error={errors?.fullName}
        />
        <Input
          label="Email"
          type="email"
          value={data.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="john@example.com"
          error={errors?.email}
        />
        <Input
          label="Phone"
          value={data.phone}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="+1 234 567 890"
          error={errors?.phone}
        />
        <Input
          label="Address"
          value={data.address}
          onChange={(e) => update('address', e.target.value)}
          placeholder="City, Country"
        />
        <Input
          label="LinkedIn"
          value={data.linkedin}
          onChange={(e) => update('linkedin', e.target.value)}
          placeholder="linkedin.com/in/johndoe"
        />
        <Input
          label="GitHub"
          value={data.github}
          onChange={(e) => update('github', e.target.value)}
          placeholder="github.com/johndoe"
        />
        <Input
          label="Website"
          value={data.website}
          onChange={(e) => update('website', e.target.value)}
          placeholder="https://johndoe.com"
        />
      </div>
    </div>
  );
}
