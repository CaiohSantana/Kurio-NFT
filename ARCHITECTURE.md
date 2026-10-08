# Arquitetura — base e prova de integração

Escopo atual: bootstrap e prova de um NFT. A arquitetura futura de sessão, carrinho/cotação e pedidos está proposta em SPEC.md, ainda não implementada. A confirmação do marketplace continua dependente do pedido confirmed na simulação.

## Responsabilidades implementadas

- `src/main.tsx`: ativação explícita por configuração; await worker.start antes de importar as rotas e o cliente Socket.IO.
- `src/app/router.tsx`: TanStack Router em `/`, `/integration` e fallback 404. Nenhuma rota final de marketplace criada.
- `src/shared/api/http.ts`: único Axios, base `/api`, timeout 5s.
- `src/proof/`: contrato próprio de prova, consultas/mutations e tela mínima. Query é dono do NFT/cache; React local guarda mensagens e diagnóstico de conexão/eventos, não uma cópia do NFT.
- `src/mocks/`: fixture/persistência/regras, REST e eventos compartilhando o mesmo NFT. Nenhum componente importa a base mock.
- `src/shared/ui/`: Button/Skeleton gerados pelo CLI oficial shadcn/ui e adaptados à paleta/aliases; Tailwind 4 pelo plugin Vite; `cn` usa clsx/tailwind-merge. Não foi criado sistema de componentes final.

## Contratos desta prova

| Operação | Resposta/efeito |
| --- | --- |
| GET `/api/nfts/emerald-042` | `{ nft: { id, name, priceEth: string, available: integer, version }, readCount }`, header `X-Mock-Handler: proof-nft`. Delay de 650ms, 404 para outro ID, 503 configurável. |
| POST `/api/__proof/scenario` | `{ action }`: change, duplicate, old, disconnect, fail-next ou reset. Retorna mensagem; dados só chegam à UI pela consulta NFT. Action inválida: 400. |
| POST `/api/__proof/reset` | Restaura fixture, contador REST, falha e último evento, limpa persistência e outage. Usado antes de testes. |
| GET `/api/__proof/diagnostics` | Número de conexões ativas na simulação para verificar cleanup. |
| Socket `nft.updated` | `{ eventId, resourceId, version }`, identidade estável e versão monotônica. Payload não contém preço; sua recepção pede REST. |

O preço começa em `1.19`, sobe `0.10` por alteração (BigInt em centavos) e estoque cai uma unidade. Não é implementação monetária/cotação completa de 18 casas. Versão/fixture persistem em localStorage; corrupção volta à fixture conhecida. Outage dura 2s e evento perdido não é reemitido: REST reconcilia.

## Caminho de sincronização

1. Query chama Axios GET; handler MSW lê a base única e devolve NFT/version.
2. Botão de cenário faz Axios POST; handler altera a base e emite pelo binding Socket.IO.
3. socket.io-client recebe `nft.updated`. Versão <= máximo de cache/evento visto é ignorada. Evento novo invalida a query; Axios faz outro GET. Nenhum setter local escreve preço/estoque.
4. `connect`, inclusive após reconexão automática, invalida o recurso ativo e obtém REST. Listeners e conexão são removidos no unmount.
5. Query consome AbortSignal no Axios e mantém dados anteriores durante background refetch/503. Structural sharing impede substituir dado mais novo por versão menor. Nesta prova: staleTime 30s, retry automático desativado, refetchOnWindowFocus false; retry explícito pela UI. Política final de SPEC ainda pendente.

## Versões e compatibilidade

Versões exatas no lockfile. Núcleo verificado: React 19.3.0, TS 5.9.3, Vite 8.3.3, Router 1.170.41, Query 5.104.1, Axios 1.20.0, Tailwind 4.3.3, MSW 2.15.0, binding 0.2.0, socket.io-client 4.8.4, Playwright 1.64.0. ESLint 10.12.0. Node 22.14.0/npm 11.2.0.

O binding publicado 0.2.0 declara peer MSW ^2.10.2. MSW 3 não foi adotado. A [documentação da tag publicada](https://github.com/mswjs/socket.io-binding/tree/v0.2.0) usa `toSocketIo`; a branch principal já descreve outra API. Conferidos package.json, tipos e fonte do pacote instalado, além da documentação atual. [MSW browser](https://mswjs.io/guides/integrations/browser) orienta aguardar worker.start; [Socket.IO client options](https://socket.io/docs/v4/client-options/) define transporte/path/reconnect.

Engine.io-client captura o construtor WebSocket na avaliação do módulo. Por isso importar o cliente antes do interceptor faz a conexão escapar ao MSW mesmo que socket.connect ocorra depois. As rotas são importadas dinamicamente após worker.start. MSW 2.15 normaliza o prefixo padrão `/socket.io/` durante matching; foi escolhido path dedicado `/proof-socket.io/` em ambas pontas, evitando capturar HMR/root e usando namespace `/`.

Binding fornece handshake e codificação dos eventos. Não fornece heartbeat completo: mocks enviam ping Engine.IO `2` a cada 10s; cliente responde pelo protocolo. Para recusas durante outage, abrir apenas Engine.IO antes de fechar transporte evita uma tentativa presa aguardando timeout; namespace Socket.IO não é aprovado. Reconexão automática é do Manager do socket.io-client, sem botão chamando socket.connect após desconexão.

## Transporte e limitações

- Apenas WebSocket (`transports: ['websocket']`), namespace padrão, eventos JSON/texto, sem polling, rooms, acknowledgements ou binários. Não se assume paridade completa com um servidor Socket.IO real; pacote publicado é experimental.
- REST é interceptado pelo Service Worker; WebSocket é interceptado no contexto do navegador por MSW. Frames Engine.IO/Socket.IO são codificados/decodificados pelo binding e cliente real. Não há servidor remoto nem necessidade de porta WebSocket na hospedagem.
- Worker requer localhost/HTTPS. Mesmo bundle/handlers em dev, teste e demo; configuração explícita autoriza mocks no build.
- Prova testa nft.updated, monotonicidade, reconciliação, persistência, failure/retry, cleanup e heartbeat. order.updated, sessão/usuários, carrinho/compra, todos os demais cenários e nove telas continuam pendentes.
- Persistência não sincroniza múltiplas abas; testes usam contextos isolados. Não há guards nem dados privados nesta prova. Esses critérios não foram considerados atendidos.
- Sem auditoria Lighthouse ou baselines de marketplace; UI mínima não é referência visual final. Fonte local já disponível; medidas do Figma bloqueadas continuam pendentes.
- Vercel está configurada, não publicada. HTTPS e rewrites na URL pública ainda precisam de smoke real; preview local não equivale a deploy.

## Fontes de preparação

- [Vite](https://vite.dev/guide/) — ambiente/build.
- [shadcn/ui Vite](https://ui.shadcn.com/docs/installation/vite) — base/aliases/Tailwind.
- [TanStack Query cancelamento](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation) — signal para Axios.
- Roboto Mono: Fontsource 5.3.0, SIL OFL 1.1; origem e licença integral em public/assets/fonts.
