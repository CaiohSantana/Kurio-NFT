# Arquitetura — marketplace simulado

Revisão mobile: composição em `src/mobile-reference.css` e no CSS de checkout, sem mudar contratos/fontes de estado. Ordenação usa o mesmo parâmetro do Router/Query dentro dos filtros. Galeria e dados complementares continuam acessíveis por details; `CheckoutNfts` renderiza a mesma cotação em posições responsivas, sem cache duplicado. Perfil mobile abre o menu da conta existente, mantendo logout/troca e isolamento. Senha e confirmação têm visibilidade local independente. Método, comparação e limites: [docs/mobile-fidelity-review.md](docs/mobile-fidelity-review.md). Sem publicação nesta etapa; evidências anteriores são históricas.

## Revisão localizada e carrossel vigentes

Revisão localizada final: campos de carteiras alinhados por labels, Taxa estimada central no resumo e separador social até a borda interna. Hero usa featured:Nft[] do catálogo; indicadores compartilhados com relacionados, swipe/teclado, fade180ms/reduced-motion, sem autoplay/dependências novas. Fonte auditada47469f7:213 E2E passados/3 skips;12/12 após ajuste de teclado/pointer,27 baselines verificadas e8 alteradas após revisão. Lighthouse final85/99 (início mobile/desktop) e85/99 (detalhe), demais categorias100. QA-03 continua parcial; URL HTTPS/manual humano permanecem pendentes. Evidências/capturas: [docs/final-polish.md](docs/final-polish.md).

Status abaixo preserva o histórico das etapas anteriores.

## Carregamento e publicação vigentes

Performance final: início mobile 85 / desktop 99, detalhe mobile 85 / desktop 99; demais categorias 100. Fonte auditada 1a5dc91; 12 medições preservadas. Typecheck/lint/build passaram;186/3 na suíte completa, 36/36 após ajuste de cores forçadas e 24/24 após retirar prefetch do catálogo. Baselines intactas. Zoom nativo 400% nove telas e emulação forced-colors: 36 inspeções sem overflow. Relatórios, limites e antes/depois em [docs/performance-closure.md](docs/performance-closure.md). beforeLoad do Router inicia prefetchQuery de sessão/detalhe com o QueryClient compartilhado. Query continua autoridade de cache, Axios REST/AbortSignal. Catálogo segue consulta pelo componente. retryOnMount=false conserva erro de prefetch para retry explícito. MSW.start precede avaliação do socket; privacidade/idempotência/versões inalteradas. Cores forçadas usam outline sistêmico apenas nesse media query.


Commits de implementação e relatórios enviados ao origin/main, confirmado por git ls-remote. Publicação da aplicação na Vercel ainda depende de autenticação/importação e validação da URL HTTPS; passos em docs/first-deploy.md.

## Auditoria e carregamento anterior

Bootstrap importa React/Query/Router somente após worker.start; modulepreload antecipa downloads sem avaliar socket.io-client antes da interceptação. lazyRouteComponent separa rotas privadas/prova; estilos de conta ficam na base e recibo importa CSS no acesso direto. Tailwind descobre classes exclusivamente em src: relatórios não mudam o bundle. Diálogos circulam foco e auth limita altura em zoom ao vivo, conservando drafts e geometria normal. REST/cache privado/idempotência/reconciliação não mudaram. WebP deriva das artes locais, PNGs/exports preservados; migração somente dos caminhos de arte no catálogo, snapshots antigos imutáveis. Lighthouse usa build demo/cenário padrão, 12 perfis novos; nenhuma funcionalidade ou latência reduzida para auditoria. Fonte b6fba35 verificada no checkout limpo: 186/3 E2E, demais categorias 100, Performance mobile 86/83 pendente. A simulação continua documentada sem detalhes técnicos no produto. Evidências/limites em docs/quality-audit.md.

## Ajustes finais de composição e interação

Decisões vigentes em docs/final-screen-review.md. Primitivas compartilhadas com reutilização concreta: EnsField em perfil/carteiras/pagamento (draft local de nome+sufixo; REST recebe ENS completo) e RelatedNfts em detalhe/carrinho (três grupos dos itens da API, sem novo estado remoto). Price interval mantém dois inputs nativos sobre uma trilha, sem dependências. CartLink transmite parâmetros validados do catálogo em history.state para Continuar explorando.

