import React from 'react';
import { Activity, ChevronDown, Download, Heart, HelpCircle, LogOut, Tag, User, Wallet } from 'lucide-react';

export type AccountMenu = 'dados' | 'carteiras' | 'atividade' | 'favoritos' | 'ofertas' | 'baixados' | 'suporte';

const ITEMS: { id: AccountMenu; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { id: 'dados', label: 'Dados do perfil', icon: User },
  { id: 'carteiras', label: 'Carteiras', icon: Wallet },
  { id: 'atividade', label: 'Atividade', icon: Activity },
  { id: 'favoritos', label: 'Lista de interesse', icon: Heart },
  { id: 'ofertas', label: 'Ofertas', icon: Tag },
  { id: 'baixados', label: 'Arquivos baixados', icon: Download },
  { id: 'suporte', label: 'Suporte', icon: HelpCircle },
];

export function AccountSidebar({
  active,
  onSelect,
  onLogout,
}: {
  active: AccountMenu;
  onSelect: (id: AccountMenu) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="w-full bg-card md:h-[407px] md:w-[310px] md:shrink-0">
      <h2 className="pl-[10px] pt-[13px] text-[18px] font-bold leading-7 md:pl-[10px]">Meu perfil</h2>
      <ul className="mt-[3px]">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <button
                onClick={() => onSelect(item.id)}
                className="relative flex h-[45px] w-full items-center gap-3 pl-[22px] text-left text-[15px] text-brand-hi"
              >
                {isActive && <span className="absolute left-0 top-0 h-full w-[6px] bg-brand" />}
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-brand/40">
        <button onClick={onLogout} className="flex h-12 w-full items-center gap-3 pl-[22px] text-[15px] font-bold text-brand-hi">
          <LogOut className="h-5 w-5" strokeWidth={1.5} />
          Sair
        </button>
      </div>
    </aside>
  );
}

export const accInput =
  'h-10 w-full border border-[#3f2319] bg-ink px-3 text-[14px] text-cream outline-none focus:border-brand';

export function AField({
  label,
  required,
  children,
  gap = 17,
}: {
  label?: string;
  required?: boolean;
  children: React.ReactNode;
  gap?: number;
}) {
  return (
    <div>
      <div className="h-4 text-[15px] leading-4">
        {label}
        {required && <span className="ml-[1px] text-[22px] leading-none text-star">*</span>}
      </div>
      <div style={{ marginTop: gap }}>{children}</div>
    </div>
  );
}

export function ASelect({ children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...rest} className={`${accInput} cursor-pointer appearance-none pr-9`}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-[11px] h-[18px] w-[18px] text-brand" />
    </div>
  );
}

export function EnsField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex">
      <div className="relative w-[78px] shrink-0">
        <div className={`${accInput} flex items-center`}>.eth</div>
        <ChevronDown className="pointer-events-none absolute right-2 top-[11px] h-[18px] w-[18px] text-brand" />
      </div>
      <input value={value} onChange={(e) => onChange(e.target.value)} aria-label="Nome ENS" className={`${accInput} border-l-0`} />
    </div>
  );
}
