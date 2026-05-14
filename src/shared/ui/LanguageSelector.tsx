'use client';

import { useState } from 'react';
import Button from '@/shared/ui/Button';
import Toast from '@/shared/ui/Toast';

interface LanguageOption {
  code: string;
  language: string;
  country: string;
  flag: string; // emoji flag
}

const LANGUAGES: LanguageOption[] = [
  { code: 'fr', language: 'French', country: 'France', flag: '🇫🇷' },
  { code: 'de', language: 'German', country: 'Germany', flag: '🇩🇪' },
  { code: 'es', language: 'Spanish', country: 'Spain', flag: '🇪🇸' },
  { code: 'en-US', language: 'English', country: 'USA', flag: '🇺🇸' },
  { code: 'en-GB', language: 'English', country: 'UK', flag: '🇬🇧' },
  { code: 'ar', language: 'Arabic', country: 'Gulf', flag: '🇸🇦' },
  { code: 'it', language: 'Italian', country: 'Italy', flag: '🇮🇹' },
];

interface LanguageSelectorProps {
  cvData: any;
  onTranslate: (targetLanguage: string, targetCountry: string) => void;
  isTranslating?: boolean;
}

export default function LanguageSelector({ cvData, onTranslate, isTranslating }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(LANGUAGES[0]);
  const [translating, setTranslating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTranslate = async () => {
    if (!onTranslate) {
      console.error('onTranslate prop not provided');
      return;
    }
    setTranslating(true);
    try {
      await onTranslate(selectedLanguage.language, selectedLanguage.country);
      showToast(`Requested translation to ${selectedLanguage.language} (${selectedLanguage.country})`);
    } catch (err) {
      console.error('Translation request error:', err);
      showToast(err instanceof Error ? err.message : 'Failed to request translation');
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white">Translate CV to:</span>
        <select
          value={selectedLanguage.code}
          onChange={(e) => {
            const lang = LANGUAGES.find((l) => l.code === e.target.value);
            if (lang) setSelectedLanguage(lang);
          }}
          className="w-full bg-[#1A1A1A] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/50 transition-colors"
          disabled={isTranslating}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.language} ({lang.country})
            </option>
          ))}
        </select>
      </div>

      <Button
        variant="primary"
        onClick={handleTranslate}
        loading={isTranslating}
        className="w-full cursor-pointer"
        disabled={!cvData || Object.keys(cvData).length === 0} // Disable if no CV data
        type="button"
      >
        {translating ? 'Translating...' : 'Translate CV'}
      </Button>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}