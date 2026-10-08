# Assets individuais do Figma

Recuperados em 2026-10-07 da cópia `y1ACuUlG8c6eRylaa4qWI2`, usando as URLs já retornadas por get_design_context. São 111 arquivos únicos: 4 PNGs e 107 SVGs. Todos baixados e validados; nenhuma URL ficou pendente nesta recuperação.

Origem detalhada: [manifesto](../../../docs/assets-manifest.json), com múltiplas URLs e usos por frame, URL efetivamente utilizada, bytes, SHA-256 e dimensões. URLs são temporárias; a aplicação futura deve apontar para arquivos locais. Os nomes originais foram mantidos para rastreabilidade.

| PNG | Conteúdo | Dimensão nativa |
| --- | --- | --- |
| 8f387.png | Macaco com óculos e jaqueta verde | 1254×1254 |
| 83794.png | Macaco com chapéu e roupa roxa | 1254×1254 |
| 9add2.png | Macaco escuro com roupa clara | 1254×1254 |
| b7cfc.png | Macaco dourado com headphones | 1254×1254 |

SVGs: controles, navegação, decoração, social, divisores e indicadores. O manifesto registra width/height/viewBox das raízes; não redimensionar indiscriminadamente nem redesenhar os assets. Há fragmentos SVG compostos no contexto, portanto a futura implementação deve preservar composição e slot em vez de tratar cada fragmento como um ícone completo.

Validação realizada: arquivos não vazios, hash SHA-256, PNG decodificável com dimensões e SVG com raiz válida. Não foi feita validação de posicionamento/callsite/renderização da aplicação, que ainda não existe.

Os exports completos em `Frontend Challenge/` são referências do usuário, não imagens para renderizar a aplicação. Mantidos intactos e inventariados em [design-exports.json](../../../docs/design-exports.json). Não recortar screenshots para inventar assets ausentes.

Roboto Mono local foi preparada na etapa técnica; origem/licença em ../fonts/README.md. Pendências: valor resolvido de font/family e assets exclusivos de detalhe desktop/mobile e confirmação cujo contexto foi bloqueado pelo limite Starter (incluindo eventual ícone de agradecimento). Nenhum asset Figma substituído ou gerado.
