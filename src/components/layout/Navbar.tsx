'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { auth, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { useEffect } from 'react';

interface NavbarProps {
  showLogin?: boolean;
  showJobMatcher?: boolean;
  showBackToHome?: boolean;
  showUploadNew?: boolean;
  step?: 'upload' | 'form';
  onStepChange?: (step: 'upload') => void;
  onGeneratedHtmlChange?: (html: string | null) => void;
}

export default function Navbar({
  showLogin = true,
  showJobMatcher = true,
  showBackToHome = false,
  showUploadNew = false,
  step,
  onStepChange,
  onGeneratedHtmlChange,
}: NavbarProps) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-full px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C800DF] flex items-center justify-center">
            <span className="text-white font-bold text-sm">CV</span>
          </div>
          <span className="text-lg font-semibold text-white">
            CV Builder <span className="text-[#C800DF]">AI</span>
          </span>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-3">
          {showLogin && (
            <Button
              variant="secondary"
              onClick={async () => {
                try { await signInWithPopup(auth, googleProvider); } catch (e: any) {
                  if (e?.code !== 'auth/popup-closed-by-user') {
                    console.error(e?.message || 'Authentication failed');
                  }
                }
              }}
              className="cursor-pointer text-sm"
              type="button"
            >
              Login with Google
            </Button>
          )}

          {showUploadNew && step === 'form' && (
            <Button
              variant="ghost"
              onClick={() => {
                onStepChange?.('upload');
                onGeneratedHtmlChange?.(null);
              }}
              className="cursor-pointer text-sm"
              type="button"
            >
              ← Upload New CV
            </Button>
          )}

          {showBackToHome && (
            <Link href="/" className="cursor-pointer">
              <Button variant="ghost" className="text-sm" type="button">
                ← Back to CV Builder
              </Button>
            </Link>
          )}

          {showJobMatcher && (
            <Link href="/job-matcher" className="cursor-pointer">
              <Button variant="ghost" className="text-sm">
                Job Matcher
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
