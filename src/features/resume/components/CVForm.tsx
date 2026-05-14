'use client';

import { useState } from 'react';
import type { CVFormData, CVStyle } from '@/types';
import { emptyFormData } from '@/types';
import { validateFormData, ValidationErrors } from '@/shared/utils/validation';
import PersonalInfo from './PersonalInfo';
import WorkExperience from './WorkExperience';
import Education from './Education';
import Skills from './Skills';
import Languages from './Languages';
import Certifications from './Certifications';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';

interface CVFormProps {
  data: CVFormData;
  onChange: (data: CVFormData) => void;
  onGenerate: () => void;
  generating: boolean;
  disabled?: boolean;
}

type SectionKey = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'languages' | 'certifications';

export default function CVForm({
  data,
  onChange,
  onGenerate,
  generating,
  disabled = false,
}: CVFormProps) {
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    personal: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    languages: true,
    certifications: true,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const toggle = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sectionHeader = (key: SectionKey, title: string, count?: number) => (
    <button
      type="button"
      onClick={() => toggle(key)}
      className="flex items-center justify-between w-full px-4 py-3 bg-[#111111] border border-[#27272A] rounded-xl hover:border-[#7C3AED]/50 transition-colors cursor-pointer"
    >
      <span className="text-sm font-medium text-white">
        {title}
        {count !== undefined && (
          <span className="ml-2 text-xs text-[#A1A1AA]">({count})</span>
        )}
      </span>
      <span className="text-[#A1A1AA] text-xs">
        {openSections[key] ? '▼' : '▶'}
      </span>
    </button>
  );

  const updatePersonal = (personalInfo: typeof data.personalInfo) => {
    onChange({ ...data, personalInfo });
    // Clear errors for this section on change
    if (errors.personalInfo) {
      setErrors(prev => ({ ...prev, personalInfo: undefined }));
    }
  };

  const updateExperience = (experience: typeof data.experience) => {
    onChange({ ...data, experience });
    if (errors.experience) {
      setErrors(prev => ({ ...prev, experience: undefined }));
    }
  };

  const updateEducation = (education: typeof data.education) => {
    onChange({ ...data, education });
    if (errors.education) {
      setErrors(prev => ({ ...prev, education: undefined }));
    }
  };

  const updateSkills = (skills: typeof data.skills) => {
    onChange({ ...data, skills });
  };

  const updateLanguages = (languages: typeof data.languages) => {
    onChange({ ...data, languages });
  };

  const updateCertifications = (certifications: typeof data.certifications) => {
    onChange({ ...data, certifications });
  };

  const updateSummary = (summary: string) => {
    onChange({ ...data, summary });
  };

  const resetForm = () => {
    onChange(emptyFormData());
    setErrors({});
  };

  const handleGenerate = () => {
    const validationErrors = validateFormData(data);
    setErrors(validationErrors);
    onGenerate();
  };

  return (
    <div className="space-y-3">
      {/* Personal Info */}
      {sectionHeader('personal', '👤 Personal Info')}
      {openSections.personal && (
        <div className="px-4 pb-3">
          <PersonalInfo
            data={data.personalInfo}
            onChange={updatePersonal}
            errors={errors.personalInfo}
          />
          {errors.form && (
            <p className="text-xs text-red-500 mt-2">{errors.form}</p>
          )}
        </div>
      )}

      {/* Summary */}
      {sectionHeader('summary', '📝 Professional Summary')}
      {openSections.summary && (
        <div className="px-4 pb-3">
          <Textarea
            label="Summary"
            value={data.summary}
            onChange={(e) => updateSummary(e.target.value)}
            placeholder="A passionate software engineer with 5+ years of experience..."
            rows={4}
          />
        </div>
      )}

      {/* Experience */}
      {sectionHeader('experience', '💼 Work Experience', data.experience.length)}
      {openSections.experience && (
        <div className="px-4 pb-3">
          <WorkExperience
            data={data.experience}
            onChange={updateExperience}
            errors={errors.experience}
          />
        </div>
      )}

      {/* Education */}
      {sectionHeader('education', '🎓 Education', data.education.length)}
      {openSections.education && (
        <div className="px-4 pb-3">
          <Education
            data={data.education}
            onChange={updateEducation}
            errors={errors.education}
          />
        </div>
      )}

      {/* Skills */}
      {sectionHeader('skills', '⚡ Skills', data.skills.length)}
      {openSections.skills && (
        <div className="px-4 pb-3">
          <Skills data={data.skills} onChange={updateSkills} />
        </div>
      )}

      {/* Languages */}
      {sectionHeader('languages', '🌍 Languages', data.languages.length)}
      {openSections.languages && (
        <div className="px-4 pb-3">
          <Languages data={data.languages} onChange={updateLanguages} />
        </div>
      )}

      {/* Certifications */}
      {sectionHeader('certifications', '🏆 Certifications', data.certifications.length)}
      {openSections.certifications && (
        <div className="px-4 pb-3">
          <Certifications data={data.certifications} onChange={updateCertifications} />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-[#27272A]">
        <Button
          variant="secondary"
          onClick={resetForm}
          className="flex-1 cursor-pointer"
          type="button"
        >
          Reset Form
        </Button>
        <Button
          variant="primary"
          onClick={handleGenerate}
          loading={generating}
          disabled={disabled}
          className="flex-2 cursor-pointer"
          type="button"
        >
          {generating ? 'AI is designing your CV...' : '✨ Generate CV'}
        </Button>
      </div>
    </div>
  );
}
