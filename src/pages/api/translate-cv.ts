import type { NextApiRequest, NextApiResponse } from 'next';
import { translateCV } from '@/lib/translate-cv';
import type { CVFormData } from '@/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { cvData, targetLanguage, targetCountry } = req.body as {
      cvData: CVFormData;
      targetLanguage: string;
      targetCountry: string;
    };

    if (!cvData || !targetLanguage || !targetCountry) {
      res.status(400).json({ error: 'Missing cvData, targetLanguage, or targetCountry' });
      return;
    }

    const translatedData = await translateCV(cvData, targetLanguage, targetCountry);
    res.status(200).json({ formData: translatedData });
  } catch (error) {
    console.error('TRANSLATE CV ERROR:', error);
    const message = error instanceof Error ? error.message : 'Failed to translate CV';
    res.status(500).json({ error: message });
  }
}
