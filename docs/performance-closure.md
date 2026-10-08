# Fechamento de performance e preparação da publicação

## Diagnóstico antes da alteração

Fonte anterior b6fba35; relatórios preservados em [lighthouse](audits/lighthouse/README.md). Todas as três execuções entram na mediana. Valores abaixo em milissegundos, salvo CLS.

| Página/perfil | Performance | LCP | CLS | TBT | FCP | Speed Index |
| --- | --- | --- | --- | --- | --- | --- |
| Início mobile | 86 | 3332 | 0,0486 | 65 | 3025 | 3025 |
| Detalhe mobile | 83 | 3796 | 0 | 60 | 3020 | 3020 |
| Início desktop | 100 | 732 | 0,0180 | 0 | 625 | 625 |
| Detalhe desktop | 99 | 832 | 0,0180 | 0 | 635 | 635 |

Evidências: home-mobile-2 identifica section.home-hero como LCP; 2875ms/86% em Render Delay. detail-mobile-2 identifica gallery-main img (Emerald Ape): 2954ms/78% em Load Delay, 133ms/3% em Load Time e 259ms/7% em Render Delay. Essas fases vêm da tabela simulada largest-contentful-paint-element. O insight lcp-breakdown usa a trace observada, com tempos diferentes; não misturar as duas escalas.

Unused-javascript estima 108–109KiB: MSW/browser cerca de68KiB e bootstrap cerca de41KiB, economia estimada600ms. Bootstrap concentra tarefas de179/77/57/56ms no início e170/77/60/55ms no detalhe. TBT mediano baixo; não há evidência para uma reescrita de renderização. CSS inicial cerca de11KiB comprimidos, estimativa bloqueante6ms no início/0 no detalhe. Transferência da arte representa apenas3% do LCP do detalhe; nenhuma nova perda de qualidade foi introduzida.

Código confirma: worker.start precede importação do app para que engine.io capture o WebSocket interceptado; SessionProvider aguardava REST/sessão antes de montar o detalhe e iniciar sua consulta. Hipótese testada: paralelizar as consultas públicas/sessão no matching de rotas diminui essa cascata. O tamanho de bibliotecas é evidência; atribuir todo o atraso ao hashing de senhas seria hipótese sem perfil isolado e não justificou reduzir a segurança.

## Alteração localizada

Router recebe o mesmo QueryClient do provider. beforeLoad inicia prefetchQuery de sessão e detalhe sem bloquear render. Componentes observam exatamente as mesmas chaves/options: Query deduplica e Axios usa AbortSignal. Não há novo estado remoto, dataset no cliente, atalho de API nem efeito direto no cache para simular eventos. retryOnMount=false impede que uma falha one-shot consumida pelo prefetch desapareça por retry implícito ao montar; Tentar novamente continua explícito. Recuperação de sessão, guards, cache privado, subscriptions, idempotência e versões não foram relaxados.

Artes WebP lossless450/900 e originais, fonte WOFF2 local/preload, prioridade alta da imagem principal, lazy abaixo da dobra e dimensões reservadas foram conferidos e preservados. Rotas privadas e /integration já eram lazy. CSS continua limitado a src, sem captar classes dos relatórios. Nenhuma baseline atualizada nesta etapa. Em cores forçadas, inspeção computada confirmou que a edição selecionada perdia seu anel (box-shadow none; borda idêntica às demais). Correção restrita a forced-colors: outline Highlight na edição/miniatura selecionada e borda CanvasText na trilha de preço. O visual normal permanece idêntico; teste de seleção e foco foi acrescentado.

Duas rodadas exploratórias (uma medição por página mobile): prefetch86/85, LCP3368/3495ms; prefetch+compressão85/85, LCP3320/3508ms. Compressão de preview não trouxe ganho consistente, foi retirada com suas dependências. Não houve seleção de execuções favoráveis. Resultados exploratórios não substituem o conjunto final de12. Uma rodada seguinte interrompida confirmou início84/85/85 com TBT92/103/140ms, sem ganho de LCP: removido prefetch do catálogo, mantido apenas o do detalhe. Os relatórios dessa investigação não foram aproveitados no conjunto final; não se atribui a variação inteira ao prefetch sem experimento de CPU isolado.

## Verificações finais

Resultados Lighthouse e commit fonte serão acrescentados após a execução. Typecheck, lint e build passaram. Suíte completa:186 passados/3 skips/0 falhas em5,6min; HTML/contagem em audits/playwright-performance-full. Após o ajuste restrito a cores forçadas:36/36 testes (9 de acessibilidade e27 visuais), sem update/retry. HTML/contagem em audits/playwright-performance-accessibility. Os três skips permanecem justificados em quality-audit.md. Smoke do preview:11 rotas por acesso direto+refresh, quatro recursos locais com200/tipos corretos e recibo confirmado pela API: [performance-preview.json](audits/performance-preview.json). Zoom nativo400% executado por chrome.tabs.setZoom sem reload, nove telas na janela1440x1657 (360x414CSSpx): sem overflow horizontal; login/cadastro/recibo com diálogos dentro da altura. [Geometria/foco](audits/accessibility/native-zoom-400.json). Trata-se de inspeção automatizada no Chromium, não avaliação humana com tecnologia assistiva. Reflow320CSSpx e zoom200% permanecem evidências da etapa anterior. Cores forçadas Chromium:36 capturas/inspeções nas nove telas em390/414/768/1440; detalhes/checkout inspecionados visualmente, campos e seleção identificáveis. [Geometria/foco/emulação](audits/accessibility/forced-colors.json). Isso não marca como executado o modo real do Windows.

## Verificações que exigem avaliação humana

