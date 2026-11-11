import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';

interface FooterProps {
  onNavigate: (path: string) => void;
}

const FEATURES = [
  { letter: 'W', title: 'Segurança da carteira', text: 'Proteja sua carteira e colecione arte digital verificada com confiança.' },
  { letter: 'C', title: 'Criadores em destaque', text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.' },
  { letter: 'D', title: 'Alertas de lançamentos', text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.' },
];

const SOCIALS = [Facebook, Instagram, Twitter, Linkedin, Youtube];

export function Footer({ onNavigate }: FooterProps) {
  const col = 'px-8';
  const link = 'block text-left text-[14px] leading-[30px] text-cream hover:text-brand-hi';

  return (
    <footer id="criadores" className="mx-auto mt-24 hidden w-full max-w-[1200px] text-cream md:block">
      {/* Value propositions + newsletter */}
      <div className="grid h-[250px] grid-cols-[297fr_265fr_266fr_372fr] bg-card">
        {FEATURES.map((f, i) => (
          <div
            key={f.letter}
            className={`mt-8 h-[202px] ${i === 0 ? 'pl-12' : 'pl-[17px]'} pr-4 ${i < 2 ? 'border-r border-brand/60' : 'border-r border-brand/60'}`}
          >
            <div className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-brand text-[24px] font-bold text-ink">
              {f.letter}
            </div>
            <h3 className="mt-[10px] text-[17px] font-bold leading-[22px]">{f.title}</h3>
            <p className="mt-[8px] text-[14px] leading-[22px] text-sand">{f.text}</p>
          </div>
        ))}
        <div className="mt-8 pl-[17px] pr-[10px]">
          <h3 id="newsletter-title" className="text-[17px] font-bold leading-4">
            Antecipe-se ao próximo lançamento
          </h3>
          <NewsletterForm />
          <p className="mt-[14px] text-[13px] leading-[22px] text-sand">
            Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
          </p>
        </div>
      </div>

      {/* Contact band */}
      <div className="grid h-[88px] grid-cols-4 items-center bg-band px-8 text-[14px] leading-[22px]">
        <span className="font-bold tracking-[0.13em]">KURIO</span>
        <span>
          Feito para colecionadores,
          <br />
          criadores e cultura
        </span>
        <span>contato@email.com</span>
        <span>+55 11 4002 8922</span>
      </div>

      {/* Link columns */}
      <div className="grid h-[236px] grid-cols-4 bg-card pt-[28px]">
        <div className={col}>
          <h4 className="text-[18px] font-bold leading-[24px]">Meu perfil</h4>
          <ul className="mt-[4px]">
            <li><button onClick={() => onNavigate('/profile')} className={link}>Meu perfil</button></li>
            <li><button onClick={() => onNavigate('/profile')} className={link}>Minha coleção</button></li>
            <li><button onClick={() => onNavigate('/profile')} className={link}>Atividade</button></li>
            <li><button className={link}>Estúdio do criador</button></li>
            <li><button className={link}>Lista de interesse</button></li>
          </ul>
        </div>
        <div className={col}>
          <h4 className="text-[18px] font-bold leading-[24px]">Central de ajuda</h4>
          <ul className="mt-[4px]">
            <li><button className={link}>Central de ajuda</button></li>
            <li><button className={link}>Como comprar NFTs</button></li>
            <li><button className={link}>Carteira e segurança</button></li>
            <li><button className={link}>Política do mercado</button></li>
            <li><button className={link}>Denunciar item</button></li>
          </ul>
        </div>
        <div className={col}>
          <h4 className="text-[18px] font-bold leading-[24px]">Coleções</h4>
          <ul className="mt-[4px]">
            <li><button onClick={() => onNavigate('/?category=arte-digital')} className={link}>Arte digital</button></li>
            <li><button onClick={() => onNavigate('/?category=fotografia')} className={link}>Fotografia</button></li>
            <li><button onClick={() => onNavigate('/?category=musica')} className={link}>Música</button></li>
            <li><button onClick={() => onNavigate('/?category=arte-3d')} className={link}>Arte 3D</button></li>
            <li><button onClick={() => onNavigate('/?category=utilidade')} className={link}>Utilidade</button></li>
          </ul>
        </div>
        <div className="pl-8 pr-[30px]">
          <h4 className="text-[18px] font-bold leading-[24px]">Redes sociais</h4>
          <div className="mt-[15px] flex gap-2">
            {SOCIALS.map((Icon, i) => (
              <span
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded border border-brand text-brand"
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
            ))}
          </div>
          <h4 className="mt-[26px] text-[18px] font-bold leading-[24px]">Carteiras compatíveis</h4>
          <div className="mt-[8px] flex h-[26px] w-full items-center justify-center whitespace-nowrap rounded-md border border-line bg-band text-[10px] font-bold text-brand-hi">
            METAMASK &nbsp;•&nbsp; WALLETCONNECT &nbsp;•&nbsp; COINBASE
          </div>
        </div>
      </div>

      <div className="h-[60px] pt-[10px] text-center text-[14px] leading-[22px]">
        © 2026 Kurio. Propriedade digital para todos.
      </div>
    </footer>
  );
}

