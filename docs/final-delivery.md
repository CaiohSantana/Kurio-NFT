# Fechamento da entrega e publicação

Correção posterior validada em HTTPS: `963d0e0` resolve a primeira leitura obsoleta de `/integration`; lint/typecheck/build e 27/27 casos direcionados passaram. [Causa/relatórios/capturas](integration-initial-rest-fix.md). Demais fluxos/layouts preservados; suíte completa e Lighthouse abaixo pertencem à versão anterior, sem nova execução. A pendência funcional histórica abaixo foi corrigida; avaliações humanas permanecem abertas.

Atualização documental de 09/10/2026: [conferência adicional](interface-review.md) e [checkout limpo](delivery-reproduction.md) concluídos sobre a mesma aplicação `5acbfaf`, sem repetir suíte completa/Lighthouse. Os fluxos do marketplace passaram, mas há pendência confirmada em `/integration`: evento durante a primeira leitura pode manter snapshot antigo até consulta manual. Correção/teste direcionado e avaliações humanas continuam pendentes; a matriz/resultado anterior abaixo não elimina esse achado. Fonte auditada `3242294` difere do SHA documental/publicado, com código/configuração da aplicação equivalente.

Layouts desktop/mobile aprovados pelo usuário, referência visual final d69af01. Nesta etapa não se alterou UI ou lógica dos fluxos. Publicação Vercel e smoke HTTPS desktop/mobile verificados. Lighthouse público final concluído com todas as medianas acima das metas; avaliações humanas de acessibilidade continuam pendentes. Publicação validada com essas ressalvas.

## Requisitos e gate local

Fonte: [enunciado original](challenge-original.md), [SPEC](../SPEC.md) e [matriz detalhada](functional-closure.md). A matriz anterior permanece histórica; as evidências finais abaixo prevalecem.

| Requisito | Implementação/evidência | Status atual |
| --- | --- | --- |
| Stack obrigatória e eliminatórios | React/TS, Router, Query, Axios/REST, Tailwind/shadcn, MSW, socket.io-client em src; Playwright/Lighthouse configurados e usados. Nenhum sucesso de compra por setter/navegação. | Verificado localmente |
| Nove telas e contextos de URL | Features catalog/auth/cart/checkout/orders/profile/wallets; catálogo/histórico/obsoletos/404/quantidades em catalog.spec; layouts aprovados pelo usuário. | Verificado localmente |
| Sessão, favoritos e isolamento | commerce.spec/account.spec/checkout.spec: refresh/expiração/retomada, cache/eventos tardios, merge único, rollback e dados privados. | Verificado localmente |
| Cotação precisa e compra | functional-closure/checkout: BigInt18, strings ETH, disponibilidade/cupom/taxa/conexão, nova aceitação, clique/timeout/idempotência409. | Verificado localmente |
| Pedidos/recibos | checkout: pending/reconnect, terminais/antigos/duplicados, remoção única e adições posteriores, snapshot e autorização. | Verificado localmente |
| Perfil/senha/avatar/carteiras | account.spec: persistência, erros reais dos mocks e isolamento. | Verificado localmente |
| Mocks, cenários e transporte | Resets determinísticos; fixtures 45 NFTs/duas contas; integration/functional-closure comprovam REST/MSW e protocolo Socket.IO. | Verificado localmente |
| Acessibilidade | quality e fluxos: labels, foco/trap, teclado, seleção, reduced-motion; auditorias e reflow anteriores. | Parcial: avaliações humanas de leitor de tela/alto contraste/text-only/Safari continuam pendentes |
| Qualidade automatizada | Typecheck/build, execução completa e única baseline da barra revisada. | Verificado no alcance abaixo |
| Lighthouse ≥90/95/95/90 | 12 relatórios públicos: início91 mobile/100 desktop, detalhe92/100; outras categorias100. | Verificado nas condições finais, histórico local abaixo de90 preservado |
| Publicação/entrega | Repo/Vercel READY com commit confirmado; smoke HTTPS desktop/mobile, 11 rotas por perfil e recursos. | Verificado HTTPS; evidências abaixo |

Typecheck executado uma vez, dentro de `npm run build`; build demo passou. Suíte completa executada uma vez sobre esse mesmo dist, com configuração temporária que troca somente o comando do webServer para preview, preservando três projetos/casos/reset. Primeira tentativa de inicialização do servidor teve cwd incorreto; nenhum teste havia iniciado; corrigido o cwd da configuração temporária.