- NVDA/Firefox ou NVDA/Chrome: percorrer busca/filtros, login com erro, carteira, checkout com cotação alterada e recibo. Esperado: nomes/erros associados, alertas anunciados uma vez, foco preso no diálogo e devolvido ao fechar; sem dados privados da outra conta. Não executado com leitor de tela.
- Alto contraste real do Windows: ativar tema de contraste, percorrer Tab/Shift+Tab/Enter/Escape, abrir filtros/galeria/carteiras. Esperado: foco, campos, radio/checkbox e seleção identificáveis. Emulação Chromium não certifica a experiência do sistema.
- Firefox, apenas texto200%: zoom apenas texto e preencher login/perfil/checkout. Esperado: nenhum campo/CTA perdido, erro legível e scroll interno acessível. Não executado; zoom de página não equivale a ampliar só texto.
- Chrome/Edge, janela1280px e zoom400%: nove telas, diálogos, teclado e compra. Esperado: reflow320CSSpx, sem scroll horizontal de página, campos/CTA acessíveis; conferir foco/anúncios subjetivos mesmo após a geometria automatizada.

Publicação não verificada: GitHub permite push; Vercel não tem token/login/projeto vinculado neste ambiente. Importação pela conta do usuário e smoke HTTPS ainda necessários: [first-deploy.md](first-deploy.md). Repositório público e preview local não são URL da aplicação publicada.

## Conjunto final de12 medições

Fonte auditada: **1a5dc91ee65271fee6803a0414ffb004404bc52a**, dirtyAtStart=false. Commits posteriores de entrega acrescentam documentação/relatórios, sem mudar a aplicação. Três execuções por combinação, todas incluídas nas medianas; nenhuma nova rodada para escolher um resultado melhor.

| Página/perfil | Performance antes → depois | LCP antes → depois (ms) | CLS | TBT(ms) | FCP(ms) | Speed Index(ms) |
| --- | --- | --- | --- | --- | --- | --- |
| home/mobile | 86 → 85 | 3332 → 3371 | 0.0486 | 117 | 3057 | 3057 |
| home/desktop | 100 → 99 | 732 → 759 | 0.0180 | 6 | 647 | 647 |
| detail/mobile | 83 → 85 | 3796 → 3494 | 0.0000 | 74 | 3035 | 3035 |
| detail/desktop | 99 → 99 | 832 → 788 | 0.0180 | 0 | 643 | 643 |

Accessibility/Best Practices/SEO:100 em todas as12. Performance mobile ainda abaixo de90; QA-03 permanece parcial, conforme permissão do enunciado para justificar limitações. O detalhe melhora a descoberta da arte ao consultar sessão/NFT em paralelo; início não mostrou melhoria consistente. Variação de TBT entre rodadas não permite atribuir toda diferença a um componente. Caminho inicial MSW/React/Router permanece dominante; não se justifica remover mocks, protócolo, fonte, imagens ou criar tela estática de auditoria.

[12 HTML/12 JSON/tabela](audits/lighthouse-performance/README.md), [medianas/configurações/versões](audits/lighthouse-performance/summary.json), [cenário conferido nas requisições](audits/lighthouse-performance/scenario-check.json). Zero runtimeError/runWarnings. ConfigSettings iguais ao conjunto anterior: True. Fontes/artes/API200 presentes nas12; /api/session e /api/nfts usam o cenário padrão. /integration e testes verificam protocolo/funcionalidades; o relatório Lighthouse por si só não prova o fluxo inteiro. Explorações preservadas em audits/lighthouse-investigations, fora das medianas finais.

Ambiente: Windows10.0.26300 x64, i5-12400F/16GB, Node22.14.0/npm11.2.0, Lighthouse12.8.2, Playwright1.64.0/Chrome156.0.8078.4. Preview4175; / e /nfts/emerald-042; build demo completo. Chrome temporário novo por run, reset/storage/cache frio, sem preaquecer. Simulate: mobile412x823/DPR1.75/RTT150ms/1638.4Kbps/CPU4x; desktop1350x940/DPR1/RTT40ms/10240Kbps/CPU1x. Headless/disable-gpu/no-first-run; E2E/capturas encerrados antes do conjunto final. Nenhuma latência ou funcionalidade alterada exclusivamente para audit.

## Pendências de entrega

Funcionais: sem nova lacuna nesta etapa, dentro do alcance dos testes locais; sessão/carrinho/pedidos/eventos preservados. Visuais: contexto/ícone original pendentes documentados em design-reference, sem reformulação. Acessibilidade: leitor de tela, alto contraste real Windows e text-only200% ainda exigem avaliação humana; zoom400% automatizado não certifica toda a experiência. Lighthouse: duas metas mobile abaixo90, demais metas cumpridas. Publicação: autenticação/importação/deploy Vercel e smoke da URL HTTPS pendentes. Não declarar desafio completo.

Diagnósticos finais (execução2 mobile, fase simulada): início Render Delay2884ms/86%; detalhe Load Delay2411ms/69%, transferência205ms/6%, Render Delay417ms/12%. Descoberta tardia caiu de2954 para2411ms; a transferência varia entre execuções. JS não utilizado estimado110257/109757bytes, concentrado em MSW/browser e bootstrap. O LCP mediano do detalhe melhora302ms (~8%); início piora39ms e TBT mediano de65 para117ms. Não atribuir essa variação a uma causa isolada sem perfil controlado; meta mobile permanece pendente. Desktop99/99 continua acima90. Nenhuma imagem/feature/latência retirada para obter pontuação.

Push efetivamente executado para origin/main; remoto a33fd5c confirmado por git ls-remote. Fonte de aplicação auditada1a5dc91; git diff entre essa fonte e entrega não altera src/public/lockfile/configuração/testes. Nenhum deploy Vercel nem URL da aplicação foi verificado. Os passos de conta/build/ambiente/smoke estão em first-deploy.md.
