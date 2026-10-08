# Revisão visual — pagamento, confirmação e conta

2026-10-08. Fonte: exports originais de Desktop/Mobile em `Frontend Challenge`, quatro PNGs locais do manifesto e contextos já registrados em design-reference.md. Uma consulta adicional ao frame11:2862 foi recusada pelo limite Starter; não houve edição do Figma nem consultas repetidas após a falha.

## Método e capturas

`node scripts/visual-review.mjs after` reproduz a revisão no preview4175. Cada largura usa contexto isolado, reset dos três grupos de mocks, autenticação/API, carteiras cadastradas e três NFTs reais da fixture: Emerald×2, Violet×6, Ivory×9, edição1/50. Subtotal/desconto/taxa/total vêm dos handlers, não do export. UsuárioAna, principalEthereum/MetaMask, secundáriaPolygon/Coinbase; sem cupom. Fonte/imagens aguardadas antes da captura.

Larguras390/414/768/1440, deviceScaleFactor1 e reduced-motion. Em1440, viewport1440×1657 coincide com pagamento/confirmação originais; em414, viewport414×896 coincide com mobile. PNGs fullPage podem ter alturas maiores por conteúdo obrigatório; nunca foram esticados para coincidir. Para comparar, usar os pixels originais e retângulos DOM de measurements.json, não miniaturas redimensionadas pelo chat. Perfil/carteiras têm export1440×1080; a área visível inicial pode ser comparada na mesma escala, mas não alegamos igualdade da altura total nem do estado vazio com os registros cadastrados.

Capturas antes/depois em `artifacts/visual-review/{before,after}` (ignoradas no Git, reproduzíveis pelo script para o estado atual). Cada diretório contém início, detalhe, carrinho, perfil, carteiras, checkout e recibo nas quatro larguras. Os pares checkout anteriores estão sem conexão/aceite; `checkout-ready` adicional documenta o estado posterior conectado e aceito. Recibos são confirmed de verdade na API simulada. Data/referência são dinâmicas; não copiar exemplos do PNG.

| Captura1440 | Antes | Depois |
| --- | --- | --- |
| Pagamento | [antes](../artifacts/visual-review/before/checkout-1440.png) | [depois](../artifacts/visual-review/after/checkout-1440.png) |
| Confirmação | [antes](../artifacts/visual-review/before/receipt-1440.png) | [depois](../artifacts/visual-review/after/receipt-1440.png) |
| Perfil | [antes](../artifacts/visual-review/before/profile-1440.png) | [depois](../artifacts/visual-review/after/profile-1440.png) |
| Carteiras | [antes](../artifacts/visual-review/before/wallets-1440.png) | [depois](../artifacts/visual-review/after/wallets-1440.png) |

Mobile414: [pagamento antes](../artifacts/visual-review/before/checkout-414.png), [depois](../artifacts/visual-review/after/checkout-414.png). Todos os arquivos mantêm sua escala original; o visualizador pode redimensionar a prévia.

| Tela desktop | Antes (DOM,1440) | Depois revisado | Referência / ressalva |
| --- | --- | --- | --- |
| Pagamento | Formulário y444; resumo389,34; bloco de carteiras no topo. | Formulário y147, largura763; gap32; resumo405 em x915. | Colunas inferidas do PNG em escala1; não medidas novas confirmadas pelo contexto. |
| Confirmação | Cartão578×1152,5, avisos/versões e metadados empilhados. | Modal578×821 em x431/y≈166 no cenário de três itens, faixa horizontal e tabela. |578×821 consta na referência; conteúdo maior pode crescer/rolar. |
| Perfil | Save intermediário, seletor nativo exposto, rodapé e sidebar sem ícones. | AvatarAlterar/Remover, ícones/foco, senha com visibilidade, ações ao final, sem rodapé. | Duas ações de salvar preservam endpoints/validações independentes. |
| Carteiras | Título duplicado, introdução fora da composição e rodapé extra. | Hierarquia principal/secundária, descrição abaixo do título, sidebar ativa e formulários alinhados. | Capturas com registros apresentam campos preenchidos, diferindo do vazio no export. |

Na captura final das sete telas×quatro larguras, nenhum overflow horizontal foi observado. Revisão manual também conferiu arte, enquadramento, paleta, Roboto Mono, separadores, header/activeMercado, rodapé e posições dos controles de início/detalhe/carrinho. A comparação manual não é um teste de igualdade automatizada com o Figma.

## Correções e decisões

