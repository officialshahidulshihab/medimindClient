'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Config ───────────────────────────────────────────────────────────────────

const TOAST_DURATION = 4000;
const EXIT_DURATION = 350;

const TYPE_CONFIG: Record<ToastType, { icon: React.ReactNode; colorVar: string; bgOpacity: string }> = {
  success: {
    icon: <CheckCircle size={18} />,
    colorVar: 'var(--success)',
    bgOpacity: 'rgba(0, 214, 143, 0.12)',
  },
  error: {
    icon: <XCircle size={18} />,
    colorVar: 'var(--danger)',
    bgOpacity: 'rgba(255, 77, 106, 0.12)',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    colorVar: 'var(--warning)',
    bgOpacity: 'rgba(255, 181, 69, 0.12)',
  },
  info: {
    icon: <Info size={18} />,
    colorVar: 'var(--info)',
    bgOpacity: 'rgba(77, 148, 255, 0.12)',
  },
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    // Mark as exiting (triggers fade-out CSS)
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    // Remove after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      delete timers.current[id];
    }, EXIT_DURATION);
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => [...prev, { id, message, type }]);

    timers.current[id] = setTimeout(() => dismiss(id), TOAST_DURATION);
  }, [dismiss]);

  const toast: ToastContextValue = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info:    (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Viewport */}
      <div
        role="region"
        aria-label="Notifications"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '340px',
          maxWidth: 'calc(100vw - 48px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => {
          const cfg = TYPE_CONFIG[t.type];
          return (
            <div
              key={t.id}
              role="alert"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: '#1A2942',
                border: `1px solid ${cfg.colorVar}4D`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                color: 'white',
                fontSize: '14px',
                lineHeight: '1.4',
                pointerEvents: 'all',
                animation: t.exiting
                  ? `toastExit ${EXIT_DURATION}ms ease forwards`
                  : 'toastEnter 300ms cubic-bezier(0.34,1.56,0.64,1) forwards',
              }}
            >
              {/* Left accent bar */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: '12px',
                bottom: '12px',
                width: '3px',
                borderRadius: '0 2px 2px 0',
                background: cfg.colorVar,
              }} />

              {/* Icon */}
              <span style={{ color: cfg.colorVar, flexShrink: 0, marginTop: '1px' }}>
                {cfg.icon}
              </span>

              {/* Message */}
              <span style={{ flex: 1 }}>{t.message}</span>

              {/* Dismiss */}
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                style={{
                  flexShrink: 0,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                  padding: '2px',
                  lineHeight: 0,
                  marginTop: '1px',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Keyframes injected inline so no extra CSS file needed */}
      <style>{`
        @keyframes toastEnter {
          from { opacity: 0; transform: translateX(110%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastExit {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(110%); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