Checkout não tem checkbox de revisão nem conexão/recuperação permanentes. Selecionar carteira/provedor chama POSTconnection com argumentos explícitos; não depende de draft anterior ao render. Somente a resposta connected de scope/registro/rede/provider atuais habilita CTA. Primeiro Confirmar compra aprova o resumo exibido e recota por REST; fingerprint diferente abre confirmação contextual, que recota novamente. Stamp é metadata de revisão, não cópia dos valores da Query. Trava síncrona e idempotência persistida mantidas.

GETattempt+GETorder recuperam pending automaticamente e navegam ao mesmo recibo; falha de consulta tem retry contextual. Submit também consulta tentativa antes de criar: se pending, retorna o pedido existente; se terminal e há nova compra válida/ação explícita, limpa tentativa na API e prepara nova chave. Não confirma sucesso por navegação. Timeout original ainda é observado como requestfailed do Axios, mesmo que evento/GET já tenha recuperado o pedido. A composição da confirmação e suas três baselines foram preservadas.

Nome do perfil no pagamento usa collector.username e espelha Nome de usuário; não escreve nickname. Novas carteiras começam sem rede/provider; edição conserva dados registrados. ENS/indicação seguem opcionais apesar do asterisco visual do export, com informação acessível e sem alterar backend. Senha continua obrigatória apenas ao solicitar mudança, sem asteriscos visuais. Social usa vetores Figma locais e segue indisponível sem criar sessão.

## Fechamento funcional vigente

Matriz conferida no código/testes em [docs/functional-closure.md](docs/functional-closure.md). Nenhuma nova composição visual ou infraestrutura. Nova trava síncrona `useRef` controla somente o gesto de enviar o formulário até a mutation terminar; tentativa, chave, cotação e pedido permanecem remotos. Backend ainda protege concorrência/replay e payload distinto409.

Os cenários ganharam erro real de transporte REST (`HttpResponse.error`), expiração de KURIO10 já aplicado e aumento de taxa em0.001ETH. Taxa/cupom podem mudar sem evento: o POST de cotação no envio detecta a alteração, invalida o aceite e a criação revalida novamente. Cupom expirado permanece registrado para explicar o bloqueio, sem desconto e sem remover itens; usuário o remove no carrinho e revisa. Todos os cálculos e incrementos de preço usam BigInt18; `price` recebe string decimal válida até18 casas apenas no endpoint de cenários, sem UI de administração.

POST `/api/__scenario/reset` é reset integral exclusivo da simulação. Para timers de settlement antes de substituir contas, limpa checkout/config, commerce, prova+catálogo/falhas/outage e drafts `kurio-checkout-draft:*`. Storage alheio não é apagado. Recarregar após reset recria Query/listeners. Testes usam contextos isolados; nenhum estado de negócio é alterado por setter. Latências e disparos são configurados nos handlers; novos casos fixam Date em2026-10-08 e usam hold/confirm para estados sensíveis.

Skeleton aplica shimmer compartilhado e respeita reduced-motion. Quantidade do detalhe informa aria-invalid; login explica expiração apenas nesse estado; título do pedido usa aria-live para anunciar transições. Diálogos nativos/labels continuam; auditoria integral de acessibilidade, CLS, contraste e zoom permanece pendente.

### Contratos e política reais, prevalecem sobre propostas históricas

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

Revisão visual: checkout segue formulário/resumo desktop e expansões mobile; seleção/desconexão usa diálogo contextual, com carteira/provider/rede ainda controlados pela API/Query. Recibo é diálogo nativo sobre fundo estável; acesso direto/refresh continua consultando pedido privado e sucesso exige confirmed. Campos internos/versões não aparecem na UI; testes verificam versões por REST e observam order.updated no console do modo demo, disparado exclusivamente no listener Socket.IO real. Menu de conta e sidebar compartilham a mutation de logout já existente. Modal local de exploração usa o snapshot e identifica a referência fictícia; não há blockchain/Etherscan. Os dados e a natureza simulada ficam documentados, sem banners genéricos nas telas. Evidências/desvios em docs/visual-refinement.md; contrato/idempotência/cache/reconciliação abaixo preservados.

## Estado atual e pagamento/pedidos

Catálogo, detalhe, sessão, favoritos, carrinho, perfil, carteiras, pagamento e recibo estão implementados na simulação. Os relatos anteriores são históricos; esta seção prevalece para o estado atual. Evidências e limites em docs/checkout-validation.md. Lighthouse, publicação e refinamento visual integral seguem pendentes.