- Checkout: breadcrumb, duas colunas, sequência de campos por linha, lista com token/quantidade/subtotal, cupom, taxa/total/provedores e CTA. Cartões registrados saíram do topo desktop; troca/edição/desconexão ficam em diálogo contextual. Provider deriva de carteira cadastrada; clicar opção sem registro abre seleção/edição, sem afirmar conexão.
- Mobile: Reserva/Principal e provedores usam superfícies/raios do export. Endereço abreviado mantém valor integral no cadastro/diálogo. Revisão dos NFTs e formulário são expansíveis e disponíveis integralmente. Confirmação explícita de cotação, conexão e falhas continuam funcionais.
- Confirmação: diálogo nativo com foco/Escape/fechamento, fundo estável para acesso direto/refresh, envelope, título da referência, faixa transação/data/total/carteira, tabela e resultado/CTA. Modal aparece apenas quando GETpedido retorna dados; sucesso continua exclusivo de confirmed.
- Removidos versões/IDinterno, bannerSocket.IO, mensagens de API/cache, rodapé de diagnóstico e textos genéricos de demonstração. Conta saiu do rodapé para menu contextual; logout mantém a mesma mutation/cleanup. Feedback de preço/estoque, expiração, recusa e falha permanece.
- Diagnóstico de order.updated fica em console.debug apenas no modo demo, após filtros de scope/user/version do cliente real; não inclui token. E2E observa esse evento e o GET posterior, preservando a prova do transporte sem texto técnico na UI.
- “Ver transação” abre explorador local identificado como ambiente simulado, com referência/rede/total/destino do snapshot. Não abre Etherscan nem sugere referência existente numa blockchain real. Identificação da simulação fica nessa ferramenta e na documentação, não em banners normais.

## Desvios necessários e pendências

- Envelope reconstruído como SVG local; original isolado não recuperado. Proveniência em public/assets/icons/README.md. Não usamos screenshot recortado na interface. Quatro artes, exports, fontes/licenças e lockfile preservados.
- API define identidades, rede, carteira, quantidades, valores e datas. Badge soma quantidades; não reproduz6 fixo. ENS completo/username canônico evitam duplicação inconsistente dos exemplos. Indicação/ENS opcionais mantêm contrato, sem asterisco falso.
- Conexão, aceite/reaceite e campos/revisão completos aumentam altura em relação ao checkout estático. Mobile inclui expansões/controles ausentes no frame. Perfil tem Salvar perfil / Salvar senha separados; secundária cadastrada cresce além do exemplo vazio. Essas diferenças cumprem regras já implementadas, sem novas páginas editoriais.
- Ícones auxiliares Lucide e antialiasing do Chromium/Windows podem diferir do export. Recuperação do SVG original, contextos bloqueados, ajuste fino remanescente, auditoria integral de acessibilidade/contraste/zoom, Lighthouse e publicação HTTPS continuam pendentes.

## Validação

Baselines só foram geradas após a comparação acima e correções. Testes visuais do código usam fixtures próprias em390/768/1440; não comparam diretamente o export. ID/data da transação são mascarados; valores/itens não. Acrescentadas baselines de perfil/carteiras.

Durante a revisão foram encontrados e corrigidos: overflow do inputavatar oculto, data colidindo no recibo, acesso à conta sobreposto ao favorito mobile e helpers que consultavam sessão antes de MSW/React concluir refresh/troca. Asserções agora aguardam estado autenticado na UI e verificam API; seleção é delimitada ao diálogo correto. Nenhum teste substitui handlers ou socket por setters.

Typecheck, lint sem warnings e build passaram. Suíte completa: **150/150 passaram em3,7min**, com `npx playwright test --workers=6`, sem update de imagens, incluindo27 regressões visuais. Aumentar paralelismo expôs um teste antigo lendo uma lista transitória vazia; ele agora espera a resposta de ordenação e compara a UI com os itens da API antes de testar refresh/histórico. O relatório completo está em playwright-report; `npm run test:report`. A correção final de espaçamento das carteiras teve nova revisão manual e verificações direcionadas registradas na sequência. Permanecem cobertos criação concorrente/idempotência409, timeout/refresh/reconnect, terminais, snapshot/limpeza parcial, sessão/isolamento, cotação e eventos antigos/duplicados.

Depois do ajuste final das carteiras: **18/18 testes de conta e suas baselines passaram em56,2s**, sem update. Depois do rótulo condicional de conexão no mobile: **12/12 testes de pagamento/recibo passaram em43,8s**, incluindo seis visuais sem update, compra/imutabilidade/foco, validação/refresh/expiração/recusa/desconexão. Typecheck, lint e build foram executados novamente e passaram. A execução completa de150 precede esses dois ajustes finais; os testes direcionados verificam as áreas afetadas.

A última geração de capturas terminou com28 telas e quatro estados checkout-ready. Uma primeira tentativa teve timeout aguardando o formulário de carteiras; a nova execução completa passou. O script agora salva screenshot e URL/texto de erro quando uma captura falha; o timeout não foi tratado como evidência de sucesso.
