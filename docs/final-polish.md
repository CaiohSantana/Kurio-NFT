# Revisão localizada e carrossel do destaque

## Alterações e contratos

Exports originais Desktop/Carteiras, Login e Pagamento e Mobile/Login/Pagamento consultados. Capturas antes/depois usam os mesmos fixtures REST, CSS pixels e viewports390/414/768/1440, DPR1 e movimento reduzido. Exports com escalas/alturas diferentes não foram tratados como medidas equivalentes; comparação das regiões e geometria DOM foi separada da regressão automatizada.

- Field: label opcional ocupa a mesma linha dos demais labels, com opacity0 e nome acessível mantido. Eliminado padding-top28px; margens/line-height do formulário passam a determinar o alinhamento. Input, placeholder, required, valores e erros continuam com o mesmo contrato. Teste cobre persistência após refresh, erro129 caracteres, altura dos inputs e mesma linha desktop.
- Taxa estimada: text-align:center dentro do bloco do resumo, sem padding percentual. Valores dt/dd mantêm alinhamento anterior. Teste abre o resumo mobile e confere o centro real do texto por Range, além da regra CSS.
- Desktop/auth: grid separa a coluna340px dos campos/botões da largura interna do modal; somente o separador social ocupa todas as colunas. Os recuos originais dos controles passam a ser as colunas externas da grid; o separador chega ao interior da borda, sem alargar campos/botões nem reduzir os recuos quando há zoom. Mobile conserva as margens do frame. Nomes, foco e validação preservados. Mudança da linha é pequena e fica abaixo da tolerância pixelmatch, mas novo teste mede sua extensão independentemente.
- Hero: o contrato CatalogResponse agora inclui featured:Nft[], três registros curados em queryCatalog, independentes da busca/filtros/paginação. Nenhum novo request ou fixture dentro do componente. O retorno clona os registros atuais; REST/eventos continuam no mesmo estado, e descarte de eventos inclui versões de items e featured.
- CarouselIndicators extraído do RelatedNfts e usado nos dois locais. Botões24x24, estado aria-pressed/current, setas/Home/End e status acessível; cores forçadas mantêm anel da seleção. Centros/tamanhos dos círculos seguem SVGs40x8 e33x7; dois círculos passam a vazados para distinguir o ativo, desvio necessário para a interação solicitada.
- Pointer Events com touch-action:pan-y permitem swipe nos dois sentidos, preservam scroll vertical e impedem navegação acidental da arte após swipe. Fade180ms somente após interação; sem autoplay e sem biblioteca nova. reduced-motion remove a animação. Título/descrição do primeiro slide reservam a geometria dos textos subsequentes, sem altura fixa arbitrária por viewport.
- Primeiro slide mantém arte, texto, tipografia, dimensões e posições anteriores. CTA EXPLORAR agora abre seu NFT, como os demais slides; catálogo/contexto seguem em history.state. Promos/cabeçalho continuam com âncoras do catálogo. Cada outro slide tem nome/arte/CTA da API. Arte principal high priority no primeiro slide; demais imagens do hero só montadas ao selecionar, sem preload extra. Miniatura requerida usa450px; outras artes continuam no catálogo/promo original.

## Capturas e revisão

[Antes](evidence/final-polish/before/) / [Depois](evidence/final-polish/after/) / [Três slides em quatro larguras](evidence/final-polish/hero/) / [Diffs revisados](evidence/final-polish/diffs/). Os links de diretório no GitHub mostram arquivos PNG; amostras diretas abaixo.

| Região | Antes1440 | Depois1440 |
| --- | --- | --- |
| Carteiras | [PNG](evidence/final-polish/before/wallets-1440.png) | [PNG](evidence/final-polish/after/wallets-1440.png) |
| Checkout | [PNG](evidence/final-polish/before/checkout-1440.png) | [PNG](evidence/final-polish/after/checkout-1440.png) |
| Login | [PNG](evidence/final-polish/before/login-1440.png) | [PNG](evidence/final-polish/after/login-1440.png) |
| Cadastro | [PNG](evidence/final-polish/before/signup-1440.png) | [PNG](evidence/final-polish/after/signup-1440.png) |

Hero: [390/slide1](evidence/final-polish/hero/hero-390-1.png), [390/slide3](evidence/final-polish/hero/hero-390-3.png), [1440/slide2](evidence/final-polish/hero/hero-1440-2.png). [Resumo expandido390](evidence/final-polish/expanded-summary/390.png) mostra Taxa estimada no estado aberto. before-geometry.json e after-geometry.json registram reflow/foco em36 casos; capturas extras de detalhes/recibo/perfil não indicaram mudança de composição.

Rodada sem update:43/51 passaram; oito diffs intencionais (wallets3, checkout2 e home3) foram vistos antes de regerar. Login/cadastro/detalhe/perfil/carrinho/recibo passaram contra baselines anteriores. Update direcionado:9/9, oito PNGs alterados. Essa revisão com exports é distinta da regressão pixelmatch. Nenhuma baseline foi alterada para aceitar falha funcional.

## Verificação final e performance

Resultados finais e revisão fonte serão preenchidos após execução. Medidas anteriores (fonte1a5dc91): home mobile85/LCP3371/CLS0.0486/TBT117/FCP3057/SI3057; home desktop99; detalhe85/99. Leitor de tela, alto contraste real e text-only continuam pendentes. Nenhuma URL pública da aplicação verificada; publicação exige conta Vercel, conforme first-deploy.md.

