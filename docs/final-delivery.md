# Fechamento da entrega e publicação

Layouts desktop/mobile aprovados pelo usuário, referência visual final d69af01. Nesta etapa não se alterou UI ou lógica dos fluxos. Publicação na Vercel autorizada; validação HTTPS e Lighthouse finais ainda em andamento neste registro.

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
| Lighthouse ≥90/95/95/90 | Rodada final prevista na URL HTTPS, 12 HTML/JSON e medianas. Histórico mobile 84 não atingiu 90. | Em andamento; não afirmar meta |
| Publicação/entrega | Repo conectado à Vercel, instalação lockfile/mocks/SPA preparados; smoke remoto a seguir. | Em andamento; não afirmar URL validada |

Typecheck executado uma vez, dentro de `npm run build`; build demo passou. Suíte completa executada uma vez sobre esse mesmo dist, com configuração temporária que troca somente o comando do webServer para preview, preservando três projetos/casos/reset. Primeira tentativa de inicialização do servidor teve cwd incorreto; nenhum teste havia iniciado; corrigido o cwd da configuração temporária.

Resultado completo: **221 passados, 1 diferença de baseline, 3 skips**, 8,9 minutos. A diferença de 1809 pixels fica apenas na barra aprovada: bbox x0–390/y718–798 numa imagem 390×6310. Nenhuma falha funcional e 26 outras baselines passaram. Só `home-chromium-mobile-win32.png` foi atualizada após revisar o diff; caso pertinente reexecutado sem update: **1/1 passou**. Sem repetir casos já aprovados ou toda a suíte. [HTML completo](audits/final-delivery/playwright-full/index.html), [HTML da baseline atualizada](audits/final-delivery/playwright-navbar-updated/index.html), [diff revisado](audits/final-delivery/navbar-diff.png). Não apresentar o resultado inicial como uma execução inteiramente verde.

Três skips preservados: Mercado desktop no projeto mobile (navegação coberta separadamente) e fluxo extra de 414 px nos projetos desktop/tablet (executado no mobile). Não há skip novo. Lint passou após declarar o global URL no runner de auditoria; sem alteração da aplicação.

## Preparação de deploy

Vercel CLI 63.1.0 autenticada pelo usuário; projeto existente `caioh-santana/kurio-nft`, ligado a `CaiohSantana/Kurio-NFT`, branch main, raiz e preset Vite. Ajustados npm ci, npm run build, dist e Node22.x. VITE_ENABLE_MOCKS=true explicitamente em Production e Preview. vercel.json preserva fallback SPA e worker no-cache.

Range Node anterior >=22.14 poderia sobrepor a versão escolhida na Vercel e selecionar 24.x. Restrito a >=22.14.0 <23 em package/lockfile (só metadado engines; nenhuma versão de dependência mudou), para alinhar ao Node22 validado. [Regra oficial de versões Vercel](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions). Arquivos de autenticação/OIDC e .vercel continuam fora do Git; não há segredo VITE ou backend real.

Runner aceita AUDIT_URL para auditar produção sem iniciar preview e AUDIT_DEPLOYED_COMMIT para registrar o commit confirmado nos metadados Vercel. delivery-smoke verifica UI em desktop/mobile, login e refresh, carrinho visitante, cadastro de carteira, compra confirmada pela API, recibo, logout, rotas/recursos e eventos/duplicatas/reconexão. Scripts não substituem a API por dados locais na interface.

## Pendências antes da conclusão

Publicar a versão validada, conferir READY/commit/HTTPS e executar o smoke direcionado nos dois perfis; depois 12 Lighthouse no cenário padrão. Registrar resultados reais, sem otimização indefinida. Avaliações humanas permanecem distintas dos checks automatizados. Fonte/lockfile/assets/licenças/exports preservados; checkout limpo anterior em quality-audit (dependências não alteradas nesta etapa).
