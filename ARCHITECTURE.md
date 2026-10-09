# Arquitetura da versão entregue

Aplicação: https://kurio-nft-delta.vercel.app/ · correção da prova publicada `963d0e0` · auditoria pública anterior `3242294`. A correção altera somente `src/proof/use-nft-socket.ts` e acrescenta cobertura; documentos posteriores não alteram runtime. Não atribuir os scores anteriores à fonte nova. [Correção/evidências](docs/integration-initial-rest-fix.md), [conferência anterior](docs/interface-review.md) e [reprodução anterior](docs/delivery-reproduction.md). Relatos antigos estão no [histórico integral](docs/history/ARCHITECTURE-at-5acbfaf.md).

## Organização e autoridade dos dados

`src/features` organiza catalog, auth, favorites, cart, profile, wallets, checkout e orders. Contratos, consultas e UI permanecem próximos de cada fluxo. `src/shared` contém transporte, tipos de evento e controles com reutilização concreta. `/integration` mantém a prova independente em `src/proof`; `/preparation` é uma entrada técnica para cenários/reset. Não há store remoto paralelo no React nem camadas especulativas.

| Responsabilidade | Local / comportamento |
| --- | --- |
| TanStack Router | `src/app/router.tsx`; rotas/search validados, guards, histórico e retorno ao contexto |
| TanStack Query | Consultas/mutations por feature; cache remoto público e privado por scope |
| Axios | `src/shared/api/http.ts`; base `/api`, timeout 5 s, AbortSignal nas leituras |
| React local | Interações, campos em edição, abertura de diálogos e gesto de envio; não guarda cópia de carrinho/cotação/pedido |
| MSW/mocks | `src/mocks`; fixtures, persistência, regras, handlers REST e emissão dos eventos sobre a mesma base |
| Socket.IO | `src/mocks/socket.ts`, listeners por feature; cliente real recebe protocolo interceptado e pede reconciliação REST |

## Inicialização, build e assets

`src/main.tsx` exige `VITE_ENABLE_MOCKS=true`, importa mocks e aguarda `worker.start` antes de importar/montar o router. Engine.IO captura o construtor WebSocket na avaliação do módulo; a ordem evita que o cliente escape ao interceptor. `.env.demo` versionado habilita mocks no dev/build; `.env.example` documenta a configuração. Não há servidor de negócio externo nem segredo necessário. Worker requer localhost ou HTTPS.

React 19.3.0, TypeScript 5.9.3, Vite 8.3.3, Router 1.170.41, Query 5.104.1, Axios 1.20.0, Tailwind 4.3.3, MSW 2.15.0, binding 0.2.0, socket.io-client 4.8.4, Playwright 1.64.0 e Lighthouse 12.8.2 estão fixados no lockfile. Ambiente reproduzido: Node 22.14.0/npm 11.2.0/Windows; engines aceita Node ≥22.14 e <23. Base shadcn/ui em `shared/ui`, com Tailwind via plugin Vite.

Roboto Mono local, Fontsource 5.3.0, SIL OFL 1.1: [origem/licença](public/assets/fonts/README.md). Quatro artes e exports originais são preservados; derivados WebP/AVIF e dimensões responsivas reduzem transferência sem trocar o enquadramento. Origem/desvios em [design-reference](docs/design-reference.md) e [revisão visual](docs/visual-refinement.md). Hero usa os três NFTs `featured` do REST; indicadores/teclado/swipe, sem autoplay. Conteúdo principal tem prioridade e imagens posteriores são carregadas conforme a composição.

Vercel GitHub/main, Node 22.x, `npm ci`, `npm run build`, `dist`. `vercel.json` mantém fallback SPA sem reescrever assets/worker/API e worker com `Cache-Control: no-cache`; Production/Preview habilitam mocks. [Configuração da publicação](docs/first-deploy.md). Fonte auditada/publicada usa o mesmo código/configuração; relatórios documentais não mudam runtime.

## Contratos REST

