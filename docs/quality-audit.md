# Auditoria de qualidade e preparação da entrega

Fonte: enunciado original §§8–12 e SPEC UI-03/QA-01/02/03/EL-01/DE-01/03. Esta etapa preserva contratos, fluxos, assets originais e identidade visual; não publica a aplicação. Resultados finais serão preenchidos após as execuções, sem extrapolar o score Lighthouse para certificação WCAG.

## Skips intencionais

| Caso em final-review.spec.ts | Skip | Motivo / cobertura efetiva |
| --- | --- | --- |
| Mercado com posições intermediárias de scroll | chromium-mobile | Link Mercado pertence ao cabeçalho desktop. Executa em1440/768. navigation-cart.spec.ts testa a âncora do hero/promo nos três projetos, DOM/URL/histórico/reduced-motion; nesta etapa passou a observar posições intermediárias e mesmo documento também no mobile. |
| Catálogo até recibo em414px | chromium-desktop | Roteiro adicional específico do export mobile, executado uma vez no projeto mobile. Catálogo/commerce/checkout cobrem os mesmos fluxos em1440. |
| Mesmo roteiro414px | chromium-tablet | Evita repetir exatamente o mesmo viewport414 no projeto768. Catálogo/commerce/checkout cobrem768; final-review mantém o caso414. |

Nenhum skip removido para alterar contagem. São três combinações de projeto, não três comportamentos omitidos.

## Acessibilidade: correções e alcance

- Campo de quantidade desktop tinha label com display:none. Nome explícito `Qtd.` preserva o rótulo e torna o spinbutton identificável por tecnologia assistiva.
- Favorito junto aos CTAs mobile tinha alvo de cerca de12px. Agora tem largura mínima32px e altura40/48px, sem mover as colunas da página.
- Zoom ao vivo revelou modal de cadastro fora da janela: em384×512CSSpx, ia de y160 até y816. O teste anterior com refresh recriava a página mobile e mascarava a falha. Limites min/max-height agora seguem a altura disponível; draft e CTA são testados sem reload. A geometria em viewports normais permanece igual.
- Dialog com um único botão permitia Tab sair do conteúdo. Modal nativo mantém showModal/Escape/restauração e agora circula Tab/Shift+Tab entre primeiro/último controles habilitados/visíveis. Teste novo observa foco real, alvo e seleção; testes anteriores cobrem os demais diálogos/drawers.
- Bordas de inputs/selects/textarea passaram de#55321F para#91623F: contraste3,68 contra#140D0A,3,36 contra#241612 e3,08 contra#2F1D15. Geometria não mudou. Bordas de separação/card/modal e bordas de botões que já têm texto/ícone identificável continuam decorativas. Conforme [WCAG1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast/), é o indicador necessário para identificar o controle que precisa de3:1, não toda linha decorativa.
- Filtros marcados têm check; edição selecionada ganha peso/borda interna; página atual ganha sublinhado/peso. Assim seleção não depende apenas de cor. Corações usam preenchimento; radios/checkboxes nativos têm marca; tabs têm sublinhado. Disabled é distinto e não usa apenas cor como indicação de indisponibilidade.
- Textos mantêm a paleta: foreground/ink17,10; secondary/surface8,68; placeholder/ink6,72; ink/primary6,85; accent/surface7,72. Foco#E89B55 tem outline/ring; campos inválidos preservam aria-invalid/describedby; mutations/realtime preservam status/alert. Lighthouse verifica contraste textual de início/detalhe; não substitui revisão das outras telas/estados.
- Skeleton do detalhe agora reserva galeria, informação e descrição, mantendo shimmer/reduced-motion. Nas rodadas exploratórias, CLS mobile passou de0,292 para0; não se ocultou conteúdo para pontuar.

