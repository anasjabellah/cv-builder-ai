'use client';

import { useState, useEffect } from 'react';
import { auth, googleProvider } from '@/features/auth/services/firebase-auth';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import Button from '@/shared/ui/Button';
import UserMenu from '@/shared/ui/UserMenu';

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

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user') {
        console.error(e?.message || 'Authentication failed');
      }
    }
  };

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
          {showBackToHome && (
            <Button variant="ghost" className="text-sm" type="button" onClick={() => window.location.href = '/' }>
              ← Back to CV Builder
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

          {showJobMatcher && (
            <Button variant="ghost" className="text-sm" onClick={() => window.location.href = '/job-matcher'}>
              Job Matcher
            </Button>
          )}

          {user ? (
            <UserMenu user={user} onLogout={() => {}} />
          ) : showLogin && (
            <Button variant="secondary" onClick={handleLogin} className="cursor-pointer text-sm" type="button">
              Login with Google
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
