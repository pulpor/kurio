import React, { useState } from 'react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    setEmail('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <form onSubmit={submit} className="mt-[10px] flex h-10 w-full" aria-labelledby="newsletter-title">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={sent ? 'inscrição confirmada!' : 'digite seu e-mail...'}
        aria-label="E-mail para alertas de lançamento"
        className="min-w-0 flex-1 bg-band px-3 text-[14px] text-cream outline-none"
      />
      <button type="submit" className="w-[85px] rounded-r-lg bg-brand text-[16px] font-bold text-ink">
        Enviar
      </button>
    </form>
  );
}
