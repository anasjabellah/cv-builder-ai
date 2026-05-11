'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

interface UserMenuProps {
  user: User;
  onLogout?: () => void;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const logoutBtnRef = useRef<HTMLButtonElement>(null);

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  const email = user.email || '';
  const photoURL = user.photoURL;

  // Close dropdown on Escape
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  }, []);

  // Focus trap inside dropdown
  useEffect(() => {
    if (!isOpen) return;
    const menu = menuRef.current;
    if (!menu) return;
    const focusable = menu.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    menu.addEventListener('keydown', trap);
    // Focus first item
    setTimeout(() => first.focus(), 0);
    return () => menu.removeEventListener('keydown', trap);
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      setShowConfirm(false);
      setIsOpen(false);
      onLogout?.();
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const cancelLogout = () => {
    setShowConfirm(false);
    logoutBtnRef.current?.focus();
  };

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      {/* Avatar button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C800DF] rounded-full p-1"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover border-2 border-[#C800DF]/50"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#C800DF] to-[#E60076] flex items-center justify-center text-white font-bold text-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-white text-sm hidden md:block max-w-[120px] truncate">
          {displayName}
        </span>
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-64 bg-[rgba(30,30,40,0.95)] backdrop-blur-xl border border-white/10 rounded-[16px] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.3)] z-50"
            role="menu"
            aria-label="User menu"
          >
            {/* User info */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C800DF] to-[#E60076] flex items-center justify-center text-white font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{displayName}</p>
                <p className="text-[#A1A1AA] text-xs truncate">{email}</p>
              </div>
            </div>

            {/* Logout button */}
            <button
              ref={logoutBtnRef}
              onClick={handleLogoutClick}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
              role="menuitem"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2L2 2 2 14 6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm logout"
          >
            <motion.div
              ref={confirmRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-[rgba(30,30,40,0.98)] border border-white/10 rounded-[20px] p-6 max-w-sm w-full mx-4 shadow-2xl"
            >
              <h3 className="text-white text-lg font-semibold mb-2">Confirm Logout</h3>
              <p className="text-[#A1A1AA] text-sm mb-6">Are you sure you want to log out?</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelLogout}
                  className="px-4 py-2 text-sm text-[#A1A1AA] hover:text-white transition-colors rounded-lg border border-white/10 hover:bg-white/5"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                  type="button"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
