import React, { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { Delete, Lock, X } from 'lucide-react';
import { auth } from '../firebase';

export const ADMIN_EMAIL = 'admin@phonetarget.app';
export const PASSCODE_SUFFIX = '-PT8!d1';

const LOCK_STORAGE_KEY = 'pt_pin_lock_state_v1';
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 5 * 60 * 1000;

interface LockState {
  attempts: number;
  lockedUntil: number;
}

function readLockState(): LockState {
  try {
    const raw = localStorage.getItem(LOCK_STORAGE_KEY);
    if (!raw) return { attempts: 0, lockedUntil: 0 };
    const parsed = JSON.parse(raw) as LockState;
    return {
      attempts: Number(parsed.attempts) || 0,
      lockedUntil: Number(parsed.lockedUntil) || 0,
    };
  } catch {
    return { attempts: 0, lockedUntil: 0 };
  }
}

function writeLockState(state: LockState) {
  try {
    localStorage.setItem(LOCK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage quota errors
  }
}

interface AdminPinModalProps {
  isOpen: boolean;
  hasFirestoreShopDoc: boolean;
  onClose: () => void;
  onAuthenticated: (isFirstTimeSetup: boolean) => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  hasFirestoreShopDoc,
  onClose,
  onAuthenticated,
}) => {
  const [mode, setMode] = useState<'checking' | 'login' | 'setup-1' | 'setup-2'>('checking');
  const [pin, setPin] = useState('');
  const [firstSetupPin, setFirstSetupPin] = useState('');
  const [errorText, setErrorText] = useState('');
  const [busy, setBusy] = useState(false);
  const [lockState, setLockState] = useState<LockState>(() => readLockState());
  const [now, setNow] = useState(() => Date.now());

  // Determine whether first-time setup should be offered
  useEffect(() => {
    if (!isOpen) return;
    setPin('');
    setFirstSetupPin('');
    setErrorText('');
    setLockState(readLockState());

    const knownExists = (() => {
      try {
        return localStorage.getItem('pt_admin_exists') === '1';
      } catch {
        return false;
      }
    })();

    if (hasFirestoreShopDoc || knownExists) {
      setMode('login');
      return;
    }

    let cancelled = false;
    setMode('checking');
    fetchSignInMethodsForEmail(auth, ADMIN_EMAIL)
      .then((methods) => {
        if (cancelled) return;
        if (methods && methods.length > 0) {
          try {
            localStorage.setItem('pt_admin_exists', '1');
          } catch {
            // ignore
          }
          setMode('login');
        } else {
          setMode('setup-1');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMode('login');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, hasFirestoreShopDoc]);

  // Countdown tick during 5-minute lockout
  useEffect(() => {
    if (!isOpen || lockState.lockedUntil <= Date.now()) return;
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= lockState.lockedUntil) {
        const cleared = { attempts: 0, lockedUntil: 0 };
        writeLockState(cleared);
        setLockState(cleared);
        setErrorText('');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, lockState.lockedUntil]);

  const isLocked = lockState.lockedUntil > now;
  const remainingSec = Math.max(0, Math.ceil((lockState.lockedUntil - now) / 1000));
  const mins = Math.floor(remainingSec / 60);
  const secs = String(remainingSec % 60).padStart(2, '0');

  const submitPin = async (enteredPin: string) => {
    if (busy || isLocked || enteredPin.length !== 4) return;

    if (mode === 'setup-1') {
      setFirstSetupPin(enteredPin);
      setPin('');
      setErrorText('');
      setMode('setup-2');
      return;
    }

    if (mode === 'setup-2') {
      if (enteredPin !== firstSetupPin) {
        setErrorText('Codes did not match. Try again.');
        setPin('');
        setFirstSetupPin('');
        setMode('setup-1');
        return;
      }

      setBusy(true);
      setErrorText('');
      try {
        await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, enteredPin + PASSCODE_SUFFIX);
        try {
          localStorage.setItem('pt_admin_exists', '1');
        } catch {
          // ignore
        }
        writeLockState({ attempts: 0, lockedUntil: 0 });
        onAuthenticated(true);
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code || '';
        if (code === 'auth/email-already-in-use') {
          try {
            localStorage.setItem('pt_admin_exists', '1');
          } catch {
            // ignore
          }
          // Account already exists -> switch to login permanently
          setMode('login');
          setPin('');
          setFirstSetupPin('');
          setErrorText('Enter your existing 4-digit code');
        } else if (code === 'auth/operation-not-allowed') {
          setErrorText('Enable Email/Password sign-in in Firebase Authentication console.');
          setPin('');
        } else {
          setErrorText('Setup failed. Please try again.');
          setPin('');
        }
      } finally {
        setBusy(false);
      }
      return;
    }

    // Login mode
    setBusy(true);
    setErrorText('');
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, enteredPin + PASSCODE_SUFFIX);
      const reset = { attempts: 0, lockedUntil: 0 };
      writeLockState(reset);
      setLockState(reset);
      onAuthenticated(false);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setErrorText('Enable Email/Password sign-in in Firebase Authentication console.');
        setPin('');
      } else {
        const nextAttempts = lockState.attempts + 1;
        const lockedUntil = nextAttempts >= MAX_ATTEMPTS ? Date.now() + LOCK_DURATION_MS : 0;
        const nextState = { attempts: nextAttempts, lockedUntil };
        writeLockState(nextState);
        setLockState(nextState);
        setNow(Date.now());
        setPin('');
        setErrorText(
          lockedUntil > 0 ? 'Too many attempts. Locked for 5 minutes.' : 'Wrong code'
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDigit = (digit: string) => {
    if (busy || isLocked || mode === 'checking') return;
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setErrorText('');
    if (next.length === 4) {
      submitPin(next);
    }
  };

  const handleBackspace = () => {
    if (busy || isLocked) return;
    setPin((prev) => prev.slice(0, -1));
  };

  // Support physical keyboard digits
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!isOpen) return null;

  const heading =
    mode === 'setup-1'
      ? 'Set your 4-digit code'
      : mode === 'setup-2'
      ? 'Confirm your 4-digit code'
      : 'Enter 4-digit code';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      dir="ltr"
      role="dialog"
      aria-modal="true"
      aria-label="Passcode entry"
    >
      <div
        className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-black/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-9 h-9 rounded-full bg-[#EEF0F3] flex items-center justify-center">
            <Lock className="w-4 h-4 text-[#111111]" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#EEF0F3] hover:bg-[#E2E5EA] flex items-center justify-center text-[#111111] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h2 className="font-display text-lg font-bold text-[#111111] text-center mb-1">
          {heading}
        </h2>
        <p className="text-xs text-[#111111]/55 text-center mb-5 min-h-[16px]">
          {isLocked
            ? `Locked (${mins}:${secs})`
            : mode === 'checking'
            ? 'Checking...'
            : mode === 'setup-1'
            ? 'One-time setup'
            : mode === 'setup-2'
            ? 'Enter the same code again'
            : ''}
        </p>

        {/* 4 PIN Dots */}
        <div className="flex items-center justify-center gap-3.5 mb-5">
          {[0, 1, 2, 3].map((i) => {
            const filled = i < pin.length;
            return (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  filled ? 'bg-[#E0322B] scale-110' : 'bg-[#EEF0F3] border border-black/15'
                }`}
              />
            );
          })}
        </div>

        {/* Error feedback */}
        <p className="text-xs font-medium text-[#E0322B] text-center min-h-[18px] mb-4">
          {errorText}
        </p>

        {/* 0-9 Keypad */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={busy || isLocked || mode === 'checking'}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-[#EEF0F3] hover:bg-[#E2E5EA] active:scale-95 disabled:opacity-45 font-display text-xl font-semibold text-[#111111] transition-all tabular-nums"
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            disabled={busy || isLocked}
            onClick={() => setPin('')}
            className="h-14 rounded-2xl bg-white hover:bg-[#EEF0F3] text-xs font-semibold text-[#111111]/60 transition-colors"
          >
            Clear
          </button>

          <button
            type="button"
            disabled={busy || isLocked || mode === 'checking'}
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-[#EEF0F3] hover:bg-[#E2E5EA] active:scale-95 disabled:opacity-45 font-display text-xl font-semibold text-[#111111] transition-all tabular-nums"
          >
            0
          </button>

          <button
            type="button"
            disabled={busy || isLocked}
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-white hover:bg-[#EEF0F3] flex items-center justify-center text-[#111111] transition-colors"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
