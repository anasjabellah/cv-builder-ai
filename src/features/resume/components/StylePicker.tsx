'use client';

import { useMemo } from 'react';
import { emptyFormData } from '@/types';
import type { CVStyle, CVFormData } from '@/types';
import { modernTemplate, classicTemplate, creativeTemplate } from '@/features/ai/services/cv-templates';

interface StylePickerProps {
  selected: CVStyle;
  onSelect: (style: CVStyle) => void;
}

// Define the style metadata used for the selector cards
const STYLES: {
  id: CVStyle;
  name: string;
  description: string;
}[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column with navy sidebar. Clean, professional.',
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional single-column. Formal, serif typography.',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold purple gradient. Fun, modern, eye-catching.',
  },
];

/**
 * Generates a small, reusable sample CV data object. This data is ONLY used for the
 * thumbnail previews; it never reaches the server.
 */
const useSampleData = (): CVFormData => {
  const data = emptyFormData();
  data.personalInfo.fullName = 'John Doe';
  data.personalInfo.email = 'john@example.com';
  data.personalInfo.phone = '+1 555 123 4567';
  data.personalInfo.address = '123 Main St, Anytown, USA';
  data.personalInfo.linkedin = 'linkedin.com/in/johndoe';
  data.personalInfo.website = 'johndoe.com';
  data.summary = 'Experienced software engineer passionate about building scalable web applications.';

  data.experience = [
    {
      id: '1',
      company: 'Acme Corp',
      position: 'Senior Engineer',
      startDate: '2020-01',
      endDate: '',
      current: true,
      description: 'Led a team of 5 engineers to develop a SaaS platform.',
    },
    {
      id: '2',
      company: 'Beta Ltd',
      position: 'Software Engineer',
      startDate: '2017-06',
      endDate: '2019-12',
      current: false,
      description: 'Built full-stack features for an e-commerce site.',
    },
  ];

  data.education = [
    {
      id: '1',
      institution: 'University of Example',
      degree: 'B.Sc.',
      field: 'Computer Science',
      startDate: '2013-09',
      endDate: '2017-05',
      grade: 'A',
    },
  ];

  data.skills = [
    { id: '1', category: 'Languages', items: ['JavaScript', 'TypeScript', 'Python'] },
    { id: '2', category: 'Frameworks', items: ['React', 'Next.js', 'Node.js'] },
  ];

  data.languages = [
    { id: '1', name: 'English', level: 'Native' },
    { id: '2', name: 'Spanish', level: 'Intermediate' },
  ];

  data.certifications = [
    { id: '1', name: 'AWS Certified Solutions Architect', issuer: 'Amazon', date: '2022-08' },
  ];

  return data;
};

export default function StylePicker({ selected, onSelect }: StylePickerProps) {
  // Memoize the sample data so it is created only once per component lifecycle
  const sampleData = useMemo(() => useSampleData(), []);

  // Pre-render the three style previews – the HTML strings are cheap to generate once.
  const previews = useMemo(
    () => ({
      modern: modernTemplate(sampleData),
      classic: classicTemplate(sampleData),
      creative: creativeTemplate(sampleData),
    }),
    [sampleData]
  );

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
          {/* Selection checkmark */}
          {selected === style.id && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}

          {/* Thumbnail preview: fixed-size wrapper + scaled iframe */}
          <div
            className="mb-2"
            style={{
              width: '120px',
              height: '170px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <iframe
              srcDoc={previews[style.id]}
              style={{
                width: '794px',
                height: '1123px',
                transform: 'scale(0.15)',
                transformOrigin: 'top left',
                pointerEvents: 'none',
                border: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          </div>

          <span className="text-sm font-medium text-white">{style.name}</span>
          <span className="text-xs text-[#A1A1AA] text-center leading-tight">
            {style.description}
          </span>
        </button>
      ))}
    </div>
  );
}
