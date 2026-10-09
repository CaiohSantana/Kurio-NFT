# Referência visual — Kurio

Revisão mobile posterior: [mobile-fidelity-review.md](mobile-fidelity-review.md), seis telas em 414/440/390, antes/depois, assets de navegação locais e somente seis baselines alteradas após comparação. Consulta adicional bloqueada pelo limite Starter; medidas confirmadas abaixo preservadas, ajustes do detalhe/padding estimados dos exports identificados separadamente. Sem mudança no Figma nem certificação de equivalência integral.

Revisão final dos apontamentos: [final-screen-review.md](final-screen-review.md). Exports confirmam trilha única de preço, token no carrinho desktop/edição mobile, indicadores, placeholders e ENS .eth+nome em perfil/carteiras. Seletores/asteriscos visuais não alteram regras opcionais do enunciado/SPEC. Medidas adicionais são estimativas dos exports/DOM, sem novo contexto após o limite já registrado. Confirmação preservada; comparações não certificam equivalência integral.

Revisão implementada em2026-10-08: docs/visual-refinement.md separa medidas confirmadas, estimativas dos exports, capturas DOM e desvios necessários. Consulta adicional de pagamento bloqueada pelo limiteStarter; nada foi alterado no Figma. Propostas anteriores de banners/provedores “simulados” na UI foram substituídas por textos normais da referência e documentação da natureza simulada, conforme nova instrução do usuário.

