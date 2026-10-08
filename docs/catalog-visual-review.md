# Revisão visual de catálogo e detalhe

Fonte: os quatro exports do usuário em Frontend Challenge/Desktop e Mobile (Início e Detalhes do NFT), mais medidas confirmadas em design-reference.md. Nenhuma edição no Figma ou transformação dos arquivos de arte. Revisão em 2026-10-07 com Chromium 156/Windows.

## Comparação manual com os PNGs

Capturas da implementação foram inspecionadas lado a lado com os PNGs originais: desktop em 1440px, mobile em 414×896 para coincidir com a referência. Também inspecionados os resultados em 390 e 768px. Essa inspeção não é um teste automatizado de igualdade contra o export.

Foram ajustados: posição vertical do texto/pontos do hero, imagem e miniatura mobile, abas, painel sobreposto do detalhe mobile, descrição resumida e localização da galeria mobile. A composição mantém hero, catálogo/aside, promoções, blog e rodapé no desktop. Os mesmos conteúdos permanecem acessíveis no mobile.

Elementos confirmados reutilizados: Roboto Mono 400/500/700, paleta marrom/cobre, largura desktop 1200, sidebar 310/gap48/grid842, cards de três colunas desktop/duas mobile, arte square local, hero desktop450/mobile190, imagens138/58 mobile, SVG do fundo/pontos e SVGs sociais locais. Campos de filtro e busca são interativos, não uma reprodução de imagem de tela.

## Estimativas e diferenças deliberadas

- A inspeção do contexto detalhado do NFT ficou bloqueada pelo limite Figma. Título desktop 28/37, título mobile20/26, descrição14/22–24, galeria desktop444 e imagem mobile440px são estimativas informadas pelo export/metadados, não medidas extraídas de propriedades Figma. Mobile sobrepõe o painel em 114px e reserva164px para compra.
- Artes MCP locais e enquadramentos vistos nos exports não são visualmente idênticos em todos os slots. Foram usados os quatro PNGs recuperados, sem gerar variantes ou recortar screenshots. Recortes responsivos usam object-fit; não se afirma equivalência pixel a pixel.
- A busca desktop ocupa espaço acima da toolbar; mobile ganha uma linha de ordenação. Essa linha desloca os cards abaixo da posição original, mas torna ordenação disponível sem esconder requisito.
- Primeiras nove identidades são coerentes entre larguras. O quarto card mobile é Cosmic Bloom conforme ordenação REST, enquanto o export mostra outra arte com nome repetido. Tokens, nomes e preço anterior foram corrigidos nas fixtures; contagens refletem 45 NFTs em vez de números estáticos do desenho. O card Golden Frequency recebe nome/preço que estavam ausentes em um slot desktop.
- Filtros têm checkboxes com foco/estado, dois sliders acessíveis e limpar filtros. Os números/estados dependem da API. O drawer usa diálogo nativo modal com Escape e devolução de foco.
- Ações de compra, favoritos, conta, carrinho, editoriais/newsletter e scanner mostram indisponibilidade explícita, sem falso sucesso. Indicador da quantidade não inventa itens de carrinho. Ícones auxiliares de navegação/controle usam Lucide; SVGs originais usados no fundo, pontos e redes sociais. Essa diferença de ícones permanece registrada.
- Detalhe mobile oferece galeria, texto integral, rede/contrato/royalties e relacionados abaixo do painel inicial, sem ocultar conteúdo atrás da barra fixa. Galeria repete a arte como no export; não há outras vistas recuperadas. Contrato/royalties não repetem os rótulos trocados do export.
- As abas de avaliações oferecem somente informação de leitura simulada; não há criação de avaliação. Datas/descrições editoriais são decoração estática sem página editorial.
- Não há frame tablet; grid/formulários/rodapé adaptados para768. Home mobile conserva promoções/blog/rodapé além da primeira viewport da referência. O contorno externo arredondado do telefone não foi aplicado à página.

Alturas finais das baselines: home1440×3777, detalhe1440×2415, home390×6342, detalhe390×4634, home768×4429, detalhe768×3780. Os exports desktop medem1440×3668 e1440×2246. As diferenças de altura vêm dos controles/conteúdo/feedback acessíveis e composição estimada; fidelidade total ainda precisa de refinamento quando as propriedades bloqueadas estiverem disponíveis.

## Regressão visual automatizada

Depois da revisão manual, geradas seis baselines em tests/visual.spec.ts-snapshots (home/detail ×390/768/1440). Testes aguardam dados, fontes, relacionados e imagens locais; animações são desativadas apenas na captura. O teste de reduced-motion separado verifica o comportamento real.

A comparação automatizada é **implementação atual contra sua baseline revisada**, não contra os PNGs do Figma. Não prova que a implementação é pixel-perfect. Baselines usam Chromium/Windows; outro SO/browser exige revisão própria, sem atualização automática para esconder falhas. Imagens baseline são versionadas; screenshots de diagnóstico/relatórios ficam ignorados.

Comando de regressão: `npx playwright test tests/visual.spec.ts`. Atualização deliberada, somente após nova revisão: `npx playwright test tests/visual.spec.ts --update-snapshots`.
