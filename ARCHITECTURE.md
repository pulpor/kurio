# Arquitetura

- `src/router.tsx`: rotas TanStack Router, filtros do catálogo na URL e proteção das páginas privadas.
- `src/components/`: telas e componentes responsivos.
- `src/hooks/`: consultas e mutações com TanStack Query.
- `src/lib/`: cliente Axios, cache, Socket.IO e utilitários.
- `src/mocks/`: API simulada com MSW, dados persistidos e servidor Socket.IO simulado.

## Dados e tempo real

A API simulada em `/api` atende autenticação, NFTs, favoritos, carrinho, cotações, pedidos, perfil e carteiras. Pedidos usam chave de idempotência; valores em ETH são strings decimais.

Consultas ficam atualizadas por 20 segundos e são removidas do cache após 10 minutos; erros 4xx não são repetidos e mutações não têm repetição automática. Favoritos usam atualização otimista com reversão em caso de erro.

Eventos `nft.updated` e `order.updated` são versionados: eventos antigos ou duplicados são descartados. Na reconexão, o cliente renova a inscrição e invalida as consultas para reconciliar os dados.

## Limitações

O servidor e a sessão são simulados, com um usuário ativo por perfil do navegador. O binding Socket.IO não implementa salas, namespaces, acknowledgements ou ping. Os botões Google e Facebook são ilustrativos; páginas editoriais e de suporte não foram implementadas. O MSW precisa iniciar antes do carregamento da aplicação para interceptar o WebSocket.
