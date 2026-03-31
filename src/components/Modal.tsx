import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'info';
}

const variantStyles = {
  success: { border: 'border-hunt-mint', glow: 'glow-mint', icon: '🎉', titleColor: 'text-hunt-mint' },
  error: { border: 'border-hunt-coral', glow: 'glow-coral', icon: '😬', titleColor: 'text-hunt-coral' },
  info: { border: 'border-hunt-sky', glow: 'glow-sky', icon: 'ℹ️', titleColor: 'text-hunt-sky' },
};

export default function Modal({ isOpen, onClose, title, children, variant = 'info' }: ModalProps) {
  const style = variantStyles[variant];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(13, 15, 26, 0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm bg-hunt-card rounded-2xl border ${style.border} ${style.glow} p-6 animate-bounce-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-1 text-4xl">{style.icon}</div>
        {title && (
          <h2 className={`font-display text-xl font-semibold text-center mb-3 ${style.titleColor}`}>
            {title}
          </h2>
        )}
        <div className="text-center text-hunt-muted font-body text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
