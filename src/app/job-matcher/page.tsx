'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { CVFormData } from '@/types';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { auth, firestore } from '@/features/auth/services/firebase-auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Navbar from '@/components/layout/Navbar';
export default function JobMatcher() {
  const [user, setUser] = useState<any>(null);
  const [cvData, setCvData] = useState<CVFormData | null>(null);
  const [cvFileName, setCvFileName] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const matchPercentage = result?.matchPercentage ?? 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (matchPercentage / 100) * circumference;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load saved CV when user is logged in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(firestore, 'cvs', firebaseUser.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as { formData: CVFormData };
          setCvData(data.formData);
          setCvFileName('your account');
        }
      }
    });
    return () => unsub();
  }, []);

  // Handle file upload via /api/parse-cv
  const handleFileUpload = useCallback(async (file: File) => {
    setUploadLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse CV');
      setCvData(data.formData);
      setCvFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CV');
    } finally {
      setUploadLoading(false);
    }
  }, []);

  // Drag-and-drop handler
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleMatchJob = useCallback(async () => {
    if (!user) {
      showToast('Please sign in to use this feature');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      if (!cvData) {
        setError('No CV data available. Please upload a CV first.');
        setLoading(false);
        return;
      }
      if (!jobDescription.trim()) {
        setError('Please paste a job description.');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/match-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvData, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Job match failed');
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Job match failed');
    } finally {
      setLoading(false);
    }
  }, [cvData, jobDescription, user]);

  return (
    <div className="min-h-screen bg-transparent text-white relative">

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#C800DF] opacity-15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#E60076] opacity-10 rounded-full blur-3xl" />
      </div>

      {/* Shared Navbar */}
      <Navbar showBackToHome showLogin showJobMatcher={false} />

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-white px-4 py-2 rounded-md shadow-lg text-sm border border-white/10">
          {toast}
        </div>
      )}

      
      
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-12">
        <p className="text-[#A1A1AA] mb-8 mt-4 text-[3rem]">Job Matcher</p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Hidden file input used by all upload buttons */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
            // Reset so same file can be selected again
            e.target.value = '';
          }}
        />

        {/* CV Status / Upload */}
        <div className="mb-6 p-6 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px]">
          {cvData ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#A1A1AA]">
                {cvFileName
                  ? `CV loaded: ${cvFileName}`
                  : `CV loaded from your account – ${cvData?.personalInfo?.fullName || 'ready for analysis'}`}
              </p>
              <Button
                variant="secondary"
                className="text-sm"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                {user ? 'Or upload a different CV' : 'Upload a different CV'}
              </Button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 text-center hover:border-[rgba(255,255,255,0.2)] transition-colors bg-[rgba(255,255,255,0.04)]"
            >
              <p className="text-sm text-[#A1A1AA] mb-3">
                Drag & drop your CV here (PDF, DOC, DOCX)
              </p>
              <Button
                variant="secondary"
                className="text-sm"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse files
              </Button>
              {uploadLoading && (
                <div className="mt-3"><LoadingSpinner /></div>
              )}
              <p className="text-xs text-[#52525B] mt-3">
                Need a CV?{' '}
                <Link href="/" className="text-[#C800DF] hover:underline">
                  Create one in CV Builder
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Job Description Input */}
        <div className="mb-6">
          <Textarea
            label="Job Description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={10}
          />
        </div>

        <Button onClick={handleMatchJob} disabled={loading || !cvData || !user} className="w-full mb-8">
          {loading ? <LoadingSpinner /> : 'Match Job'}
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-5 fade-in max-w-5xl mx-auto">
            <div className="grid grid-cols-3 gap-5">

              {/* Match % - col-span-1 */}
              <div className="result-card bg-[rgba(255,255,255,0.06)] rounded-[20px] p-6 col-span-1 flex flex-col items-center justify-center">
                <p className="text-xs text-[#A1A1AA] uppercase mb-1">Match</p>
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12"/>
                  <circle cx="90" cy="90" r={radius} fill="none"
                    stroke="url(#grad)" strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 90 90)"/>
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#C800DF"/>
                      <stop offset="100%" stopColor="#E60076"/>
                    </linearGradient>
                  </defs>
                  <text x="90" y="90" textAnchor="middle" dy="0.35em"
                    fill="white" fontSize="28" fontWeight="900">
                    {matchPercentage}%
                  </text>
                </svg>
              </div>

              {/* Why fit - col-span-2 */}
              {result.strengths?.length > 0 && (
                <div className="result-card bg-[rgba(255,255,255,0.06)] rounded-[20px] p-6 col-span-2">
                  <p className="text-xs text-[#A1A1AA] uppercase mb-1">Why you are a good fit</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {result.strengths.map((s: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 text-sm px-3 py-1.5 rounded-full">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords - col-span-1 */}
              {result.keywordsToAdd?.length > 0 && (
                <div className="result-card bg-[rgba(255,255,255,0.06)] rounded-[20px] p-6 col-span-1">
                  <p className="text-xs text-[#A1A1AA] uppercase mb-1">Keywords</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {result.keywordsToAdd.map((k: string, i: number) => (
                      <span key={i} className="bg-purple-500/10 text-purple-300 text-xs px-3 py-1 rounded-full">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing - col-span-1 */}
              {result.gaps?.length > 0 && (
                <div className="result-card bg-[rgba(255,255,255,0.06)] rounded-[20px] p-6 col-span-1">
                  <p className="text-xs text-[#A1A1AA] uppercase mb-1">Missing</p>
                  <div className="space-y-2 mt-4">
                    {result.gaps.map((g: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-400 text-sm px-3 py-1.5 rounded-lg block">
                        ⚠ {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions - col-span-1 */}
              {result.interviewQuestions?.length > 0 && (
                <div className="result-card bg-[rgba(255,255,255,0.06)] rounded-[20px] p-6 col-span-1">
                  <p className="text-xs text-[#A1A1AA] uppercase mb-1">Questions</p>
                  <div className="space-y-2 mt-4">
                    {result.interviewQuestions.map((q: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="bg-blue-500/20 text-blue-400 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                        <p className="text-sm text-[#E2E8F0]">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Tips - full width */}
            {result.tips?.length > 0 && (
              <div className="result-card bg-[rgba(255,255,255,0.06)] rounded-[20px] p-6 col-span-3">
                <p className="text-xs text-[#A1A1AA] uppercase mb-1">Tips to improve</p>
                <div className="space-y-3 mt-4">
                  {result.tips.map((t: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="bg-gradient-to-r from-[#C800DF] to-[#E60076] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0">{i+1}</span>
                      <p className="text-sm text-[#E2E8F0]">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
