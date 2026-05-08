'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { CVFormData, CVStyle } from '@/types';
import { emptyFormData } from '@/types';
import CVUpload from '@/components/upload/CVUpload';
import CVForm from '@/components/form/CVForm';
import CVPreview from '@/components/preview/CVPreview';
import StylePicker from '@/components/preview/StylePicker';
import ExportButtons from '@/components/export/ExportButtons';
import ATSResult from '@/components/ui/ATSResult';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { auth, firestore } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Navbar from '@/components/layout/Navbar';

type Step = 'upload' | 'form';

export default function HomePage() {
  const [step, setStep] = useState<Step>('upload');
  const [formData, setFormData] = useState<CVFormData>(emptyFormData());
  const [style, setStyle] = useState<CVStyle>('modern');
  const [generating, setGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [atsResult, setAtsResult] = useState<any>(null);
  const [checkingATS, setCheckingATS] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (!res.ok) throw new Error(data.error || 'Failed to generate CV');
      setGeneratedHtml(data.html);
      if (user) {
        await setDoc(doc(firestore, 'cvs', user.uid), { formData, style, generatedHtml: data.html, updatedAt: new Date() });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate CV');
    } finally {
      setGenerating(false);
    }
  }, [formData, style]);

  const handleCheckATS = useCallback(async () => {
    setCheckingATS(true);
    setAtsResult(null);
    setError(null);
    try {
      const resumeContent = JSON.stringify(formData);
      const res = await fetch('/api/check-ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: resumeContent }),
      });
      const data = await res.json();
      console.log('ATS API response:', data);
      if (!res.ok) throw new Error(data.error || 'ATS check failed');
      const analysis = data.analysis || {};
      const result = {
        score: analysis.score ?? 0,
        strengths: [],
        weaknesses: analysis.issues ?? [],
        suggestions: analysis.suggestions ?? [],
      };
      setAtsResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ATS check failed');
    } finally {
      setCheckingATS(false);
    }
  }, [formData]);

  const handleRegenerate = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  // Custom file upload handler
  const handleFileUpload = useCallback(async (file: File) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (!allowed.includes(file.type)) {
      handleUploadError('Please upload a PDF or Word document (.pdf, .doc, .docx)');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse CV');
      handleParsed(data.formData);
    } catch (err) {
      handleUploadError(err instanceof Error ? err.message : 'Failed to parse CV');
    }
  }, [handleParsed, handleUploadError]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  // Upload section - Premium AI SaaS landing page
  const uploadSection = (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#C800DF] opacity-15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#E60076] opacity-10 rounded-full blur-3xl" />
      </div>

      <Navbar showLogin showJobMatcher showUploadNew={false} step={step} onStepChange={setStep} onGeneratedHtmlChange={setGeneratedHtml} />

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-20 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side */}
          <div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Turn your CV into a{" "}
              <span className="bg-gradient-to-r from-[#C800DF] to-[#E60076] bg-clip-text text-transparent">
                stunning
              </span>
              {' '}one
            </h1>
            <p className="text-xl text-[#A1A1AA] font-mono mb-8">
              Powered by AI — upload, edit, generate, export.
            </p>
            <div className="flex gap-4">
              <label className="cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="primary"
                  className="bg-gradient-to-r from-[#C800DF] to-[#E60076] border-0 text-white"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  Upload CV
                </Button>
              </label>
              <Button variant="ghost" onClick={handleManualStart} type="button">
                Fill Manually
              </Button>
            </div>
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right side - Floating cards */}
          <div className="relative h-96 hidden lg:block">
            {/* Fake CV preview */}
            <div className="bg-white/5 backdrop-blur-sm border border-[#C800DF]/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(200,0,223,0.15)]">
              <div className="space-y-4">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/5 rounded w-full"></div>
                <div className="h-3 bg-white/5 rounded w-5/6"></div>
                <div className="space-y-2 mt-4">
                  <div className="h-3 bg-white/10 rounded w-1/4"></div>
                  <div className="h-3 bg-white/5 rounded w-full"></div>
                  <div className="h-3 bg-white/5 rounded w-5/6"></div>
                </div>
              </div>
            </div>

            {/* ATS Score badge */}
            <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2">
              <span className="text-white font-bold">ATS Score: 87%</span>
            </div>

            {/* AI Analyzing card */}
            <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2">
              <span className="text-white text-sm">🤖 AI Analyzing...</span>
            </div>
          </div>
        </div>
      </main>

      {/* Features Bento Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AI Extraction */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-white font-bold mb-2">AI Extraction</h3>
            <p className="text-[#A1A1AA] text-sm">Upload any CV, AI extracts data automatically</p>
          </div>

          {/* 3 Templates */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="text-white font-bold mb-2">3 Templates</h3>
            <p className="text-[#A1A1AA] text-sm">Modern, Classic, Creative styles</p>
          </div>

          {/* ATS Score */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-white font-bold mb-2">ATS Score</h3>
            <p className="text-[#A1A1AA] text-sm">Check ATS compatibility instantly</p>
          </div>

          {/* Job Matcher */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300 md:col-span-1">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-white font-bold mb-2">Job Matcher</h3>
            <p className="text-[#A1A1AA] text-sm">Match CV with job descriptions</p>
          </div>

          {/* Export PDF */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="text-3xl mb-3">📄</div>
            <h3 className="text-white font-bold mb-2">Export PDF</h3>
            <p className="text-[#A1A1AA] text-sm">Download as PDF or Word document</p>
          </div>

          {/* Auto Save */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-white font-bold mb-2">Auto Save</h3>
            <p className="text-[#A1A1AA] text-sm">Firebase saves your data securely</p>
          </div>
        </div>
      </section>
    </div>
  );

  // Form section (unchanged)
  const formSection = (
    <>
      <div className="border-b border-[rgba(168,85,247,0.15)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm">
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
                      : 'bg-[#1A1A1A] text-muted'
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          )}
        </div>
      </div>
      <ATSResult result={atsResult} onClose={() => setAtsResult(null)} />
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          <div className="space-y-4 overflow-y-auto pb-6 pr-2">
            <CVForm data={formData} onChange={setFormData} style={style} onStyleChange={setStyle} onGenerate={handleGenerate} generating={generating} />
          </div>
          <div className="space-y-4 sticky top-[120px]">
            <StylePicker selected={style} onSelect={setStyle} />
            <CVPreview key={user?.uid || 'guest'} html={generatedHtml} generating={generating} />
            {generatedHtml && (
              <div className="space-y-3">
                <Button variant="secondary" onClick={handleRegenerate} className="w-full cursor-pointer" type="button">
                  🔄 Regenerate with Different Design
                </Button>
                <Button variant="secondary" onClick={handleCheckATS} className="w-full cursor-pointer" type="button" disabled={checkingATS}>
                  {checkingATS ? 'Checking ATS...' : 'Check ATS Score'}
                </Button>
                <ExportButtons html={generatedHtml} formData={formData} style={style} />
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {step === 'upload' ? uploadSection : formSection}
    </div>
  );
}
