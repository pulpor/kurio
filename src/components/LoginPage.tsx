import React from 'react';
import { AuthPanel } from './AuthPanel';

interface LoginPageProps {
  redirectPath?: string;
  onSuccess: (redirect?: string) => void;
  onGoToRegister: () => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; title: string; description?: string }) => void;
}

export function LoginPage({ redirectPath, onSuccess, onGoToRegister, onToast }: LoginPageProps) {
  return (
    <div className="md:mx-auto md:mt-[92px] md:w-[500px] md:pb-10">
      <AuthPanel
        tab="login"
        onTabChange={(t) => t === 'register' && onGoToRegister()}
        onSuccess={() => onSuccess(redirectPath)}
        onToast={onToast}
      />
    </div>
  );
}
