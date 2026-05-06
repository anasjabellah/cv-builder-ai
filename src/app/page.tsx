'use client';

import { useState, useCallback, useEffect } from 'react';
import type { CVFormData, CVStyle } from '@/types';
import { emptyFormData } from '@/types';
import CVUpload from '@/components/upload/CVUpload';
import CVForm from '@/components/form/CVForm';
import CVPreview from '@/components/preview/CVPreview';
import StylePicker from '@/components/preview/StylePicker';
import ExportButtons from '@/components/export/ExportButtons';
import ATSResult from '@/components/ui/ATSResult';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner'// unused but kept for future use
import { auth, googleProvider, firestore } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type Step = 'upload' | 'form';

export default function HomePage() {
  const [step, setStep] = useState<Step>('upload');
  const [formData, setFormData] = useState<CVFormData>(emptyFormData());
  const [style, setStyle] = useState<CVStyle>('modern');
  const [generating, setGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // unused but kept for future use
  const [user, setUser] = useState<any>(null);
  const [atsResult, setAtsResult] = useState<any>(null);
  const [checkingATS, setCheckingATS] = useState(false);

  // Listen for auth state changes and load saved CV data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(firestore, 'cvs', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as { formData: CVFormData; style: CVStyle; generatedHtml?: string };
          setFormData(data.formData);
          setStyle(data.style);
          if (data.generatedHtml) {
            setGeneratedHtml(data.generatedHtml);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleParsed = useCallback((data: CVFormData) => {
    setFormData(data);
    setStep('form');
    setError(null);
  }, []);

  const handleUploadError = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleManualStart = useCallback(() => {
    setFormData(emptyFormData());
    setStep('form');
    setError(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, style }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate CV');
      }

      setGeneratedHtml(data.html);
      // Save to Firestore if user is logged in
      if (user) {
        await setDoc(doc(firestore, 'cvs', user.uid), { formData, style, generatedHtml: data.html, updatedAt: new Date() });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate CV');
    } finally {
      setGenerating(false);
    }
  }, [formData, style]);

  // Debug: log generatedHtml changes
  useEffect(() => {
    console.log('[Page] generatedHtml:', generatedHtml ? `${generatedHtml.length} chars` : 'null');
  }, [generatedHtml]);


  const handleCheckATS = useCallback(async () => {
    setCheckingATS(true);
    setAtsResult(null);
    setError(null);
    try {
      const res = await fetch('/api/check-ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ATS check failed');
      setAtsResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ATS check failed');
    } finally {
      setCheckingATS(false);
    }
  }, [formData]);

  const handleRegenerate = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  if (step === 'upload') {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-[#27272A] bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
                <span className="text-white font-bold text-sm">CV</span>
              </div>
              <span className="text-lg font-semibold text-white">
                CV Builder <span className="text-[#7C3AED]">AI</span>
              </span>
            </div>
          </div>
        </header>

        {/* Upload Section */}
        <main className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="w-full max-w-2xl">
            {/* Hero */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                Turn your old CV into a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#A78BFA]">
                  stunning
                </span>{' '}
                one
              </h1>
              <p className="text-xl text-[#A1A1AA]">
                Powered by AI — upload, edit, generate, export.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <CVUpload onParsed={handleParsed} onError={handleUploadError} />

            <div className="mt-8 text-center">
              <p className="text-sm text-[#52525B] mb-3">or</p>
              <Button
                variant="secondary"
                onClick={handleManualStart}
                className="cursor-pointer"
                type="button"
              >
                Fill the form manually
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[#27272A] bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
              <span className="text-white font-bold text-sm">CV</span>
            </div>
            <span className="text-lg font-semibold text-white">
              CV Builder <span className="text-[#7C3AED]">AI</span>
            </span>
          </div>
           <div className="flex items-center gap-3">
            {user ? (
              <Button
                variant="secondary"
                onClick={async () => { await signOut(auth); setUser(null); }}
                className="cursor-pointer text-sm"
                type="button"
              >
                Logout
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={async () => { try { await signInWithPopup(auth, googleProvider); } catch (e: any) { if (e?.code !== 'auth/popup-closed-by-user') { setError(e?.message || 'Authentication failed'); } } }}
                className="cursor-pointer text-sm"
                type="button"
              >
                Login with Google
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                setStep("upload");
                setGeneratedHtml(null);
              }}
              className="cursor-pointer text-sm"
              type="button"
            >
              ← Upload New CV
            </Button>
          </div>
        </div>
      </header>

      {/* Steps Indicator */}
      <div className="border-b border-[#27272A] bg-[#0A0A0A]">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto">
          {['1. Fill Info', '2. Pick Style', '3. Generate', '4. Export'].map(
            (label, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-[#27272A]">→</span>}
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    (label.startsWith('1') && !generatedHtml) ||
                    (label.startsWith('2') && !generatedHtml) ||
                    (label.startsWith('3') && !generatedHtml)
                      ? 'bg-[#7C3AED]/20 text-[#A78BFA]'
                      : label.startsWith('4') && generatedHtml
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-[#1A1A1A] text-[#52525B]'
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Main Content */}

        <ATSResult result={atsResult} onClose={() => setAtsResult(null)} />
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          {/* LEFT: Form */}
          <div className="space-y-4 overflow-y-auto pb-6 pr-2">
            <CVForm
              data={formData}
              onChange={setFormData}
              style={style}
              onStyleChange={setStyle}
              onGenerate={handleGenerate}
              generating={generating}
            />
          </div>

          {/* RIGHT: Preview */}
          <div className="space-y-4 sticky top-[120px]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-[#A1A1AA] uppercase tracking-wide">
                Preview
              </h2>
            </div>

            <StylePicker selected={style} onSelect={setStyle} />

            <CVPreview key={user?.uid || 'guest'} html={generatedHtml} generating={generating} />

            {generatedHtml && (
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  onClick={handleRegenerate}
                  className="w-full cursor-pointer"
                  type="button"
                >
                  ðŸ”„ Regenerate with Different Design
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleCheckATS}
                  className="w-full cursor-pointer"
                  type="button"
                  disabled={checkingATS}
                >
                  {checkingATS ? 'Checking ATS...' : 'Check ATS Score'}
                </Button>
                <ExportButtons
                  html={generatedHtml}
                  formData={formData}
                  style={style}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


