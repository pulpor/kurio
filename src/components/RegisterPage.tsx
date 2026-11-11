import React from 'react';
import { AuthPanel } from './AuthPanel';

interface RegisterPageProps {
  redirectPath?: string;
  onSuccess: (redirect?: string) => void;
  onGoToLogin: () => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function RegisterPage({ redirectPath, onSuccess, onGoToLogin, onToast }: RegisterPageProps) {
  return (
    <div className="md:mx-auto md:mt-[90px] md:w-[500px] md:pb-10">
      <AuthPanel
        tab="register"
        onTabChange={(t) => t === 'login' && onGoToLogin()}
        onSuccess={() => onSuccess(redirectPath)}
        onToast={onToast}
      />
    </div>
  );
}