| Recurso | Métodos / rotas `/api` | Autoridade / erros |
| --- | --- | --- |
| Sessão/conta | GET/POST/DELETE `/session`, POST `/accounts` | Token/scope/expiração, merge guest na autenticação;401/409/422 |
| NFTs | GET `/nfts`, GET `/nfts/:id` | Busca/coleções/redes/preço/tab/sort/page, 9/página, dados/edições/versões;404/503/transporte |
| Favoritos | GET `/favorites`, PUT/DELETE `/favorites/:id` | IDs por usuário; otimista só na projeção Query, rollback/reconciliação;401/404/503 |
| Carrinho/cupom | GET `/cart`, POST `/cart/items`, PATCH/DELETE `/cart/items/:id`, PUT `/cart/coupon` | Quantidade inteira/edição/estoque; cupom string vazia remove;401/404/409/422 |
| Cotação | POST `/quotes`, POST `/checkout-quotes` | Carrinho na API; checkout recebe walletId/network e retorna ID/fingerprint/validade120s; ETH string18, warnings/purchasable;401/422 |
| Conexão | GET/POST/DELETE `/wallet-connection` | Scope+registro+rede/provider, connected/refused/disconnected;401/422 |
| Tentativa/pedido | GET/PUT/DELETE `/order-attempt`, POST `/orders`, GET `/orders/:id` | Idempotency-Key+payload estável, snapshot, versões e terminal;401/403/404/409/422 |
| Perfil/avatar/senha | GET/PATCH `/profile`, PUT/DELETE `/profile/avatar`, PATCH `/profile/password` | Identidade canônica, PNG/JPEG/WebP decodificado ≤2MB, PBKDF2-SHA256/salt;401/409/422 |
| Carteiras | GET/POST `/wallets`, PATCH `/wallets/:id`, PATCH `/wallet-preferences` | Principal/secundária, endereço EVM ou Solana, duplicidade/reuso;401/404/409/422 |
| Cenários | POST `/__catalog/scenario`, `/__commerce/scenario`, `/__checkout/scenario`, `/__scenario/reset`; prova preservada | Só controles de mocks; reset/reload e receitas no README;400/422 para cenário/preço inválido |

Erros privados: `{code,message,fieldErrors?}`; HTTP503 e network-error ocorrem antes da operação. Respostas catalog/prova têm message e status; UI trata sem inferir sucesso. Timeout de pedido ocorre depois da persistência, excedendo Axios5s. O teste distingue timeout com pedido recuperável de indisponibilidade antes de escrever.

Query: catálogo/detalhe/favoritos staleTime30s; sessão Infinity/refetchOnWindowFocusfalse e timer/401; demais privados staleTime0. Queries e mutations retryfalse, com recuperação explícita; polling2s apenas pending. GETs e consultas canceláveis de cotação recebem AbortSignal. Favoritos cancelam leitura/snapshot/rollback e reconciliam; carrinho cancela/invalida cart/quote/checkout-quote. Chaves públicas incluem busca completa ou ID; privadas incluem scope, recurso e ID/carteira/rede relevantes. Cancelar/remover cache privado e liberar socket ao trocar sessão; callbacks/mutations atrasados verificam scope.

`nft.updated={eventId,resourceId,version}` público e `order.updated={eventId,resourceId,version,userId,scope}` privado. Versões vistas/cache impedem regressão, depois cancel/invalidate→Axios→MSW. Reconexão faz REST dos recursos ativos. Testes UI exercitam Axios e socket.io-client; fetch dos helpers apenas configura/inspeciona a API nos handlers. WebSocket somente, namespace padrão e heartbeat Engine.IO; sem polling de transporte, ACK/binários/rooms, segurança de produção ou sincronização multiaba.

## Sessão, favoritos e carrinho

Contas fictícias Ana/Bruno e cadastro vivem em `commerce-state`, persistidas por origem. Senhas usam PBKDF2-SHA256, salt aleatório e 100.000 iterações; não são salvas em claro. Sessão dura 30 minutos; refresh consulta a API. Timer/401 de expiração leva ao login com `returnTo` e intenção de favorito; o draft não sensível de checkout fica em sessionStorage por userId, sem copiar carrinho/cotação/tentativa.

Logout e troca de usuário cancelam leituras, removem cache privado e encerram a subscription anterior. Handlers capturam scope no início e o revalidam antes/depois da latência; callbacks verificam o scope ativo. O scope demonstrativo não é autenticação segura de produção.

Favoritos têm uma única projeção no cache Query: cancelar leitura, snapshot otimista, rollback em falha e reconciliação pela API. Não há página adicional de favoritos. Carrinho usa identidade `nftId:editionId`, quantidades inteiras e limite min(estoque,maxQuantity). Alterações/cupom invalidam carrinho e cotações; itens esgotados/excessivos continuam visíveis, com bloqueio de compra, sem corte silencioso.

Ao autenticar, a API soma as linhas do visitante às da conta, conserva linhas distintas e mantém o cupom privado existente ou usa o visitante se vazio. Registra `guestId:version` consumido e esvazia/rotaciona o visitante na mesma gravação; retries não repetem a transferência. Logout cria visitante vazio e mantém dados privados para o próximo login. Outra conta recebe somente seus dados mais eventual novo visitante.

ETH trafega como string decimal e é calculado em BigInt de 18 casas. `KURIO10` aplica 10%, com truncamento na unidade mínima; `DROP2025` está expirado. Taxas demonstrativas: Ethereum 0.016, Polygon 0.001, Solana 0.0005 ETH, sem equivalência monetária real. UI usa os totais fornecidos pela API.

## Checkout, idempotência e recibo

Carteira/rede/provider referem-se ao registro salvo e à conexão do scope atual. Editar esses dados desconecta a conexão anterior. Desktop mantém formulário/resumo; mobile expõe detalhes por expansões. Diálogos contextuais permitem selecionar/desconectar carteiras sem controles excepcionais permanentes.

