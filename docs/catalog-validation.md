# Evidências — catálogo e detalhe públicos

2026-10-07, America/Sao_Paulo. Escopo encerrado nesta etapa: catálogo/detalhe, base de mocks/eventos, responsividade e testes. Sem conta/carrinho/checkout/favoritos autenticados e sem edição administrativa. Prova /integration preservada.

## Verificações reais

| Verificação | Resultado |
| --- | --- |
| Typecheck | `npm run typecheck`, exit0, TS estrito inclui src/testes/config. |
| Lint | `npm run lint`, exit0, sem warnings de lint. |
| Build | `npm run build`, executado pelo webServer Playwright, exit0; Vite demo + MSW em dist. |
| Suíte final | `npm run test:e2e`, exit0, **45/45** em Chromium Windows, aproximadamente1,7min. |
| Composição dos45 | 24 catálogo/detalhe (8 casos ×3 larguras), 15 integração preservada (5×3), 6 regressão visual (2×3). |
| Casos adicionais finais | URL malformada normalizada na consulta REST; reconexão cancela snapshot pendente anterior à interrupção. |
| Baselines | 6 PNGs gerados após revisão manual e posteriormente comparados sem update-snapshots; regressão passou. |
| Preview/rotas | Suíte usa build/preview real em127.0.0.1:4173; '/', filtro viaURL, /nfts/emerald-042, NFT404, /integration e fallback404; refresh/histórico exercitados. |
| Preservação | 111 assets e15 exports conferidos por SHA-256: zero modificações. Roboto Mono/licença e lockfile preservados; sem nova dependência. |
| Git | Inicializado main, identidade já existente utilizada; base, mocks, UI/testes e documentação em commits separados. Dependências/segredos/resultados temporários ignorados; baselines versionadas. |

Larguras390/768/1440. Relatório HTML: playwright-report/index.html (gerado local, ignorado). Traces/screenshots de falha configurados em test-results. Não foi executado Lighthouse ou nova rodada completa do servidor dev nesta etapa; a validação automatizada final foi no build/preview. Revisão visual de desenvolvimento e referência414 estão documentadas separadamente.

Primeiras rodadas encontraram seletores ambíguos de busca, expectativa incorreta da serialização JSON dos preços, e cenários de rede perdidos no reload. Corrigidos label/seleção de elemento, asserção da URL tipada e persistência/consumo determinístico do cenário na camada MSW. Rodadas finais passaram sem atualizar baselines para esconder falhas.

## Aceite e limites

| Critérios | Evidência / alcance |
| --- | --- |
| FL-01 comportamental público | Hero/destaque/cards; busca/filtros combinados/preço/sort/tab/page; API recebe valores validados; filtro reinicia página; refresh/back/forward; vazio/503/retry; cancelamento da busca obsoleta. Implementado/testado. Fidelidade visual integral ainda tem diferenças registradas. |
| FL-02 parcial | Direto porID, galeria/zoom, informações completas mobile, edição/quantidade/preço;404, indisponível e limite; related e socket. Favoritos autenticados e compra não atendidos por limite desta autorização. |
| ST-01/02/03/04/05/06 | Contratos tipados, Router/URL, Query/Axios/MSW e socket.io-client efetivos nos dois fluxos, Tailwind e Button/Skeleton shadcn. Não equivale a cumprir toda stack nos nove fluxos. |
| IN-01/02/04/05 parcial | Estados de consulta, cancelamento, ETHstrings/BigInt, fonte única REST/eventos e persistência. Sem usuários privados/sessão/carrinho/cotação/pedidos. |
| MK-01/02 parcial |45fixtures/reset/lentidão/503/outage/update/sold-out/old/duplicate reproduzíveis nos mocks. Não implementados dois usuários ou matriz de pagamentos/conta. |
| RT-01/02 parcial | nft.updated no catálogo/detalhe, versões cache/evento, descarte antigo/duplicata, reconciliação REST/reconexão inclusive pendingread, teardown. Sem order.updated, carrinho/checkout/pedido pendente. |
| UI-01/02/03 parcial | Responsivo, labels, teclado, foco/modal/Escape/retorno de foco, texto completo, skeleton dimensionado/shimmer/reduced-motion, teste semoverflow. Sem auditoria completa de zoom/contraste/acessibilidade dos nove fluxos. |
| QA-01/02 parcial | E2E público pela interface/REST handlers/socketreal, isolado por contexto e reset. Baselines início/detalhe; carrinho/pagamento e testes de compra/conta pendentes. |
| DE-02 pendente | Vercel configurada e preview testado; nenhum remote/conta/projeto/URL HTTPS verificado. |

Não marcar FL-03–FL-09, IN-03/06/07, QA-03, EL-01 ou entrega completa como atendidos. A distinção manual Figma versus regressão automatizada e estimativas consta em [catalog-visual-review.md](catalog-visual-review.md). Passos exatos de publicação: [first-deploy.md](first-deploy.md).

## Caminho de dados

URL validada → key Query com parâmetros completos → Axios → handler MSW → base canônica. Mutation de cenário muda base e emite nft.updated pelo binding Socket.IO → cliente recebe identidade/versão → descarta antigos ou cancela/invalida query → GET REST atualiza UI. Reconexão refaz recursos ativos por REST, inclusive a leitura pendente cancelada. React local controla somente busca/preço ainda não enviados, seleção de imagem/edição/quantidade, diálogo e feedback.
