/*
AuthGuard and useAuth hook for Firebase authentication.
Provides:
  - useAuth(): { user: User | null, loading: boolean, isAuthenticated: boolean }
  - AuthGuard component: renders children when authenticated, otherwise fallback.
*/

'use client';

import { useState, useEffect, ReactNode } from 'react';
import { auth, getCurrentUser } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

/** Hook to subscribe to Firebase auth state */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current user synchronously first
    const current = getCurrentUser();
    setUser(current);
    setLoading(false);
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const isAuthenticated = !!user;
  return { user, loading, isAuthenticated };
}

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AuthGuard({ children, fallback = null }: AuthGuardProps) {
  const { loading, isAuthenticated } = useAuth();
  if (loading) return null; // could render spinner
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
}