Resultado completo: **221 passados, 1 diferença de baseline, 3 skips**, 8,9 minutos. A diferença de 1809 pixels fica apenas na barra aprovada: bbox x0–390/y718–798 numa imagem 390×6310. Nenhuma falha funcional e 26 outras baselines passaram. Só `home-chromium-mobile-win32.png` foi atualizada após revisar o diff; caso pertinente reexecutado sem update: **1/1 passou**. Sem repetir casos já aprovados ou toda a suíte. [HTML completo](audits/final-delivery/playwright-full/index.html), [HTML da baseline atualizada](audits/final-delivery/playwright-navbar-updated/index.html), [diff revisado](audits/final-delivery/navbar-diff.png). Não apresentar o resultado inicial como uma execução inteiramente verde.

Três skips preservados: Mercado desktop no projeto mobile (navegação coberta separadamente) e fluxo extra de 414 px nos projetos desktop/tablet (executado no mobile). Não há skip novo. Lint passou após declarar o global URL no runner de auditoria; sem alteração da aplicação.

## Preparação de deploy

Vercel CLI 63.1.0 autenticada pelo usuário; projeto existente `caioh-santana/kurio-nft`, ligado a `CaiohSantana/Kurio-NFT`, branch main, raiz e preset Vite. Ajustados npm ci, npm run build, dist e Node22.x. VITE_ENABLE_MOCKS=true explicitamente em Production e Preview. vercel.json preserva fallback SPA e worker no-cache.

Range Node anterior >=22.14 poderia sobrepor a versão escolhida na Vercel e selecionar 24.x. Restrito a >=22.14.0 <23 em package/lockfile (só metadado engines; nenhuma versão de dependência mudou), para alinhar ao Node22 validado. [Regra oficial de versões Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions). Arquivos de autenticação/OIDC e .vercel continuam fora do Git; não há segredo VITE ou backend real.

Runner aceita AUDIT_URL para auditar produção sem iniciar preview e AUDIT_DEPLOYED_COMMIT para registrar o commit confirmado nos metadados Vercel. delivery-smoke verifica UI em desktop/mobile, login e refresh, carrinho visitante, cadastro de carteira, compra confirmada pela API, recibo, logout, rotas/recursos e eventos/duplicatas/reconexão. Scripts não substituem a API por dados locais na interface.

## Publicação e smoke HTTPS

URL pública: https://kurio-nft-delta.vercel.app/ . Repositório: https://github.com/CaiohSantana/Kurio-NFT . Primeiro commit publicado nesta etapa: `ceaab3f7b311ef8155f628f758f8d6c35184301e`, deploy `dpl_C16STGMoT8H42vB83r8XNgbvcLL2`, READY/Production. [Metadados filtrados da Vercel](audits/final-delivery/deployment.json), [HTTPS200 sem bypass TLS](audits/final-delivery/https.json). Nenhum segredo nos relatórios.

Smoke [desktop1440×900](audits/final-delivery/public-desktop.json) e [mobile390×844](audits/final-delivery/public-mobile.json): ambos passaram. Por perfil, 11 rotas com entrada direta/refresh (início, detalhe válido/inexistente, carrinho, login, cadastro, perfil, carteiras, checkout, integration e pedido criado), quatro recursos locais200 (worker, fonte, WebP e PNG original); decodificação das imagens/fontes nas rotas. Login pela UI, visitante com duas unidades conciliadas, sessão após refresh, carteira pela UI, conexão/checkout, snapshot confirmado por REST, recibo após acesso direto e refresh, badge0 após compra, logout e guard retornando ao login. Headers dos handlers e métricas da prova comprovam REST/MSW, evento por socket.io-client, descarte de antigos/duplicados e reconciliação por REST após reconexão. Não repetimos a suíte completa no deploy.

Sem pageerror ou falha de rede impeditiva. Registros mantêm 404 da consulta intencional ao NFT inexistente e um 401 de /api/cart com escopo guest invalidado durante autenticação: requisição antiga negada, dado da nova sessão não contaminado. A filtragem aceita somente esse endpoint/status/escopo/fase, sem ocultar outros erros. Quantidades/badge e compra corretos confirmados após a troca. Primeiros smokes detectaram asserções do próprio script: total estático2.396 ignorava as duas alterações da prova (API retornou corretamente2.796), e a classificação inicial tratava o401 esperado como impeditivo. Corrigimos o script para comparar cotado/recibo e registrar a transição; nenhuma alteração de produto.

## Lighthouse público final

Fonte local limpa e commit publicado/auditado: **3242294e1d4632b68fb9250bc6dc8460a8e473d3**, deployment READY `dpl_3M242LpiWcgzrSnxU8YEwQuSxF8G`. [12 HTML/JSON e medianas](audits/lighthouse-public-final/README.md), [condições completas](audits/lighthouse-public-final/summary.json). Execução por `node scripts/audit.mjs`, sem reconstruir dist/rodar testes. As quatro medianas atingiram90/95/95/90; Accessibility/Best Practices/SEO100 em todos os relatórios.

