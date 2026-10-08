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

## Resultados finais e instalação limpa

Typecheck, lint sem warnings e build demo passaram. Suíte completa: **183 passaram,3 skips intencionais,4,6min**, sem retries/update;156 comportamentais+27 visuais. Relatório HTML entregue em audits/playwright/index.html. Roteiro direcionado após corrigir foco/conta mobile:12/12 em35,4s.

Smoke do preview:11 rotas com entrada direta+refresh, incluindo recibo realmente confirmado pela API e578px no desktop; worker, WOFF2, WebP e PNG local com200/tipos corretos. /integration confirmou REST, evento pelo socket.io-client e recurso na versão2. Evidência em audits/preview-smoke.json.

Ainda em execução:12 relatórios Lighthouse finais e instalação em checkout temporário limpo por commit. Metas não são declaradas satisfeitas antecipadamente.

## Reproduzir e publicar

README documenta npm ci, instalação do Chromium, comandos, credenciais, cenários/reset e recuperação de falhas. `npm run audit` serve o build em4175 e gera12 HTML+12 JSON e medianas; não rodar E2E simultaneamente. Relatórios entregues em docs/audits, baselines em tests/*-snapshots, HTML Playwright preservado; traces de falhas permanecem configurados.

Publicação pendente: enviar commits ao origin da conta, importar repositório na Vercel com npm ci/build/dist, Node compatível e VITE_ENABLE_MOCKS=true; verificar HTTPS, rotas diretas/refresh, worker/fontes/artes, sessão e fluxo REST/Socket.IO/pedido. Registrar URL e commit; roteiro exato em first-deploy.md. Preview local e repositório configurado não provam publicação.