- Router mantém rotas/search/retomada; Query mantém recursos privados por scope e consultas canceláveis; Axios é o transporte REST. `checkout-state` aplica regras no mesmo Account persistido de commerce-state. React guarda apenas interação e drafts de campos.
- REST: `/api/profile`, `/api/wallets`, `/api/wallet-connection`; POST `/api/checkout-quotes`; GET/PUT/DELETE `/api/order-attempt`; POST `/api/orders` com `Idempotency-Key`; GET `/api/orders/:id`. Erros tipados incluem422/409/401/403/404. Endpoints de cenário são exclusivos da demonstração/testes.
- Carteira/rede selecionadas definem provider/endereço registrados. Editar esses dados desconecta a conexão anterior. Conexão pertence ao scope; mudança de sessão não reutiliza conexão alheia. Taxas demonstrativas Ethereum0.016/Polygon0.001/Solana0.0005, todas expressas em ETH por contrato, sem equivalência monetária real.
- Cotação reutiliza o cálculo canônico do carrinho, com strings ETH e BigInt18. Contém ID/versão/fingerprint/validade120s e snapshot de itens/carteira/rede. Query key inclui scope/carteira/rede; eventos/mutations invalidam. Envio recota por REST e exige aceite explícito se o fingerprint mudar; API também revalida cotação, estoque, cupom e conexão.
- Draft não sensível do checkout usa sessionStorage por userId: campos do colecionador e seleção de carteira/rede. Não replica carrinho, totais ou tentativa. Expiração retoma via guard/returnTo; outra conta lê seu próprio draft.
- Tentativa/chave/payload/pedido vivem na API simulada persistida. Mesma chave/payload retorna mesmo pedido; diferente409. O backend verifica novamente a chave imediatamente antes da escrita após await, cobrindo criação concorrente. Pending diferente impede nova tentativa; terminal exige ação explícita para nova compra. Nenhum retry automático de POSTorders.
- Timeout de cenário persiste pedido antes de atrasar resposta6s, excedendo Axios5s; GETattempt recupera ID e chave. Deadline e resultado simulado são persistidos. Timer pertence aos mocks; GET retoma após refresh, nunca confirma por navegação/temporizador de UI.
- Pending só transita para confirmed/refused. Estoque não é reservado: confirmação revalida atomicamente todos os itens, recusando se insuficiente. Confirmed reduz estoque e subtrai somente as quantidades compradas do carrinho atual, uma vez; adições posteriores permanecem. Refused mantém carrinho. Snapshot/recibo permanecem imutáveis após alteração do catálogo.
- `mocks/socket.ts` preserva Engine.IO/Socket.IO via MSW+binding0.2; cliente envia scope na conexão. nft.updated é público; order.updated é privado e filtrado também por scope/userId/versão no cliente. Eventos invalidam Query para ler REST, sem fabricar DTO/status. Reconexão reconcilia NFT/carrinho/cotações/conexão/tentativa/pedido. GETorder tem polling2s apenas enquanto pending como recuperação de evento perdido; resposta antiga não substitui versão mais nova/terminal.
- Logout/troca cancela/remove cache e fecha subscription antiga. Handlers verificam scope antes/depois de atrasos; callbacks privados verificam scope ativo. Ordenação/ownership protegem contra respostas/eventos atrasados. Persistência e tokens são simulação local, não autenticação de produção.
- Limitações mantidas: WebSocket explícito, namespace padrão/eventos JSON; sem polling de transporte Socket.IO, binários, ACKs, rooms ou servidor real. Scope na URL é filtro demonstrativo, não autorização segura de servidor. Links de transação SIM informam que não existe exploração blockchain real.

## Registros históricos das etapas anteriores

Perfil/carteiras: contratos e API em features/profile e features/wallets; regras em mocks/account-state, dados na mesma Account de commerce-state. Identidade canônica, avatar decodificado e hash de senha, scope verificado após async; carteiras por tipo/rede/endereço e preferência reusePrimary sem cópia. Consultas privadas Query, formulários HTML como drafts locais, erros por campo e guard consultando sessão/cache atual. Evidência12/12 em docs/account-validation.md; pagamento/pedidos seguem na etapa autorizada.