| Página | Perfil | Performance | LCP ms | CLS | TBT ms | FCP ms | Speed Index ms |
| --- | --- | --- | --- | --- | --- | --- | --- |
| home | mobile | 91 | 2946 | 0.0486 | 35.5 | 2435 | 2435 |
| home | desktop | 100 | 646 | 0.0180 | 0 | 512 | 596 |
| detail | mobile | 92 | 2855 | 0.0000 | 8.5 | 2435 | 2435 |
| detail | desktop | 100 | 595 | 0.0180 | 0 | 512 | 518 |

Início mobile: scores **86/91/91**, detalhe **92/92/92**. Nenhuma execução descartada ou repetida para favorecer a pontuação. Na primeira medição do início, Speed Index4408ms/LCP3246ms/FCP2674ms foram maiores que nas seguintes (SI2431/2435, LCP2946/2945, FCP2431/2435); o score86 individual ficou abaixo da meta, enquanto a mediana atingiu91. O histórico local84/84 permanece válido nas condições antigas, sem reclassificá-lo como aprovado.

Evidência de diferença de entrega: relatórios mostram HTTP/1.1 no preview local e HTTP/2 na Vercel; o mesmo módulo MSW/browser-C13R53XS.js, recurso466167bytes, transferiu aproximadamente170657bytes local e106200bytes público na execução1. Compressão/transporte/CDN alteram o grafo usado na simulação. Atribuição de todos os pontos exclusivamente ao HTTP2 seria inferência; tempos reais/CPU e estado do CDN variam. LCP segue `.home-hero` no início e `.gallery-main > img` no detalhe; bootstrap/React/MSW e resposta REST ainda compõem o caminho crítico. Nenhuma funcionalidade removida, fixture/latência alterada ou versão especial de auditoria.

Ambiente: Windows10.0.26300 x64, i5-12400F/16GB, Node22.14, Lighthouse12.8.2, Playwright1.64/Chrome156. Mobile412×823/DPR1.75, RTT150ms/1638.4Kbps/CPU4; desktop1350×940/DPR1, RTT40ms/10240Kbps/CPU1; throttling simulado padrão. Chrome temporário novo/reset storage a cada execução, cenário padrão dos mocks. Sem smokes/testes concorrentes ou prewarming intencional do navegador. Estado do CDN compartilhado não foi isolado; os smokes anteriores também acessaram a origem e HTTPS respondeu x-vercel-cache HIT. Dados completos nos JSONs; não confundir cache frio do navegador com CDN frio.

## Pendências humanas e limitações

Nenhuma lacuna funcional conhecida nos critérios testados. Publicação/smokes/12 auditorias concluídos; commits posteriores desta etapa apenas consolidam documentos/relatórios, sem alterar runtime. Conferir READY/commit e assets do último commit documental após push. Leitor de tela NVDA/VoiceOver, alto contraste real, ampliação somente de texto e teclado/Safari iOS reais não foram certificados; verificar conforme roteiro abaixo. Chrome emulado/zoom automatizado não equivale a essas avaliações. Não declarar certificação WCAG integral. Persistência simulada é por navegador/origem; recibos não são compartilhados entre dispositivos. Referências de transação/exploração permanecem locais e fictícias. Fonte/lockfile/assets/licenças/exports preservados; checkout limpo anterior em quality-audit (dependências não alteradas nesta etapa).


## Última conferência manual

1. Abra a URL pública em desktop e telefone. Explore destaque, busca/filtros/ordenação, detalhe/edição e a barra com recorte; atualize e use voltar/avançar.
2. Adicione2unidades Emerald1/10, carrinho e finalizar. Login `ana@kurio.test` / `Kurio123!`; ou `bruno@kurio.test` com a mesma senha para isolamento. Cadastre Ethereum/MetaMask, endereço `0x1111111111111111111111111111111111111111`, Salvar e Retomar fluxo.
3. Selecione MetaMask para conectar, confira a cotação e confirme. Aguarde pedido confirmado, copie a rota do recibo, atualize e confira valores/badge0. Logout em Meu perfil/Minha conta deve voltar ao visitante; Bruno não recebe dados privados de Ana.
4. Para falhas, instale o helper de console documentado no README e use `await kurioScenario('commerce','expire')`, `await kurioScenario('checkout','timeout')` ou controles de /integration; receitas completas no README. Reset: POST `/api/__scenario/reset` e recarregar (bloco executável no README) restaura todo o cenário.
5. Com teclado, percorra controles/diálogos e confirme foco/Escape. Com NVDA/VoiceOver, espere labels, erros e confirmação anunciados. Em alto contraste/texto ampliado/zoom400%, espere controles e seleções identificáveis e todo conteúdo acessível por rolagem. No Safari iOS, confira teclado aberto e área segura inferior. Esses resultados humanos ficam pendentes até sua execução.
