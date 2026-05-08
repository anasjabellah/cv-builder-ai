'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { CVFormData } from '@/types';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { auth, firestore } from '@/lib/firebase';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  }, [cvData, jobDescription]);

  return (
    <div className="min-h-screen bg-transparent text-[#E2E8F0]">

      {/* Shared Navbar */}
      <Navbar showBackToHome showLogin showJobMatcher={false} />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Job Matcher</h1>

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
                  : `CV loaded from your account – ${
                      cvData?.personalInfo?.fullName || 'ready for analysis'
                    }`}
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

        <Button onClick={handleMatchJob} disabled={loading || !cvData} className="w-full mb-8">
          {loading ? <LoadingSpinner /> : 'Match Job'}
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-6 fade-in max-w-2xl mx-auto">

            {/* Match Percentage Card */}
            <div className="bg-gradient-to-r from-[#C800DF18] to-[#E6007618] rounded-[16px] p-6 text-center">
              <h2 className="text-white font-bold text-lg uppercase mb-4">Match Percentage</h2>
              <p className="text-7xl font-black text-white">{result.matchPercentage ?? 'N/A'}%</p>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, result.matchPercentage ?? 0))}%` }}
                />
              </div>
            </div>

            {/* 4-card grid: Strengths, Gaps, Keywords, Interview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Strengths */}
              {result.strengths?.length > 0 && (
                <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 h-full">
                  <h2 className="text-white font-bold uppercase mb-3">✅ Why you are a good fit</h2>
                  <ul className="list-disc list-inside space-y-1 text-sm text-[#A1A1AA]">
                    {result.strengths.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps */}
              {result.gaps?.length > 0 && (
                <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 h-full">
                  <h2 className="text-white font-bold uppercase mb-3">⚠️ Missing in your CV</h2>
                  <ul className="list-disc list-inside space-y-1 text-sm text-[#A1A1AA]">
                    {result.gaps.map((g: string, i: number) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keywords to Add */}
              {result.keywordsToAdd?.length > 0 && (
                <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 h-full">
                  <h2 className="text-white font-bold uppercase mb-3">🔑 Keywords to Add</h2>
                  <ul className="list-disc list-inside space-y-1 text-sm text-[#A1A1AA]">
                    {result.keywordsToAdd.map((k: string, i: number) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interview Questions */}
              {result.interviewQuestions?.length > 0 && (
                <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6 h-full">
                  <h2 className="text-white font-bold uppercase mb-3">❓ Likely Interview Questions</h2>
                  <ul className="list-disc list-inside space-y-1 text-sm text-[#A1A1AA]">
                    {result.interviewQuestions.map((q: string, i: number) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Tips Card - full width below grid */}
            {result.tips?.length > 0 && (
              <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-6">
                <h2 className="text-white font-bold uppercase mb-3">💡 Tips to improve CV</h2>
                <ul className="list-disc list-inside space-y-1 text-sm text-[#A1A1AA]">
                  {result.tips.map((t: string, i: number) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
