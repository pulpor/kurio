# Arquitetura do Sistema — Kurio NFT Marketplace

Este documento detalha as decisões arquiteturais, contratos de API REST, eventos em tempo real com Socket.IO, políticas de sessão e cache, e decisões de UX implementadas no projeto.

---

## 1. Contratos REST

A camada de rede é interceptada pelo **Mock Service Worker (MSW)** no nível do Service Worker do navegador (`/mockServiceWorker.js`), garantindo que tanto o cliente Axios quanto requisições HTTP nativas trafeguem pelo transporte real sem mocks manuais em componentes.

### Sessão e Conta
| Método | Rota | Descrição | Status de Retorno |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Autentica colecionador com email e senha. Migra itens de visitante para a conta. | `200 OK`, `401 Unauthorized` |
| `POST` | `/api/auth/register` | Cria nova conta com validação de unicidade de email e username. | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `GET` | `/api/auth/session` | Retorna o usuário autenticado na sessão ativa. | `200 OK`, `401 Unauthorized` |
| `POST` | `/api/auth/logout` | Encerra a sessão e descarta tokens do armazenamento local. | `200 OK` |
| `POST` | `/api/auth/switch-user` | Troca o usuário ativo no ambiente de demonstração. | `200 OK`, `404 Not Found` |

### Catálogo de NFTs
| Método | Rota | Parâmetros | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/nfts` | `q`, `category`, `status`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` | Listagem com filtros combináveis e paginação de 6 itens por página. |
| `GET` | `/api/nfts/:id` | `id` no caminho | Detalhes completos da obra, traits, raridade e contrato. Retorna `404 Not Found` se inexistente. |

### Favoritos
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/favorites` | Retorna os IDs favoritados pelo usuário logado. |
| `POST` | `/api/favorites/:id` | Alterna status de favorito com suporte à **mutação otimista e rollback**. |

### Carrinho e Cotação
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/cart` | Retorna os itens ativos do carrinho do usuário autenticado ou visitante. |
| `POST` | `/api/cart/items` | Adiciona item validando disponibilidade em estoque. Se esgotado, retorna `409 Conflict`. |
| `PUT` | `/api/cart/items/:nftId` | Atualiza quantidade respeitando o limite restante de estoque. |
| `DELETE` | `/api/cart/items/:nftId`| Remove item do carrinho. |
| `POST` | `/api/cart/quote` | Recalcula cotação em tempo real com subtotal, desconto de cupom, taxa de rede (gas fee) e total em ETH e USD. Detecta divergências de preço. |

### Pedidos com Idempotência
| Método | Rota | Headers / Body | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Header: `Idempotency-Key`<br>Body: `{ walletAddress, network, couponCode }` | Cria pedido com bloqueio de duplicatas. Reuso da mesma chave retorna o mesmo pedido (`200 OK`). Conflito de payload gera `409 Conflict`. Salva snapshot congelado e reduz o estoque. |
| `GET` | `/api/orders/:id` | `id` no caminho | Consulta snapshot imutável do recibo com hash da transação. |
| `GET` | `/api/orders` | N/A | Histórico de compras do usuário. |

### Carteiras e Perfil
| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/wallets` | Lista de carteiras cadastradas do usuário. |
| `POST` | `/api/wallets` | Cadastra carteira validando formato `0x...` e define principal/secundária. |
| `PUT` | `/api/wallets/:id` | Atualiza rótulo, rede ou status principal/secundário. |
| `DELETE` | `/api/wallets/:id` | Exclui carteira (impede exclusão se for a única ativa). |
| `GET` | `/api/profile` | Retorna perfil do usuário logado. |
| `PUT` | `/api/profile` | Atualiza dados biográficos, nome e username. |
| `POST` | `/api/profile/change-password` | Valida senha atual e atualiza credencial. |

---

## 2. Eventos em Tempo Real com Socket.IO

A aplicação utiliza o protocolo Socket.IO para sincronização reativa com tolerância a falhas:

### Eventos Implementados
1. **`nft.updated`**:
   - **Payload**: `{ nftId: string, priceEth: string, priceUsd: number, availableCount: number, version: number, timestamp: string }`
   - **Efeito**: Atualiza simultaneamente o catálogo, página de detalhes e alerta o carrinho de compras se um item teve preço ou estoque alterado.
2. **`order.updated`**:
   - **Payload**: `{ orderId: string, status: 'pending' | 'confirmed' | 'failed', transactionHash?: string, version: number, timestamp: string }`
   - **Efeito**: Reconcilia pedidos em andamento e transiciona a UI para o estado terminal de confirmação ou erro.

### Tolerância a Eventos Duplicados e Obsoletos
- O cliente de Socket mantém um registro interno de versões processadas por entidade (`entityKey -> lastVersion`).
- Se um evento chegar com `version <= lastVersion`, o cliente descarta imediatamente o payload e registra aviso, evitando regressão de estado ou reaplicação de efeitos.

### Reconciliação após Reconexão
- Ao reconectar (`connect` ou `reconnect`), o hook `useRealtimeSync` dispara `queryClient.invalidateQueries()`, garantindo que quaisquer mutações ocorridas durante a desconexão sejam sincronizadas via REST.

---

## 3. Política de Estado e Cache (TanStack Query)

- **`staleTime`**:
  - Catálogo e detalhes de NFTs: **30 segundos**
  - Sessão e perfil: **5 minutos**
  - Cotação do carrinho: Dinâmica, invalidada reativamente por eventos Socket.IO ou alterações do usuário.
- **`gcTime` (Garbage Collection)**: 10 minutos para reter dados navegados sem sobrecarga de memória.
- **`retry`**:
  - Consultas (`useQuery`): 1 retry automático em falhas transitórias. Não retenta erros `4xx` (400, 401, 404, 409).
  - Mutações (`useMutation`): **0 retries** para evitar execuções repetidas não intencionais de ações de compra ou exclusão.
- **Atualização Otimista**:
  - Implementada na mutação de favoritos (`useToggleFavorite`): Atualiza imediatamente o estado visual e o contador, e em caso de falha da API, executa o rollback para o snapshot anterior armazenado no contexto da mutation.

---

## 4. Precisão Aritmética de Valores em ETH

Conforme especificado no enunciado:
- Valores em ETH trafegam rigorosamente como **strings decimais** (ex: `"1.450"`, `"0.006"`, `"1.456"`).
- O módulo `src/lib/eth.ts` implementa aritmética de strings (`addEth`, `subtractEth`, `multiplyEth`, `formatEth`) com precisão de 3 casas decimais, evitando imprecisões de ponto flutuante em JavaScript (`0.1 + 0.2 !== 0.3`).
- Quantidades de NFTs são sempre números inteiros positivos.

---

## 5. Acessibilidade e Design Responsivo

- **Viewports Verificados**: Total suporte e fluidez para telas mobile (390px), tablets (768px) e desktop widescreen (1440px).
- **Semântica HTML & ARIA**:
  - Rótulos acessíveis em botões de ação e ícones (`aria-label`).
  - Navegação por teclado com anéis de foco visíveis (`focus-visible:ring-2 focus-visible:ring-violet-500`).
  - Painéis modais e drawers com `role="dialog"` e `aria-modal="true"`.
  - Notificações com `aria-live="polite"` e `aria-atomic="true"`.
- **Skeletons Shimmer**:
  - Cards do catálogo, detalhes e carrinhos exibem skeleton durante carregamento.
  - Respeito à preferência de sistema `prefers-reduced-motion: reduce`, desativando animações contínuas quando solicitado pelo usuário.