Correções de navegação/badge em 2026-10-08: CatalogLink coordena hash/scroll na montagem do catálogo, respeita reduced-motion e preserva search/contexto no history do Router; CartLink observa a query global do carrinho por scope e soma quantities. Causas, contrato de acessibilidade e evidência78/78 em docs/navigation-cart-fixes.md. Nenhum contador local independente.

## Histórico da base e das etapas anteriores

O relato a seguir preserva as decisões da época; escopo, contratos e resultados vigentes estão acima e na matriz.

Escopo naquela etapa: base, catálogo/detalhe, sessão, autenticação, favoritos e carrinho/cotação. A descrição inicial da prova é histórica; decisões atuais estão nas seções finais. Pagamento, perfil, carteiras, pedidos e confirmação ainda não estão implementados. A confirmação do marketplace continua dependente do pedido confirmed na simulação.

Atualização: catálogo e detalhe públicos implementados nesta etapa. A descrição da prova abaixo é histórica; o NFT da prova agora é uma projeção da mesma base canônica do catálogo. Contratos, cache, cenários e diferenças atuais estão na seção final.

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

## Catálogo e detalhe públicos

`src/features/catalog` reúne tipos/validação, Axios/Query, componentes e socket; sem store global. `src/mocks/catalog-state.ts` é a fonte canônica de45 NFTs. `/`, `/nfts/$nftId` e o shell usam Router; `/integration` continua isolada visualmente e `/preparation` conserva a entrada mínima para a prova.

Router valida q/collections/networks/minPrice/maxPrice/sort/page/tab, descarta valores desconhecidos e normaliza intervalo invertido/página inválida. Usa serialização JSON nativa (strings decimais aparecem entre aspas codificadas); URL malformada tem fallback seguro, sem reescrita automática até a próxima navegação. Alterar busca/filtro/sort/tab reinicia page=1. Draft de busca/preço é local até envio, sem duplicar os resultados remotos. Histórico/refresh reconstroem estado.

Query keys: `['catalog', searchCompleta]` e `['nft', id]`. Axios recebe todos os parâmetros e AbortSignal. Consultas desta etapa têm staleTime30s e retryfalse, com retry acessível explícito, sem esconder falhas determinísticas. Refetch mantém dados existentes em background; mudança de parâmetros usa skeleton em vez de mostrar resultado de outro filtro. Detalhe aplica structural sharing monotônico.

REST:

- GET `/api/nfts`: busca case-insensitive; OR dentro de coleções/redes e AND entre grupos/preço/tab; sort recente/menor/maior; 9 itens/página. Retorna items,total,pages,page,revision,facets. Valores ETH strings e comparação em BigInt de18 casas. Contagens são do catálogo completo.
- GET `/api/nfts/:id`: nft completo (identidade/token/artes/galeria/rede/coleção/preço/versão/edições/quantidades/descrição/contrato/royalties) e readCount. 404,503,latência configurável. Não há mutation administrativa; apenas endpoints de cenário internos aos mocks.
- POST `/api/__catalog/scenario`: reset,slow(delay),fail(next503),change(id),sold-out(id),duplicate,old,disconnect. Configuração de latência/falha persiste até reset/consumo para reproduzir refresh. Estado de NFT persiste por origem; reset integral restaura fixture. Snapshot é capturado antes da latência, permitindo exercitar descarte de respostas antigas.

`useCatalogSocket` reutiliza path/handshake/heartbeat validados, com um socket por shell. `nft.updated` invalida listas e recurso afetado, incluindo consultas filtradas que podem mudar ordem/composição. Descarta versão <= cache/listas/evento visto. Antes de refetch por evento ou reconexão, cancela consultas ativas, inclusive uma leitura inicial pendente com snapshot anterior à interrupção. Reconexão obtém REST; nunca injeta preço via setter local. Listeners são removidos no unmount. Metadados de versão por recurso não substituem cache de dados.

Pontos de integração: DTOs de edição/quantidade/NFT fornecem seleção para futuro carrinho; nenhuma mutation de compra/favorito foi criada. Botões exibem indisponibilidade explícita em diálogo, sem sucesso fictício. Galeria/zoom e conteúdo completo funcionam no mobile. Seções editoriais/newsletter mantidas visualmente, sem novas páginas/falso cadastro. Detalhes visuais estimados/desvios e baselines constam em docs/catalog-visual-review.md.