Verificação executada:36 capturas de nove telas em390/414/768/1440, DPR1, mais smoke de reflow até320CSSpx; zero overflow nos registros. Zoom **nativo** Chrome via extensão local de teste e chrome.tabs.setZoom(2):18 verificações, nove telas partindo de768/1440, CSS384/720 e DPR2; zero overflow. Extensão só habilitada pelo script de revisão, não integra aplicação nem Lighthouse. Capturas normais/reflow e zoom são evidências automatizadas distintas de validação humana com tecnologia assistiva. Arquivos de medidas entregues em accessibility.

Não executado manualmente: leitor de tela (NVDA/VoiceOver), alto contraste/cores forçadas do sistema, ampliação apenas de texto e zoom nativo interativo400%. Não marcar certificação WCAG integral concluída. O teste200% cobre reflow, sem afirmar que pinch-zoom mobile equivale a ele.

## Revisão visual das alterações

Capturas normais de início/detalhe/carrinho/pagamento e confirmação foram revistas nas larguras usadas anteriormente. Mesma composição; mudanças restritas a bordas, indicadores, alvo favorito e reamostragem das artes. Antes de aceitar baselines, rodada sem update identificou14 diffs (20–1806pixels) nessas áreas. Diffs de detalhe e recibo foram inspecionados: nada de deslocamento de colunas, imagem substituída ou novo bloco. Recibo agora inclui refresh antes da captura, exercitando entrada direta e foco visível no fechamento; a pequena diferença do anel é estado acessível real.14 baselines atualizadas após revisão;13 permaneceram intactas. Rodada de geração:27/27 em55,4s; isso não equivale à regressão posterior sem update nem a equivalência integral ao Figma.

## Performance: investigação e decisões

