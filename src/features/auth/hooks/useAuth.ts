'use client';

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '@/features/auth/services/firebase-auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user') {
        console.error(error?.message);
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return { user, loading, signIn, signOut };
}