Referências técnicas consultadas: [Router search params](https://tanstack.com/router/latest/docs/framework/react/guide/search-params) e [Query paginação/keys](https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries). Bibliotecas e lockfile não foram alterados nesta etapa.

## Sessão, favoritos e carrinho — 2026-10-08

Organização: `features/auth` reúne contratos, sessão e formulário; `features/favorites` contém o botão integrado aos cards e detalhe; `features/cart` reúne contratos, consultas/mutations e tela. `mocks/commerce-state.ts` concentra contas, sessão, favoritos, carrinhos, regras de cupom e cotação. `commerce-handlers.ts` expõe REST usando o mesmo estado. Nenhum componente importa os mocks. Sem dependências ou store adicionais.

### Sessão e fronteira de identidade

- GET `/api/session` recupera `{user,scope,expiresAt,notices,expired}`. Login POST `/api/session`, cadastro POST `/api/accounts` e logout DELETE `/api/session`. Cadastro inicia sessão. Dois usuários fictícios: `ana@kurio.test` e `bruno@kurio.test`; senha demonstrativa `Kurio123!` para ambos. Cadastro: usuário 3–32 letras/números/_/-, e-mail válido, senha 8–128 caracteres, confirmação igual. Limites são decisões da simulação, não medidas do Figma.
- A simulação persiste somente salt aleatório e hash PBKDF2-SHA256 (100.000 iterações, 256 bits), nunca senha/confirmação. [Web Crypto deriveBits](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits) fundamenta a implementação. Senhas ficam somente no formulário/requisição/mutation em memória, sem URL/persistência. O estado local da simulação é uma demonstração no navegador, não um sistema real de autenticação ou cookie HttpOnly.
- Token opaco aleatório identifica cada sessão, com expiração de 30 minutos. GET resolve identidade na API; cliente não lê localStorage para se autenticar. Requests de carrinho/favoritos/cotação usam `X-Session-Scope`, capturado pela operação; handler valida identidade antes e após a latência, antes de gravar. Token antigo nunca adquire a identidade nova. Visitante possui scope `guest:<uuid>`.
- Query `['session']` é a fonte de sessão, staleTime Infinity, GET inicial após refresh, timer de expiração e erros 401 `SESSION_EXPIRED`. Não existe cópia React da conta. Chaves privadas `['private',scope,'favorites'|'cart'|'quote']` distinguem inclusive duas sessões da mesma conta. Favoritos: staleTime30s; carrinho/cotação: staleTime0; retryfalse e recuperação explícita. Axios consome AbortSignal nas leituras; mutations sem retry automático.
- Troca/logout: cancelar e remover todas as queries privadas, liberar mutation cache e substituir a query de sessão. A subtree por scope desmonta listeners/socket anteriores e cria somente uma conexão nova. Callbacks de mutations verificam scope ativo antes de invalidar/restaurar cache. Um 401 atrasado da sessão anterior é ignorado pelo provider atual. Eventos existentes são públicos (`nft.updated`), sem dados de usuário; não se inventou um protocolo de eventos privados. Listener desmontado tem flag de descarte e não recota o carrinho da nova sessão.
- `returnTo` interno seguro e intenção de adicionar/remover favorito ficam nos search params Router de `/login` e `/signup` (`favoriteMode=remove` para remoção); URLs externas, `//`, barras invertidas, CR/LF e retorno circular a auth têm fallback `/`. `edition` e quantidade inteira válida do detalhe também ficam na URL. Draft numérico inválido é local; seleção válida sobrevive ao login/refresh. Sessão expirada preserva carrinho privado na API e retorna ao fluxo após autenticar. Mutation de carrinho rejeitada não é reaplicada automaticamente; usuário revisa e tenta de novo. Favoritos retomam a intenção explícita por REST, sem inverter remoção em inclusão.
- Login executa a intenção de favoritar por REST antes do retorno. Falha nessa operação informa que o favorito não foi salvo e permite tentar pelo coração, sem desfazer o login. Logout mantém carrinho/favoritos do usuário na API e cria visitante vazio. Troca por login direto não transfere o carrinho privado anterior. Google/Facebook e recuperação de senha apresentam indisponibilidade explícita, sem sessão ou sucesso fictício.

### Favoritos

GET `/api/favorites` e PUT/DELETE `/api/favorites/:nftId` exigem autenticação; API valida NFT e ownership. Cache é a única projeção na UI. Mutation cancela leitura, guarda snapshot e altera Query otimisticamente; erro restaura snapshot, sucesso/finalização reconcilia REST. Desabilitar corações durante uma mutation da sessão evita snapshots concorrentes conflitantes; callbacks antigos não recriam cache removido. Estratégia baseada em [TanStack Query useMutation](https://tanstack.com/query/latest/docs/framework/react/reference/functions/useMutation). Não foi acrescentada página separada de favoritos; integração é nos cards e detalhe.

### Carrinho e conciliação

- GET `/api/cart`; POST `/api/cart/items` com `nftId,editionId,quantity`; PATCH/DELETE `/api/cart/items/:id`, onde id canônico é `nftId:editionId`; PUT `/api/cart/coupon` com `code`, string vazia remove. Linhas diferentes por edição. API valida quantidade inteira >=1 e <=min(estoque da edição,maxQuantity); adição soma à linha existente. Erros 404/409/422 não alteram o carrinho.
- Visitante persiste na simulação por origem. Ao autenticar, transferir atomicamente guest para a conta: somar linhas iguais, preservar distintas, manter cupom privado existente ou usar o visitante se privado vazio. Registrar `guestId:version` consumido, esvaziar guest e rotacionar guestId na mesma gravação. Repetir login/retry não transfere de novo. Transferência não acontece em efeitos React/refetch.
- Somas acima do limite e edições esgotadas são preservadas com aviso e bloqueio do encaminhamento. Usuário ajusta ou remove; nunca cortar quantidades/remover itens silenciosamente. Redução de uma soma excessiva permite voltar ao limite atual. Logout cria visitante vazio e preserva os dados da conta; login em outra conta exibe somente seus itens, mais eventual visitante novo. Sem sincronização entre abas ou servidor externo.
- Detalhe oferece adicionar e continuar ou COMPRAR, que adiciona a seleção e abre `/cart`. Pagamento ainda pendente: CTA “Conectar e finalizar” explica o encaminhamento futuro `/checkout`, sem enviar pedido nem abrir confirmação. Não foi criada rota vazia de compra.

### Cotação e eventos

POST `/api/quotes` devolve linhas enriquecidas com NFT/version/edição/quantidade/limite/disponibilidade/lineEth e `subtotalEth,discountEth,networkFeeEth,totalEth,coupon,cartVersion,purchasable,warnings`. Todos os valores ETH trafegam como string. Mocks calculam em BigInt de 18 casas e serializam decimal sem zeros supérfluos. UI não recalcula total.

Cupom `KURIO10`: 10% do subtotal, truncamento apenas na unidade mínima (10^-18 ETH); `DROP2025`: expirado; outros: inválidos. Taxa demonstrativa por carrinho não vazio: `0.016` ETH, vazio: zero. Exemplo verificável: 2×1.19=2.38; desconto0.238; taxa0.016; total2.158. Cotação inclui itens indisponíveis, sinaliza bloqueio e permite recuperação. Taxa por carteira/rede, quoteId/validade, aceite de revisão e vínculo com pedido são da futura etapa de pagamento.

Mutation de carrinho cancela consultas privadas conflitantes e invalida carrinho/cotação; UI mostra skeleton estável no resumo ao recotar. `nft.updated` mantém o protocolo e controle de versão validados: atualiza base canônica → evento pelo binding MSW → socket.io-client → cancelar/invalidate catálogo/detalhe/cotação da sessão ativa → REST calcula preço/estoque atuais. Duplicados/antigos são descartados; reconexão refaz cotação mesmo que evento tenha sido perdido. Callback de conexão anterior não altera cache da nova identidade.

### Cenários e evidências

POST `/api/__commerce/scenario`: reset,expire,slow(delay0–4000),fail(target session/login/signup/logout/favorites/cart/coupon/quote/all). Controles atuam somente nos mocks. Falha de uma chamada e latência persistem para testar refresh; identidade/latência/falha são capturadas no início do handler. Reset restaura contas, sessão, guest e dados privados; reset catálogo continua separado. Testes usam contextos isolados e os handlers reais, sem page.route ou setters.

Revisão manual, decisões visuais, resultados finais e alcance em `docs/commerce-validation.md`. Baselines da aplicação revisada são distintas da comparação com PNGs do Figma. Lighthouse, autenticação de produção, pedidos e URL pública permanecem pendentes.