Suíte consolidada sobre CSS final:213 passados/3 skips/0 falhas/0 flaky em6,1min, incluindo27 visuais sem update. HTML/contagem em audits/playwright-final-polish. Uma checagem posterior com touch real encontrou Enter na arte bloqueado após swipe; a supressão agora exige event.detail>0 (clique por ponteiro), preservando click de teclado. Após esse ajuste12/12 testes do carrossel passaram, incluindo Enter na arte após swipe; HTML/contagem em audits/playwright-final-hero. Typecheck/lint/build passaram. A primeira consolidação foi interrompida para recompilar a extensão final do separador; não usada como evidência de suíte completa. Testes iniciais também tiveram seletores/regex excessivamente exatos (asterisco de label e URL canonicalizada), corrigidos antes da validação final.

Desenvolvimento: três medições mobile do início, Performance85, LCP3381ms, CLS0.0486, TBT124ms, FCP/SI3065/3065ms. Fonte ainda não commitada (dirtyAtStart=true, HEAD visual f24e4f1): resultados em audits/lighthouse-hero-development; não substituem o conjunto final. Baseline anterior Performance85/LCP3371ms. Nenhum ajuste foi feito para escolher um run favorável. O conjunto final completo repetirá12 medições sobre commit limpo porque CSS, bootstrap e resposta do catálogo são compartilhados.

## Auditoria definitiva da fonte 47469f7

| Página/perfil | P antes → final | A/BP/SEO | LCP antes → final(ms) | CLS | TBT(ms) | FCP/SI(ms) |
| --- | --- | --- | --- | --- | --- | --- |
| home/mobile | 85 → 85 | 100/100/100 | 3371 → 3369 | 0.0486 | 102 | 3055/3055 |
| home/desktop | 99 → 99 | 100/100/100 | 759 → 888 | 0.0180 | 5 | 659/659 |
| detail/mobile | 85 → 85 | 100/100/100 | 3494 → 3501 | 0.0000 | 76 | 3041/3041 |
| detail/desktop | 99 → 99 | 100/100/100 | 788 → 795 | 0.0180 | 0 | 644/644 |

Fonte 47469f71ec6f01ad547ee49b2dac667651b0d573, dirtyAtStart=false. Três execuções por combinação;12 HTML/JSON, todas incluídas nas medianas. [Relatórios](audits/lighthouse-final-polish/README.md), [versões/condições/medianas](audits/lighthouse-final-polish/summary.json), [cenário conferido](audits/lighthouse-final-polish/scenario-check.json). Mesmos configSettings do conjunto anterior, API200/fontes/artes presentes em todas, zero runtimeError/runWarnings. Nenhuma execução de E2E/captura em paralelo aos15 audits desta etapa (3 desenvolvimento+12 finais).

Home mobile: Performance mantida85, LCP3371→3369ms e TBT117→103ms; diferenças pequenas não sustentam atribuição causal de ganho. Desktop: score99 mantido, LCP759→888ms; imagem passou a aguardar os dados da API do catálogo. Relação com essa espera é inferência coerente com o caminho implementado, não um perfil isolado de causalidade. JS/CSS compartilhados justificaram repetir detalhe, que mantém85/99. Bootstrap gzip96.03kB exibidos pelo Vite (95.73 anterior) e CSS11.52kB (11.16 anterior): incremento pequeno, sem dependências novas. Performance mobile<90 permanece pendente, conforme documentação anterior; esta etapa não autoriza refatoração ampla.

Ambiente/condições mantidos: Node22.14/npm11.2; Windows10.0.26300 x64/i5-12400F/16GB; Lighthouse12.8.2, Playwright1.64/Chromium156.0.8078.4. Preview4175, / e /nfts/emerald-042, build demo completo, mocks padrão, novo perfil/cache frio por run, reset/storage, simulate/CPU4x mobile e1x desktop, sem preaquecer ou alterar latências. Settings completos nos JSON.

Commits separados: f24e4f1 (visuais, incluindo5 baselines de carteiras/checkout) e47469f7 (carrossel e3 baselines do início). Commits posteriores entregam relatórios/documentação, sem modificar a fonte auditada. Nada de serviços/dependências/edição administrativa, autoplay ou pagamento real foi acrescentado.

Pendências: Performance mobile85/85 abaixo90; avaliações humanas de leitor de tela/alto contraste real/text-only; contexto/ícone original do Figma já documentados; publicação/validação de URL HTTPS dependem da conta Vercel. Não declarar desafio/publicação concluídos.

Reproduzir audits finais sem sobrescrever o conjunto anterior (PowerShell):

```powershell
$env:AUDIT_OUTPUT = 'docs/audits/lighthouse-final-polish'
npm run audit
Remove-Item Env:AUDIT_OUTPUT
```

Roteiro curto: abrir /, escolher os três indicadores/CTAs; usar setas/Home/End e swipe mobile; ativar movimento reduzido. Logar Ana/Kurio123!, abrir Carteiras, salvar referência secundária/refresh e testar erro longo. Carrinho com NFT, checkout, expandir Seus NFTs no mobile e conferir taxa centralizada. Abrir /login e /signup diretamente e testar Tab/Escape/erro, sem mudança de campos/botões.
