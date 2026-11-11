# Kurio — marketplace de NFTs

Aplicação frontend em React e TypeScript. Backend, autenticação, carteiras e pagamentos são simulados com MSW.

**Tecnologias:** TanStack Router e Query, Axios, Socket.IO, Tailwind CSS, Playwright e Lighthouse CI.

## Executar

```bash
npm install --legacy-peer-deps
npm run dev                 # desenvolvimento em http://localhost:3000
npm run build               # build de produção com os dados simulados
npm run preview             # serve o build na porta 3000
npm run typecheck           # verifica os tipos
npm run test:e2e            # testes Playwright em desktop e celular
npm run audit:lighthouse    # requer build e preview em execução
```

Os testes usam o Google Chrome instalado; se necessário, execute `npx playwright install chrome`. Não são necessárias variáveis de ambiente.

## Credenciais fictícias

E-mails: `contato@email.com` ou `alex.collector@crypto.art`. Use qualquer senha com pelo menos seis caracteres. Cupom: `KURIO10`.

O console de simulação, no ícone de engrenagem da barra de navegação, permite testar latência, erros, modo offline, eventos, reconexão e troca de usuário. Os dados ficam no `localStorage` e podem ser restaurados pelo próprio console.

## Documentação e deploy

Consulte [ARCHITECTURE.md](ARCHITECTURE.md). No Vercel, `vercel.json` direciona as rotas para `index.html`, permitindo acesso direto e atualização da página.
