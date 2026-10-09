# Revisão das seis telas mobile

Escopo: início, detalhe, carrinho, pagamento, login e cadastro. Sem deploy, novas bibliotecas ou mudanças nos contratos de sessão, API, eventos e pedidos. Exports originais e quatro artes preservados.

## Referências e método

Frames: início `14:5226`, detalhe `15:5536`, carrinho `16:360`, pagamento `16:748`, login `16:1022`, cadastro `16:1228`, arquivo `y1ACuUlG8c6eRylaa4qWI2`. A primeira consulta de contexto desta revisão recebeu limite Starter do MCP; não repetimos consultas bloqueadas. Usamos os contextos já registrados em [design-reference.md](design-reference.md) e os seis PNGs originais de `Frontend Challenge/Mobile`. Não recebemos imagens comparativas adicionais neste anexo; ele contém o pedido em texto.

Comparação visual primeiro em **414×896, DPR 1**, com export exibido na mesma escala CSS. Adaptação inspecionada em 440×956 e 390×844, sem aumentar todos os elementos proporcionalmente. Capturas viewport e página completa: [antes](evidence/mobile-review/before), [depois](evidence/mobile-review/after). Cada pasta contém as seis telas nas três larguras; `geometry.json` registra ausência de overflow. A pasta depois também registra tipografia computada. Imagens longas exibidas redimensionadas pelo visualizador não foram usadas como régua.

`scripts/mobile-review.mjs` prepara cenários por handlers MSW: reset integral, visitante no início/detalhe/auth; Ana autenticada, duas carteiras cadastradas e quatro linhas de carrinho nas outras telas. Quantidades: Emerald 1/50×1, Violet 1/50×1, Ivory 1/10×2, Golden 1/50×2. Carteiras têm endereços fictícios 0x111…111 e 0x222…222, redes Ethereum/Polygon. Capturas antes/depois usam o mesmo cenário **ainda não conectado**, logo Confirmar compra permanece desabilitado corretamente. O teste visual do pagamento cobre separadamente uma carteira conectada, cotação de 2.396 ETH e conteúdo secundário fechado. Nada da preparação altera UI/cache diretamente.

## Capturas para conferência

| Tela | Antes 414 | Depois 414 | Antes 440 | Depois 440 |
| --- | --- | --- | --- | --- |
| Início | [before 414](evidence/mobile-review/before/home-414.png) | [after 414](evidence/mobile-review/after/home-414.png) | [before 440](evidence/mobile-review/before/home-440.png) | [after 440](evidence/mobile-review/after/home-440.png) |
| Detalhe | [before 414](evidence/mobile-review/before/detail-414.png) | [after 414](evidence/mobile-review/after/detail-414.png) | [before 440](evidence/mobile-review/before/detail-440.png) | [after 440](evidence/mobile-review/after/detail-440.png) |
| Carrinho | [before 414](evidence/mobile-review/before/cart-414.png) | [after 414](evidence/mobile-review/after/cart-414.png) | [before 440](evidence/mobile-review/before/cart-440.png) | [after 440](evidence/mobile-review/after/cart-440.png) |
| Pagamento | [before 414](evidence/mobile-review/before/checkout-414.png) | [after 414](evidence/mobile-review/after/checkout-414.png) | [before 440](evidence/mobile-review/before/checkout-440.png) | [after 440](evidence/mobile-review/after/checkout-440.png) |
| Login | [before 414](evidence/mobile-review/before/login-414.png) | [after 414](evidence/mobile-review/after/login-414.png) | [before 440](evidence/mobile-review/before/login-440.png) | [after 440](evidence/mobile-review/after/login-440.png) |
| Cadastro | [before 414](evidence/mobile-review/before/signup-414.png) | [after 414](evidence/mobile-review/after/signup-414.png) | [before 440](evidence/mobile-review/before/signup-440.png) | [after 440](evidence/mobile-review/after/signup-440.png) |

## Correções

| Tela | Correção | Origem e limite |
| --- | --- | --- |
| Navegação | Ícone de conta isolado oculto nas seis telas; perfil continua acessível pelo menu existente, com sessão e logout. Ícones inferiores locais, botão central composto com os vetores originais, badge funcional e áreas clicáveis. | Assets identificados no manifesto; alvo mínimo de 44 px nos itens inferiores é ajuste de acessibilidade. Perfil/carteiras continuam com acesso à conta. |
| Início | Hero com arte principal responsiva, descrição ajustada, indicadores mantidos. Ordenação no painel de filtros; mesma URL/Query. Abas 14/400/16 e ativo 700. Cards com superfície de 200 px, arte quadrada, espaçamento interno e coluna direita 32 px abaixo. | Dimensões principais e tipografia confirmadas no contexto anterior; distribuição do padding interno estimada do export. Imagens WebP/srcset, prioridades e lazy loading preservados. |
| Detalhe | Arte inteira com contain, painel sobreposto e cantos superiores arredondados, avaliação com estrela, metadados, quantidade/preço e dois CTAs. Galeria/compartilhamento em acesso secundário expansível. Zoom pelo toque/clique na arte e foco visível. Favorito permanece no cabeçalho. | Contexto de detalhe continua limitado: painel a aproximadamente y392 em 414 px e espaçamentos são estimativas do export, não medidas novas do Figma. Conteúdo completo segue abaixo e pode ser rolado. |
| Carrinho | Voltar circular e título centralizado; imagem de 100 px, conteúdo central, quantidade à direita, remoção mantida. Cupom integrado arredondado, Taxa estimada sob a taxa e resumo sem margem duplicada no primeiro item. | Imagens/proporções confirmadas anteriormente; composição interna refinada pelo export. Quatro itens são cenário de comparação, não uma restrição do produto. |
| Pagamento | Seletores alinhados, ordem WalletConnect/MetaMask/Coinbase Wallet, rádio com cores da identidade e ícone local Coinbase no mobile. CTA próximo à base por flex/min-height; informações completas de NFTs ficam após o formulário em bloco expansível. | Controles de carteira permanecem funcionais. Não adicionamos três pontos sem ação. Conteúdo maior e avisos condicionais podem exigir rolagem; nada fica encoberto pelo CTA. Desktop mantém composição e ícone anteriores. |
| Login/cadastro | Logo, título, campos de 50 px, CTA de 60 px/16 px, separador e botões sociais discretos. Olho local e confirmação de senha com estado independente. Placeholders à esquerda e Criar perfil mantidos. | Tipografia/alturas principais confirmadas; diferenças de poucos pixels nos grupos são estimativas revisadas no export. Sem exemplos preenchidos nem sucesso de autenticação social. |

