# Kurio — Marketplace de NFTs (Desafio Frontend)

Aplicação desenvolvida para o **Desafio Frontend — Marketplace de NFTs (Kurio)** em React e TypeScript, fiel à especificação do layout no Figma (`Frontend-Challenge`) e integrando a stack obrigatória: **TanStack Router**, **TanStack Query**, **Axios**, **MSW (Mock Service Worker)** e **Socket.IO**.

---

## 🚀 1. Stack Tecnológica Obrigatória

| Responsabilidade | Tecnologia Utilizada |
| :--- | :--- |
| **Interface** | React (v19) |
| **Linguagem** | TypeScript (Modo Estrito) |
| **Roteamento & URL Search Params** | TanStack Router & Sincronização Bidirecional de Histórico |
| **Estado Remoto & Cache** | TanStack Query (`@tanstack/react-query`) |
| **Cliente HTTP** | Axios com interceptores de Token e Idempotência |
| **Tempo Real** | Socket.IO Client (`socket.io-client` + Mock Event Hub) |
| **Estilização** | Tailwind CSS v4 |
| **Componentes & Acessibilidade** | shadcn/ui-styled components, Radix/ARIA, Skeletons Shimmer |
| **Mocking de Rede** | MSW (Mock Service Worker) com persistência local e reset |
| **Testes E2E** | Playwright (Desktop 1440px, Tablet 768px, Mobile 390px) |
| **Auditoria de Performance** | Lighthouse (Performance, Acessibilidade, Boas Práticas, SEO) |

---

## ⚡ 2. Execução e Comandos

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento (porta 3000)
npm run dev

# 3. Compilação de produção
npm run build

# 4. Verificação de tipagem TypeScript
npm run typecheck

# 5. Executar testes E2E com Playwright
npm run test:e2e

# 6. Exibir resumo e metas da auditoria Lighthouse
npm run audit:lighthouse
```

---

## 🔑 3. Credenciais Fictícias para Avaliação

O sistema disponibiliza duas contas fictícias pré-configuradas com carteiras e dados no banco de testes:

| Usuário | Email | Senha | Carteiras | Favoritos |
| :--- | :--- | :--- | :--- | :--- |
| **Alex Rivera** | `alex.collector@crypto.art` | `collector123` | 2 (Principal Ethereum, Secundária Polygon) | 2 |
| **Elena Rostova** | `elena.eth@web3.io` | `web3pass` | 1 (Ledger Cold Wallet) | 1 |

*Dica: Na tela de Login e no Console de Simulação há botões de 1 clique para alternar instantaneamente entre esses usuários.*

---

## 🎛️ 4. Console de Avaliação & Simulação (DevTools MSW & Socket.IO)

No topo da aplicação (Navbar), clique no botão **"Simulador MSW"** para abrir o console lateral de avaliação. Ele permite testar e reproduzir todos os cenários exigidos no edital:

1. **Troca Rápida de Usuário**: Alterne a sessão entre Alex Rivera e Elena Rostova para validar isolamento de dados e carrinho.
2. **Latência de Rede Variável**: Alterne entre 50ms, 180ms e 1500ms para visualizar os skeletons com shimmer e o comportamento assíncrono.
3. **Injeção de Falhas HTTP**:
   - `401 Sessão Expirada`: Dispara expiração reativa de sessão com interceptor Axios.
   - `409 Conflito de Estoque`: Simula esgotamento de unidades.
   - `500 Falha de Servidor`: Testa tratamento e mensagem de erro amigável na interface.
   - `Modo Offline (Network Error)`: Simula perda total de conexão.
4. **Eventos em Tempo Real (Socket.IO)**:
   - `Alterar Preço do Valkyrie #089`: Emite o evento `nft.updated` com nova cotação e versão incrementada, atualizando o catálogo, detalhes e alertando o carrinho.
   - `Enviar Evento Obsoleto (v1)`: Demonstra a rejeição e descarte de eventos com versão menor ou duplicada.
   - `Simular Queda / Reconexão de Socket`: Testa a reconexão automática e reconciliação dos dados via REST.
5. **Reset Geral do Banco**: Restaura todas as fixtures originais com um único clique.

---

## 🧪 5. Reprodução dos Cenários de Avaliação

### Cenário A: Alteração de Preço em Tempo Real com Item no Carrinho
1. Adicione a obra **Cyber Valkyrie #089** ao carrinho e abra a página `/cart`.
2. Abra o **Simulador MSW** e clique em **"Alterar Preço do Valkyrie #089"**.
3. O Socket.IO emitirá o evento `nft.updated` com versão superior.
4. Observe que o carrinho exibe um aviso em destaque informando a mudança e recalcula imediatamente o resumo e cotação.

### Cenário B: Prevenção de Pedidos Duplicados com Idempotência
1. Prossiga para `/checkout`.
2. Note a **Chave de Idempotência** gerada para esta tentativa de compra.
3. Finalize o pedido. Em caso de reenvio com a mesma chave, a API MSW recupera o pedido original sem duplicar cobrança ou debitar estoque novamente.

### Cenário C: Teste de Cupons de Desconto
No carrinho (`/cart`), teste os seguintes códigos:
- `AETHERIA10`: Aplica 10% de desconto sobre o subtotal.
- `CRYPTO25`: Aplica 25% de desconto sobre o subtotal.
- `EXPIRED50`: Retorna erro 400 "Cupom de desconto EXPIRED50 expirou em 01/10/2026".
- Qualquer outro código inválido: Retorna erro 400 com feedback visual.

### Cenário D: Simulação de Recusa de Assinatura Web3
1. No `/checkout`, marque a opção **"Simular recusa de assinatura (Code 4001)"**.
2. Clique em **"Confirmar e Assinar Compra"**.
3. A interface apresenta o erro de recusa sem debitar os itens nem desmanchar o carrinho.
