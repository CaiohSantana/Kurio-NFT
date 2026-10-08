# Artes otimizadas

Origem: os quatro PNGs de `../figma`, exportados do Figma, preservados com seu manifesto/licenciamento original. Nenhuma arte foi substituída ou criada.

`node scripts/optimize-assets.mjs` usa sharp 0.35.5 (lockfile) para gerar WebP lossless na resolução original e versões de 450/900 px. As versões menores fazem apenas reamostragem proporcional; a codificação é sem perdas. Galeria ampliada conserva a resolução original. Cards e imagem principal oferecem srcset; demais miniaturas usam a variante de 900 px. O manifesto registra origem e checksums. Não é necessário regenerar: todos os arquivos usados pela aplicação são versionados.

Diferença em relação ao PNG: a reamostragem pode mudar pixels de borda em comparação ao redimensionamento feito pelo navegador; composição, cores, conteúdo e proporções são preservados. Revisar capturas antes de atualizar baselines.