Análise registrada em 2026-10-07. Fonte visual: [cópia do Figma](https://www.figma.com/design/y1ACuUlG8c6eRylaa4qWI2/Frontend-Challenge--Copy-?node-id=0-1), página `0:1`, “Marketplace de NFTs GreenMint”. O enunciado em challenge-original.md define comportamento; medidas visuais não substituem suas regras. Nenhuma edição no Figma foi feita.

## Evidências e alcance

- Início desktop/mobile: get_design_context e get_screenshot consultados; imagens inspecionadas.
- Carrinho, pagamento, login, cadastro desktop/mobile; perfil e carteiras desktop: contextos consultados, além dos metadados da página. Dados abaixo vêm desses retornos, sem deduzir medidas de pixels da screenshot.
- Detalhe desktop `10:244`, detalhe mobile `15:5536` e confirmação `11:4385`: contexto falhou por limite Starter. Metadados da consulta anterior estão disponíveis. Os três exports locais foram inspecionados nesta etapa; aparência/controles visíveis confirmados, tipografia e assets específicos continuam pendentes.
- O usuário forneceu 15 exports completos em `../Frontend Challenge/Desktop/` (9) e `../Frontend Challenge/Mobile/` (6). Permanecem intactos; são referências, não assets de interface. O inventário está em design-exports.json.

## Confirmado: telas e medidas dos frames

| Tela | Desktop: ID / dimensões | Mobile: ID / dimensões |
| --- | --- | --- |
| Início | 2:2 / 1440×3668 | 14:5226 / 414×896 |
| Detalhe | 10:244 / 1440×2246 | 15:5536 / 414×896 |
| Carrinho | 11:1278 / 1440×1754 | 16:360 / 414×896 |
| Pagamento | 11:2862 / 1440×1657 | 16:748 / 414×896 |
| Confirmação | 11:4385 / 1440×1657 | Sem frame |
| Login | 9:115 / 1440×1981 | 16:1022 / 414×896 |
| Cadastro | 9:1022 / 1440×1981 | 16:1228 / 414×896 |
| Perfil | 9:1238 / 1440×1080 | Sem frame |
| Carteiras | 9:1670 / 1440×1080 | Sem frame |

## Confirmado: tipografia

Roboto Mono aparece no contexto retornado nas variantes Regular 400, Medium 500 e Bold 700. Existe variável `font/family`, mas seu valor resolvido não foi inspecionado diretamente. “Auto” abaixo é `normal` no contexto; não converter o valor 100 dos resumos de estilos em 100px. Não foram fornecidos arquivos de fonte.

| Elemento | Desktop: tamanho/peso/linha (px) | Mobile: tamanho/peso/linha (px) |
| --- | --- | --- |
| Marca | 14/700/auto, tracking 1,4 | Autenticação 32/700/auto, tracking 3,2 |
| Navegação/abas | 16/400/auto; ativo 700. Abas catálogo 15/500/16 | Abas 14/400/16; ativo 700 |
| Hero boas-vindas | 14/500/16, tracking 1,4 | 12/500/16 |
| Hero título | 43/700/70 | 18/700/29 |
| Hero descrição | 14/400/24 | 12/400/18 |
| Hero Explorar | 16/700/20 | 12/700/14 |
| Nome NFT catálogo | 16/400/16 | 15/400/auto |
| Preço NFT catálogo | 18/700/16 | 16/700/16 |
| Filtros título | 18/700/16 | Painel sem referência |
| Filtros opções/contagens | 15/400/40; contagens 700 | — |
| Banner lateral | Título 24/700/32; oferta 22/700/16 | — |
| Promoção título/descrição | 18/700/24 e 14/400/24 | — |
| Blog título/subtítulo | 28/700/auto e 14/400/auto | — |
| Artigo título/metadados/texto/CTA | 16/700/auto; 12/500/16; 12/500/16; 12/700/14 | — |
| Rodapé título/texto/links | 17–18/700/16; 14/400/22; 14/400/30 | — |
| Campos de autenticação | 14/400/16 | 14/400/16 |
| Botões sociais | 13/500/16 | 13/500/16 |
| CTA autenticação mobile | — | 16/700/16 |
| Selo RARO | — | 13/500/16 |

Há alturas menores que o tamanho da fonte (18/16 etc.). Preservar referência e validar cortes/legibilidade; ajustes de acessibilidade devem ser registrados.

## Confirmado: cores

| Token/uso | Valor |
| --- | --- |
| Ink: fundo e texto sobre botão primário | #140D0A |
| Surface Card: cards, filtros, modais | #241612 |
| Surface Raised | #2F1D15 |
| Surface Dark: faixa rodapé/newsletter | #38220F |
| Foreground | #F5F1EB |
| Text Primary usado no blog | #F7F3EC |
| Text Secondary | #CFB28C |
| Secondary: texto auxiliar | #B39463 |
| Text Accent: preços/ativos/links | #E89B55 |
| Primary: botões | #D28A4C |
| Border / Border Soft | #3F2319 / #55321F |

Cards mobile: gradiente #241612 → #2F1D15. Filtro mobile: gradiente de cobre com opacidade 0,45 → 1. CTAs de compra/pagamento mobile: cobre → cobre com opacidade 0,8. Cores de marcas Google/Facebook não são tokens gerais. Cores exatas do contexto bloqueado não foram extraídas de screenshots.

## Confirmado: início e componentes

Desktop: conteúdo 1200, margens 120, padding vertical 24 e gap 96 entre seções. Header→hero: 32. Hero 1200×450, texto com largura 600 e imagem 450×450; descrição 557, inset esquerdo 40. Sidebar 310 + gap 48 + grid 842. Três cards por linha de 258 com gap 34; superfícies 258×300 e imagens comuns 250×250 (1:1), uma exceção 224×286. Gap entre linhas 72. Nome após arte: 12; há variação no gap nome/preço (6 ou 12). Banner destaque 310×470, imagem 310×368. Promoções 586×250 com gap 28, slots de arte 292×250 e 287×250. Blog: cards 268×369, imagens 268×195, gap 24 e header→cards 40. Os quatro cards ocupam 1144 de um contêiner 1200.

Mobile: conteúdo 366, margens 24, padding superior 40 e gap 16. Busca 313×45, filtro 45×45, gap 8. Hero 366×190, padding 16, imagem 138×138 e miniatura sobreposta 58×58. Duas colunas de 175, intervalo calculado 16; coluna direita deslocada 32, gap vertical 24. Superfície de card 175×200 com raio 20; arte 168×168 com raio 16. Tab bar ocupa 414×126, ação central 65×65. Screenshot mostra parte dos últimos cards coberta pela barra; comportamento de rolagem não comprovado. Não existe referência mobile para promoções/blog/rodapé nem tablet.

| Componente | Evidência/variações |
| --- | --- |
| Header Row 70486:560 | 1200, marca, quatro links (gap 40), busca, carrinho+badge e Entrar 100×35/raio 6; ações gap 28. Ativo Home ou Market. |
| Header With Divider 70504:3017 | Início/perfil/carteiras e fundo auth; fluxo mercado usa row sem divisor. |
| Filters 70485:381 | 310, padding 20, grupos gap 40; coleções/contagens, preço 0,02–12,30 ETH+Aplicar, redes Ethereum/Polygon/Solana. Documentação menciona checkboxes; screenshot não os evidencia claramente. |
| Cards NFT | Frames recorrentes, nem todos componentes cadastrados. Arte/nome/preço, favorito/RARO/preço anterior em variantes. |
| Botões | Alturas desktop 35/40; mobile 60; raios variáveis 3/5/6/10/40. Não há um único padrão universal. |
| Footer 70491:1286 | Benefícios W/C/D+newsletter (altura 250), faixa contatos (88), links/social/carteiras (236) e copyright; mesmo conteúdo em desktop. |
| Conta | Sidebar 310, gap 28, conteúdo restante 862; campos 417 em duas colunas e gap de linhas 24. Inputs 40/raio 3. |
| Auth | Modal sobre catálogo no desktop; página própria mobile. Cadastro modal 500×656/raio 8; formulário inset 80. Mobile conteúdo 358 (margem 28), input 50/raio 10, CTA 60/raio 10. |
| Social Button 70483:263 / Mobile Social Block 70504:2994 | Google/Facebook, botões 40; mobile gap 16 e separador. Presença visual não obriga OAuth real. |

## Confirmado: demais composições e interações indicadas

- Detalhe desktop: galeria de miniaturas+imagem/ampliação, informações ao lado, edição/quantidade/comprar/favorito/share, tabs detalhes/avaliações e relacionados. Mobile: hero 414×506, painel y=392/altura 504 e compra y=732/altura 164; retorno, coração e carrinho visíveis nos exports. Metadados indicam avaliação 4,8 (19), token/coleção/atributos. Acesso a todos os detalhes deve ser adaptado.
- Carrinho desktop: tabela 782 e resumo 332; linhas/miniaturas 70, cupom/resumo/CTA e recomendações. Mobile: 4 cards 358×100, miniaturas 100×100, gap 20; resumo inferior em superfície com raios superiores 40 e CTA 60.
- Pagamento desktop: dados de colecionador, rede/endereço/tipo de carteira, e-mail/usuário/perfil/ENS/indicação, outra carteira/observação; resumo dos NFTs/cupom/taxa/total/provedores. Mobile omite formulário/recibo detalhado, mostrando Reserva/Principal (358×93), Trocar carteira e provedores (359×65). Todos os campos e revisão são necessários pelo enunciado.
- Login/cadastro: campos e erros a implementar conforme SPEC; inputs de senha com visibilidade, links de alternância/recuperação e social. Não há telas de recuperação ou estados de erro no Figma.
- Perfil: exibição/usuário/e-mail/ENS/apelido, avatar remover/alterar, senha atual/nova/confirmação e Salvar.
- Carteiras: principal/adicionar, exibição/apelido/rede/perfil/endereço/tipo/ENS/secundária/indicação/e-mail, salvar; secundária/igual à principal/adicionar e vazio.
- Confirmação: modal 578×821, fechar, ícone de agradecimento, sucesso, transação/data/total/carteira, itens/quantidades/subtotais/taxa/total e Ver no Etherscan. Export permite visualizar ícone, mas não obter seu SVG isolado.

Não foram verificadas conexões de protótipo. Presença de controle não prova comportamento implementado. Textos antigos dos nomes de camada podem diferir do conteúdo retornado pelo contexto; priorizar contexto e export da versão fornecida.

## Propostas orientadas ao enunciado

1. Checkout único em dados/regras: manter desktop lado a lado; mobile empilha Dados, Carteira e Revisão, aproveitando cards existentes. Provedores simulados nas duas versões, carteira cadastrada e rede compatível; trocar invalida revisão/cotação. Sem carteira, cadastrar e retornar preservando contexto.
2. Perfil/carteiras mobile em uma coluna rolável, navegação de conta compacta; confirmação com dados/itens empilhados. Não inventar funções adicionais.
3. Corrigir conteúdo inconsistente via fixtures canônicas: tokens #0042/#0314/#0088; mesmos nomes/preços/estoque/edições em todos os tamanhos, totals calculados. Card mobile 3/4 repete nomes/preços de artes diferentes; corrigir identidade. Edição mobile duplica 1/10; oferecer seleção canônica do desktop. Contrato e royalties estão trocados; corrigir associações. Badge deve refletir quantidade definida no contrato, não o 6 fixo do desenho.
4. Recibo deve vir do snapshot confirmado da API; os 26,846 ETH desktop e 8,936 ETH mobile são exemplos de carrinhos diferentes, não valores hardcoded. Transação/data vêm da simulação.
5. Detalhes adicionais em tabs/acordeão no mobile; filtros em drawer; reserve espaço de barras fixas. Cantos de 40 do frame não são necessariamente cantos da página no navegador.
6. Estados não desenhados: skeleton/shimmer e reduced-motion, vazio/erro/retry, formulários inválidos/conflito, carrinho vazio/estoque/cupom, sessão expirada, conexão recusada/desconectada, cotação alterada, pedido pending/refused/confirmed. Estilizar com tokens existentes e feedback acessível.
7. Ajustar contraste/foco/labels e legibilidade sem mudar identidade, documentando desvios em ARCHITECTURE. Contato `mailto:contact@besa.com` conflita com texto contato@email.com; não herdar destino antigo. Newsletter/social/links auxiliares fora de escopo não aparentam sucesso funcional.

## Assets e origem

Assets individuais baixados em `../public/assets/figma/`; estado detalhado em [assets-manifest.json](assets-manifest.json), com arquivo, URL de origem, usos por frame, bytes e SHA-256. O manifesto deduplica nome do arquivo, mantendo múltiplas origens/usos. Consultar [README dos assets](../public/assets/figma/README.md) para recuperação e validação.

Quatro PNGs distintos retornados: 8f387.png (óculos/jaqueta verde), 83794.png (chapéu/roupa roxa), 9add2.png (macaco escuro/roupa clara), b7cfc.png (dourado/headphones). A referência reutiliza essas artes em vários NFTs; isso é permitido nas fixtures, mantendo identidade coerente. SVGs incluem controles, decoração, social, navegação e divisores. KURIO e W/C/D são texto no contexto, não assets separados. Slots/proporções acima não são dimensões nativas dos PNGs; dimensões dos arquivos recuperados ficam no manifesto.

URLs MCP informaram validade de 7 dias; links temporários não serão usados na execução da aplicação. Screenshots completas não devem ser cortadas para inventar assets. Nenhuma imagem foi gerada ou substituída.

## Pendências

- Valor resolvido da variável font/family ainda pendente. Na etapa técnica, Roboto Mono normal variável foi obtida localmente via Fontsource 5.3.0, com SIL OFL 1.1; origem/licença/checksum em public/assets/fonts/README.md. Essa obtenção não confirma medidas das consultas bloqueadas.
- Contextos/assets exclusivos de detalhe desktop/mobile e confirmação: limite Starter. Os exports suprem inspeção visual, não extração de fontes/medidas/ícone isolado.
- Sem desenho de estados de falha, tablet, perfil/carteiras/confirmação mobile, drawer de filtros e páginas fora do escopo. Adaptações são propostas, não medições confirmadas.
- Atualizações de URLs falhas constam no manifesto; disponibilidade de cada download é auditada separadamente. O Figma original permaneceu intacto.
