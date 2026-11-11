import React, { useState } from 'react';
import { AuthPanel, AuthTab } from './AuthPanel';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: AuthTab;
  onClose: () => void;
  onSuccess: () => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function AuthModal({ isOpen, initialTab = 'login', onClose, onSuccess, onToast }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>(initialTab);
  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 overflow-y-auto" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mx-auto md:mt-[160px] md:w-[500px]">
        <AuthPanel
          tab={tab}
          onTabChange={setTab}
          onClose={onClose}
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
          onToast={onToast}
        />
      </div>
    </div>
  );
}
