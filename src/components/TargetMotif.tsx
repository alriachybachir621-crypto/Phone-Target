import React, { Component, ErrorInfo, ReactNode } from 'react';

/** Subtle Phone Target target-ring + arrow motif */
export const TargetArrowMotif: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
    <circle cx="13" cy="15" r="9.5" stroke="#E0322B" strokeWidth="1.75" strokeDasharray="46 14" />
    <circle cx="13" cy="15" r="4.5" stroke="#E0322B" strokeWidth="1.6" />
    <circle cx="13" cy="15" r="1.75" fill="#E0322B" />
    <path d="M14.5 13.5L24.5 3.5" stroke="#111111" strokeWidth="1.75" strokeLinecap="round" />
    <path d="M20 3.5H24.5V8" stroke="#111111" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Official WhatsApp vector icon */
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16.002 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.354.614 4.651 1.78 6.678L2.667 29.333l6.814-1.787A13.28 13.28 0 0 0 16.002 29.333c7.361 0 13.331-5.973 13.331-13.333S23.363 2.667 16.002 2.667Zm0 24.442c-2.196 0-4.345-.589-6.219-1.703l-.446-.265-4.043 1.06 1.08-3.941-.29-.462a11.085 11.085 0 0 1-1.7-5.798c0-6.135 4.991-11.125 11.125-11.125 6.135 0 11.126 4.99 11.126 11.125 0 6.134-4.991 11.124-11.126 11.124l-.507-.015Zm6.103-8.334c-.334-.168-1.979-.976-2.286-1.088-.307-.112-.53-.168-.753.168-.223.335-.864 1.088-1.059 1.311-.195.224-.391.252-.725.084-.335-.168-1.412-.521-2.69-1.66-.994-.887-1.665-1.982-1.86-2.317-.195-.335-.021-.516.147-.683.151-.15.335-.391.502-.586.167-.195.223-.335.335-.558.111-.223.056-.419-.028-.586-.084-.168-.753-1.815-1.032-2.484-.271-.651-.547-.563-.753-.573a13.7 13.7 0 0 0-.641-.011c-.223 0-.586.084-.892.419-.307.335-1.171 1.144-1.171 2.79s1.199 3.237 1.366 3.46c.167.223 2.359 3.602 5.714 5.051.798.345 1.421.551 1.907.705.801.255 1.53.219 2.106.133.643-.096 1.979-.809 2.258-1.59.279-.781.279-1.451.195-1.59-.084-.14-.307-.224-.641-.391Z" />
  </svg>
);

export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application boundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#EEF0F3] rounded-2xl p-8 text-center">
            <img src="/logo.png" alt="Phone Target" className="w-14 h-14 mx-auto mb-4 rounded-full" />
            <h2 className="font-display text-xl font-semibold text-[#111111] mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-[#111111]/70 mb-6">
              Please reload the page to restore the storefront.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#111111] text-white text-sm font-medium rounded-lg hover:bg-[#E0322B] transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