Lighthouse12.8.2 é compatível com Node22.14;13.5 exige>=22.19. Configuração/runner versionado, Chrome instalado pelo Playwright, versões completas no lockfile. Consultadas [documentação Node/CLI](https://github.com/GoogleChrome/lighthouse/blob/main/docs/readme.md) e [perfis de emulação](https://github.com/GoogleChrome/lighthouse/blob/main/docs/emulation.md).

Rodada inicial: início mobile86/LCP3672ms/CLS0,049; detalhe mobile74/LCP3535ms/CLS0,292; desktop97/96. Não são as12 medições finais. Achados: PNGs1,9–2,1MB; descoberta tardia da imagem; favicon404; robots.txt retornava fallback HTML; quantidade sem nome e alvo favorito pequeno.

Correções aplicam à entrega inteira: WebP lossless original+450/900px com srcset e origem/checksums; quatro PNGs/exports preservados; pixels da versão WebP original comparados byte a byte após decodificação. Fonte e fundo do hero mobile preloaded; metadados de produto, favicon e robots reais. Rotas privadas/prova usam lazyRouteComponent, carregadas quando acessadas. Bootstrap baixa módulos em paralelo por modulepreload, mas avalia app/socket somente após MSW.start. Não muda delay dos mocks, não desativa REST/realtime nem reduz funcionalidades. CSS compartilhado de conta foi movido para a base, e recibo importa seus estilos também por acesso direto.

Metas mobile de performance ainda não satisfeitas nas explorações após os ajustes. Relatórios apontam o caminho crítico de módulos React/Router/MSW e recuperação de sessão antes do conteúdo, seguido de consulta do detalhe; CPU4×/rede móvel simuladas. Mantida a arquitetura/funcionalidade; não criada uma versão estática exclusiva da auditoria. Avaliar o conjunto final antes de afirmar o status das metas.

A instalação limpa revelou CSS extra originado das classes dos relatórios HTML. A descoberta do Tailwind agora tem base explícita em src, conforme a [documentação oficial](https://tailwindcss.com/docs/detecting-classes-in-source-files). Assim docs/relatórios não alteram o bundle auditado; não remove classes da UI nem cria CSS especial para auditoria.

## Resultados finais e instalação limpa

Fonte final auditada/testada: **b6fba354f90d3136e0b00fabfa687573a93837b4**. Os commits posteriores desta etapa acrescentam documentação e relatórios; não alteram aplicação, lockfile, testes, assets ou configuração de build. Lighthouse registrou dirtyAtStart=false no checkout desse commit.

Checkout temporário `.tmp/quality-delivery`, criado pelo Git, independente dos node_modules do diretório principal. Executados npm ci, npx playwright install chromium, typecheck, lint sem warnings, build demo e **189 casos E2E:186 passaram,3 skips,0 falhas,0 flaky,275727ms (4,6min)**, sem retries/update. São159 comportamentais e27 visuais. [HTML final](audits/playwright-clean/index.html), [contagem/duração](audits/playwright-clean/summary.json). A primeira consolidação183/3 foi preservada em audits/playwright/index.html; depois da correção de descoberta do Tailwind30/30 passaram; após o ajuste de zoom21/21 passaram e o checkout final executou a suíte inteira novamente.

Smoke no **preview do checkout limpo**, porta4177:11 rotas com entrada direta+refresh, incluindo recibo criado pela interface e confirmado pela API, largura578px por acesso direto; worker, WOFF2, WebP e PNG local com200/tipos corretos. /integration confirmou REST, evento pelo socket.io-client e recurso na versão2. [Evidência](audits/clean-preview.json). Nenhum backend/serviço privado, arquivo de usuário ou configuração secreta foi necessário. `.env.demo` e todos os recursos vêm do Git; Chromium é instalado pelo comando documentado. npm ci reportou zero vulnerabilidades; relatório adicional em audits/dependency-audit.json. A geração automática do worker MSW mantém o mesmo conteúdo normalizado pelo Git.

JS/CSS do build limpo e do diretório principal têm **26 arquivos com hashes idênticos**, registrados em audits/build-comparison.json. Diferença de newline do HTML pelo checkout Windows não altera execução. Não se depende do HTML dos relatórios para produzir CSS. Verificação em outros sistemas operacionais não executada; baselines entregues são Chromium/Windows.

### Lighthouse:12 medições finais

| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP mediano(ms) | CLS mediano | TBT mediano(ms) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Início | mobile | **86** |100|100|100|3332|0,0486|65|
| Início | desktop |100|100|100|100|732|0,0180|0|
| Detalhe Emerald | mobile | **83** |100|100|100|3796|0|60|
| Detalhe Emerald | desktop |99|100|100|100|832|0,0180|0|

Todas as categorias atingiram as metas, **exceto Performance mobile nas duas páginas**. QA-03 continua parcial. [12 HTML/12 JSON e tabela](audits/lighthouse/README.md), [configurações/versões/resultados individuais](audits/lighthouse/summary.json). Nenhum relatório final contém runtimeError ou runWarnings. Os relatórios são entregáveis versionados, fora das pastas ignoradas de artefatos temporários.

Ambiente: Windows_NT10.0.26300 x64, Intel Core i5-12400F,16GB, Node22.14.0/npm11.2.0, Playwright1.64.0, Chrome for Testing156.0.8078.4, Lighthouse12.8.2; sharp0.35.5. URLs http://127.0.0.1:4175/ e /nfts/emerald-042. Build demo completo, preview otimizado, cenário padrão; nenhuma execução de E2E/capturas em paralelo às medições finais. Chrome temporário novo por medição, reset de storage e cache frio padrão Lighthouse; sem preaquecer ou alterar mocks. Throttling **simulate**: mobile412×823/DPR1,75, RTT150ms/1638,4Kbps/CPU4×; desktop1350×940/DPR1, RTT40ms/10240Kbps/CPU1×. Flags de lançamento headless/disable-gpu/no-first-run; detalhes completos nos JSON.

Resultados abaixo da meta são sustentados pelos relatórios finais: home-mobile-2 atribui86% do LCP a render delay (2875ms), com FCP3025ms. detail-mobile-2 atribui78% a descoberta tardia da imagem (2954ms), antes de132,7ms de transferência; FCP3020ms. Ambos apontam cerca de108–109KiB de JS não utilizado nesse primeiro carregamento. O bootstrap aguarda MSW, depois inicialização do app/sessão, e o detalhe consulta o NFT; esse caminho crítico permanece sob a simulação de rede/CPU móvel. Fontes/preloads, divisão por rota, WebP e skeleton corrigiram causas comprovadas, incluindo CLS do detalhe de0,292 para0. Não foi reduzida a latência padrão, escondida funcionalidade ou criado caminho de auditoria especial para atingir90. A pendência é otimizar esse caminho preservando API/sessão/realtime e repetir as combinações afetadas após autorização para a próxima etapa.

## Status e pendências exatas

| Critério SPEC | Evidência atual | Status |
| --- | --- | --- |
| ST/EL-01 uso efetivo da stack | Código, build,189 E2E e runner Lighthouse real | Verificado localmente; não equivale à entrega publicada |
| UI-03 acessibilidade | Contraste/labels/alvos/foco corrigidos; reduced-motion; reflow320 e zoom nativo200% sem reload em18 casos; testes de erro/feedback/teclado | Parcial: leitores de tela/alto contraste/text-only/zoom interativo400% não executados |
| QA-01/02 testes/isolamento/baselines |186 passados,3 skips justificados,27 baselines; REST/MSW e socket.io-client efetivos | Verificado no Chromium/Windows |
| QA-03 auditoria/metas |12 HTML/JSON, medianas/ambiente; demais categorias100 | Parcial: Performance mobile86/83 precisa de90 |
| DE-01 checkout limpo | npm ci/checks/E2E/preview/refresh/assets sem serviços privados | Verificado na fonte b6fba35 |
| DE-03 documentação/evidências | README/ARCHITECTURE, contratos/cenários/reset/credenciais, relatórios e baselines no Git | Verificado nesta etapa |
| DE-02 publicação | Configuração/roteiro preparados | Pendente: push/importação/deploy na conta, URL HTTPS verificada e smoke do commit publicado |

Funcional: nenhum novo comportamento obrigatório ficou sem implementação nesta revisão; manter o alcance dos testes registrado, sem afirmar produção. Visual: preservar pendências de contexto/medidas do Figma e SVG original da confirmação em design-reference.md; sem nova reformulação. Acessibilidade: verificações manuais acima, sem certificação WCAG integral. Lighthouse: duas metas de Performance mobile abaixo. Publicação: nenhuma URL pública verificada, nem push/deploy executado.

## Reproduzir e publicar

README documenta npm ci, instalação do Chromium, comandos, credenciais, cenários/reset e recuperação de falhas. `npm run audit` serve o build em4175 e gera12 HTML+12 JSON e medianas; não rodar E2E simultaneamente. Relatórios entregues em docs/audits, baselines em tests/*-snapshots, HTML Playwright preservado; traces de falhas permanecem configurados.

Para repetir o smoke limpo, iniciar o preview no terminal do checkout:

```powershell
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4177 --strictPort
```

Em outro terminal, no mesmo checkout:

```powershell
$env:REVIEW_URL = 'http://127.0.0.1:4177'
node scripts/delivery-smoke.mjs
$env:REVIEW_NATIVE_ZOOM = 'true'
node scripts/visual-review.mjs native-zoom
```

O smoke e as capturas usam contextos de navegador próprios e cenários da API; não editar localStorage/React. Não fazer build enquanto o script captura o preview. Zoom automatizado usa a [API nativa de tabs do Chrome](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-setZoom), conserva o documento sem reload e verifica limites de diálogos. A etapa registrou uma captura interrompida por fechamento do navegador e uma tentativa de teste com porta ocupada; ambas foram repetidas isoladamente, sem aceitar resultado incompleto. A evidência final de zoom tem18 verificações bem-sucedidas.

Publicação pendente: enviar commits ao origin da conta, importar repositório na Vercel com npm ci/build/dist, Node compatível e VITE_ENABLE_MOCKS=true; verificar HTTPS, rotas diretas/refresh, worker/fontes/artes, sessão e fluxo REST/Socket.IO/pedido. Registrar URL e commit; roteiro exato em first-deploy.md. Preview local e repositório configurado não provam publicação.