CSS da revisão em `src/mobile-reference.css`, delimitado a até 639 px; regras específicas do checkout em seu CSS existente. Não se criou outra fonte de estado remoto. `CheckoutNfts` apenas renderiza a mesma cotação em posições responsivas; a versão oculta não participa da navegação por teclado.

## Validação e regressão visual

- Typecheck, lint e build executados sem erros durante a revisão.
- Catálogo + ajustes anteriores: 12/12 testes mobile passaram (URL, histórico, respostas obsoletas, estados de consulta, galeria, quantidade e Socket.IO; alinhamento/separador em 390/414/768/1440).
- Comércio + novos controles mobile: 13/13 passaram após corrigir seletores e a espera do logout pela resposta REST. Novos testes verificam senhas independentes, teclado, formulário com viewport reduzido, ordenação persistente, deslocamento do grid, carteira/conexão, quantidade e perfil em 390/414/440.
- Comparação automática anterior à atualização: 21/27 baselines passaram. As seis diferenças eram exatamente as telas mobile revisadas; desktop/tablet, perfil/carteiras/recibo mobile permaneceram iguais. Diffs preservados em [baseline-diffs](evidence/mobile-review/baseline-diffs).
- Após revisão visual, seis baselines mobile atualizadas; execução de geração 7/7 passou, incluindo recibo inalterado. Baseline da aplicação verifica regressões; **não comprova fidelidade integral ao Figma**.
- Suíte completa executada uma vez após consolidação: **221 passados, 1 falha, 3 skips**, em 9.3 minutos. A falha era o seletor de acessibilidade restrito ao favorito removido da área de compra. Selecionamos o favorito visível no cabeçalho mobile/área desktop, preservando medidas, foco, edição e zoom; **9/9** testes de quality passaram na revalidação. Sem mudança de runtime após a suíte; não repetimos a suíte completa nem declaramos a primeira execução inteiramente verde. [HTML completo](audits/playwright-mobile-review/full/index.html), [revalidação](audits/playwright-mobile-review/accessibility-fixed/index.html).
- Os três skips continuam intencionais em final-review: Mercado desktop não se aplica ao projeto mobile (coberto por navigation-cart); o fluxo adicional de 414 px roda no mobile e é pulado nos outros dois projetos. Nenhum skip novo.
- Typecheck/lint/build finais passaram; no script de capturas foi corrigida somente a declaração ESLint do global getComputedStyle. Lighthouse final pendente de execução.

## Desvios e pendências

Dados e valores seguem a API: o cenário de quatro linhas resulta em subtotal 8.14 ETH, taxa 0.016 e total 8.156; os números inconsistentes do export não foram copiados. A seleção padrão do catálogo mantém fixtures/ordem atuais: a quarta arte é Sage em Cosmic Bloom, enquanto o export usa Golden. Não alteramos a ordem de dados para modificar somente o mobile. Atributo Verificado reflete a fixture Emerald; não forçamos Raro do print.

Controles de input mantêm borda de contraste mais forte já aprovada; os exemplos preenchidos e alinhamento central do nome de usuário não foram reproduzidos. Galeria, compartilhamento, perfil do colecionador, lista completa dos itens e recomendações são conteúdos secundários necessários aos requisitos e não têm correspondência integral no frame recortado. Avisos de erro, cotação, estoque e sessão só aparecem quando aplicáveis.

Teclado/altura reduzida no Chromium não certificam teclado nativo iOS, Safari, leitor de tela, alto contraste real ou ampliação de texto do sistema. Essas verificações humanas permanecem pendentes conforme roteiro em quality-audit/performance-closure. Contexto Figma limitado; não afirmar equivalência integral. Publicação HTTPS continua pendente e não foi autorizada nesta etapa.

## Reprodução

Com dependências/Chromium instalados conforme README:

```powershell
npm run build
npm run preview -- --port 4176 --strictPort
# Em outro terminal:
node scripts/mobile-review.mjs conference
npx playwright test
# Sem testes/capturas concorrentes:
$env:AUDIT_OUTPUT='docs/audits/lighthouse-mobile-review'
npm run audit
```

O script de capturas sobrescreve apenas a pasta correspondente ao argumento; use outro nome para uma nova comparação. Pare o preview de capturas antes de reconstruir o build. Porta 4175 deve estar livre para a auditoria.