A cotação de checkout tem ID, versão, fingerprint e validade de 120 s. Envio recota por REST; preço/estoque/cupom/taxa alterados exigem nova confirmação contextual. A API revalida novamente conexão, cotação, disponibilidade e cupom antes de criar o pedido. React mantém somente a trava síncrona do gesto de envio e o aceite da revisão, não o estado do pedido.

Tentativa/chave/payload/pedido persistem nos mocks. Mesma Idempotency-Key/payload retorna o mesmo pedido; conteúdo diferente retorna 409, inclusive com criação concorrente. Não há retry automático de POST orders. Cenário de timeout persiste o pedido antes de atrasar a resposta 6 s; GET attempt/eventos recuperam o ID sem criar outra compra.

Pedido pending só transita para confirmed/refused. Não há reserva de estoque: confirmação revalida atomicamente, recusa se insuficiente, reduz estoque e subtrai somente as quantidades compradas do carrinho atual uma vez. Adições posteriores são preservadas; refused mantém itens. Snapshot do recibo permanece imutável e GET order exige ownership. Refresh/reconexão recuperam pela API; polling de 2 s existe somente enquanto pending. Respostas/eventos antigos não substituem versões novas ou fazem terminal regredir. Sucesso requer confirmed na simulação, nunca navegação ou timer de UI.

## Transporte, cenários e limites

MSW 2.15 + `@mswjs/socket.io-binding` 0.2 fornecem handshake/codificação Engine.IO/Socket.IO, namespace `/`, path `/proof-socket.io/`. Mock envia ping a cada 10 s; socket.io-client responde e reconecta automaticamente. Apenas WebSocket JSON/texto; sem polling de transporte, binários, ACKs, rooms, servidor remoto ou paridade completa com um servidor Socket.IO. REST é interceptado no Service Worker e WebSocket no contexto do documento; deploy estático não exige porta WebSocket.

`/__catalog/scenario`, `/__commerce/scenario`, `/__checkout/scenario` e controles de `/integration` alteram somente mocks. `POST /api/__scenario/reset` para timers antes de restaurar contas, catálogo/prova, carrinhos, pedidos, falhas/latências/outage e drafts próprios; reload recria Query/listeners. Não apaga storage alheio. [Receitas reproduzíveis](README.md#cenários-críticos-sem-editar-código). Cada teste usa contexto isolado e reset pelos handlers; helpers configuram/inspecionam a API, sem setters React/Query ou substituição de Socket.IO.

Não há pagamento/blockchain/extensões reais, sincronização multiaba ou segurança de sessão de produção. Diagnósticos ficam em `/integration` e ferramentas de desenvolvimento; a UI mostra apenas feedback útil para decisões. Exploração local informa a natureza fictícia da transação.

## Qualidade e limitações da evidência

Falha inicial da prova corrigida em `963d0e0`: `use-nft-socket` aguarda cancelQueries antes de invalidateQueries tanto em evento aceito quanto em connect/reconnect; Axios usa AbortSignal. Assim, leitura inicial sem cache não reaproveita snapshot anterior. Guarda de efeito ativo evita nova leitura após desmontagem; structuralSharing monotônico e descarte de eventos continuam. Listener do marketplace já fazia cancelamento, sem mudança necessária. Teste novo mantém o primeiro timer MSW pendente, usa Socket.IO real e verifica resposta REST atual/ausência de regressão. Lint/typecheck/build e 27/27 testes afetados passaram; HTTPS 1440/414 confirmou a correção. [Relatório/trace](docs/integration-initial-rest-fix.md).

Suíte completa anterior: 221 passados, 1 baseline antiga da barra mobile, 3 skips; baseline pertinente revisada e caso 1/1 passou. [HTML/trace](docs/audits/final-delivery/playwright-full/index.html). Os três skips são condicionais por viewport em `final-review.spec.ts`: Mercado desktop é coberto no desktop; caminhos mobile 414 são cobertos em mobile, não repetidos em desktop/tablet. Não foram removidos para alterar contagem.

Lighthouse público final: início 91/100 e detalhe 92/100 mobile/desktop; outras categorias 100, 12 HTML/JSON. [Métricas/ambiente/cache/throttling](docs/audits/lighthouse-public-final/summary.json). Sem repetição nesta revisão documental. [Conferência Chrome adicional](docs/interface-review.md) encontrou um aviso de atualização de registro do worker sem bloquear login/compra; não há causa confirmada da falha de login anteriormente relatada, e o usuário informou que o login voltou a funcionar. [Investigação preservada](docs/login-investigation.md).

Avaliações humanas com leitor de tela, alto contraste real, texto ampliado e Safari/iOS permanecem pendentes. O atalho de zoom não teve efeito na conferência atual; não se registra como zoom aprovado. Emulação histórica de cores/zoom e score Lighthouse não substituem essas condições. Desvios do Figma e assets permanecem em [design-reference](docs/design-reference.md) e [visual-refinement](docs/visual-refinement.md).
