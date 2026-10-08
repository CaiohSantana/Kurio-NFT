# Revisão final das nove telas — 2026-10-08

Revisão posterior: [quality-audit.md](quality-audit.md) registra contraste de campos, foco e zoom nativo ao vivo, 12 medições Lighthouse e checkout limpo. As ressalvas de bordas/zoom desta página são históricas; verificações manuais e metas/publicação restantes estão na auditoria atual.

Escopo: apontamentos do usuário no pedido anexado, exports originais desktop/mobile e SPEC. Correções localizadas; contratos REST, mocks, cache, precisão, isolamento, idempotência, snapshot e protocolo Socket.IO preservados. Lighthouse e publicação reservados à próxima etapa. Não houve edição do Figma, dependência nova ou substituição das quatro artes.

## Checklist dos apontamentos

| Apontamento | Resultado / status | Evidência |
| --- | --- | --- |
| Início: “tp” ao clicar Mercado | Não reproduzido com movimento normal; scroll passa por posições intermediárias sem reload. Com reduced-motion é imediato intencionalmente. Histórico/hash/parâmetros preservados. | Amostras0→2→11→29→…→575; catálogo termina em y72. Teste `final-review.spec.ts` observa movimento real/mesmo documento; `navigation-cart.spec.ts` cobre retorno/histórico/reduced-motion. |
| Início: faixa única com dois limites | Corrigido: dois thumbs nativos sobre a mesma trilha, ambos na mesma posição/largura. Min/max não se cruzam; teclado e Aplicar enviam valores ao Router/API. | Export mostra trilha unificada; testes de boundingBox/ArrowRight/Home, limites e catálogo. |
| Footer: carteiras em espaços iguais | Corrigido: grid de três colunas iguais, nomes centralizados na faixa existente. | Capturas de início, detalhe, carrinho e pagamento; sem alterar assets. |
| Detalhe: divisor e edições | Corrigido: apenas `nft-market` retira o divisor do header; botões têm contorno em cápsula/clip-pathnone, estado/foco/indisponível mantidos. | Export do detalhe e capturas1440/414; testes de edição/limite/foco preservados. |
| Detalhe: três indicadores | Corrigido: três grupos navegáveis dos NFTs retornados pela API; clique e ArrowLeft/Right mudam itens/foco. | `RelatedNfts.tsx`, `final-review.spec.ts`; grupo central inicial como no PNG. |
| Carrinho: token e informação de edição | Corrigido: desktop mostra token canônico #0042/#0314/#0088, sem limite permanente. Edição permanece nos nomes acessíveis/contrato; mobile mantém edição conforme seu frame. Indisponibilidade/limites surgem contextualmente. | Capturas/cart; testes commerce e fluxo414 verificam edição e quantidade. |
| Carrinho: quantidade/lixeira | Corrigido: input centralizado, steppers nativos removidos visualmente; edição por teclado/min/max/erros mantidos. Ícone Trash2 da biblioteca já instalada, nome acessível preservado. | Testes de quantidade/fronteira/remoção; nenhuma biblioteca adicionada. |
| Carrinho: continuar explorando e indicadores | Corrigido: link abaixo do CTA; CartLink leva contexto validado do catálogo em history.state. Indicadores funcionam como no detalhe. | Teste de catálogo filtrado→detalhe→carrinho→catálogo e grupos; capturas/cart. |
| Pagamento: Nome do perfil | Corrigido: campo ocupa a posição do antigo apelido e usa collector.username, igual a Nome de usuário. Não grava no nickname. | `final-review.spec.ts` verifica espelhamento e payload/snapshot; nickname continua ana-wallet. |
| Pagamento: Tipo de carteira | Corrigido: select com seta, independente da rede. Provider/endereço derivam de carteira cadastrada; escolha sem registro abre seletor contextual. | Teste secundária Polygon/Coinbase/rede incompatível; campos e conexão REST. |
| Pagamento: secundária/indicação/ENS | Corrigido: secundária usa placeholder e label oculto; indicação sem “opcional” com asterisco visual; ENS com .eth e nome complementar. | Export e capturas. Campo opcional continua opcional; indicação/ENS não receberam required silenciosamente. Nome completo vai para a API. |
| Pagamento: checkbox e Recuperar pedido permanentes | Removidos. CTA normal confirma a revisão exibida; alteração de fingerprint abre diálogo contextual de nova confirmação. Pending/timeout/refresh retomam o pedido existente pela API. | Testes Socket.IO, taxa sem evento, cupom expirado, timeout e fluxo414 em `/checkout` retornando ao mesmo ID/chave. |
| Pagamento: conexão/CTA/observação | Conexão inicia pela seleção explícita de registro/provedor; CTA bloqueado até resposta connected. Loading/recusa/retry/desconexão mantidos. Confirmar compra é o CTA normal; terminal não transforma recuperação em duplicação. Observação369px desktop, fluida mobile. | Tests checkout/closure; captura checkout-ready depois de API connected. |
| Login: placeholders, navegação e social | Corrigido: labels ocultos e erros associados, placeholders; alternância inferior somente mobile. Ícones originais dentro dos botões. Ações sociais continuam indisponíveis, sem sessão fictícia. | Exports e testes commerce; login414 e1440. |
| Cadastro: placeholders/CTA/altura/social | Corrigido: Criar conta desktop/Criar perfil mobile, sem alternância redundante desktop, separador horizontal e ícones. Modal tem mínimo656px, posicionado no topo conforme referência; conteúdo excepcional pode rolar. | Cadastro desktop/mobile; testes422/409/retorno/hash/refresh preservados. |
| Perfil: ENS e senha | Corrigido: .eth+nome, label Nome ENS sem opcional visível. Senha sem asteriscos visuais, required e validação continuam ao solicitar alteração. | `EnsField`, testes perfil/senha; capturas/profile. |
| Carteiras: placeholders/defaults/semântica | Corrigido: secundária e endereço em placeholders; nova carteira começa sem rede/provider, edição conserva registros. Checkbox Igual à principal tem círculo da referência com semântica/foco/teclado de checkbox. Ethereum nunca é provider. | Teste assertblank/create/edit/duplicate/reuse; `wallets-empty` e carteiras registradas. |
| Confirmação e mensagens do produto | Composição preservada; sem novas baselines do recibo ou diagnósticos/banners genéricos. Feedback de preço/estoque, sessão, recusa, falha e pedido mantido. | Três baselines do recibo originais verificadas na suíte final; transições continuam API-only. |

## Decisões explícitas e desvios

- **Obrigatoriedade:** asteriscos de indicação/ENS no export conflitam com a interpretação funcional vigente de campos opcionais. Reproduzidos visualmente, aria-hidden; label acessível informa opcional. API e HTML não exigem indicação/ENS. Nome do perfil e Nome de usuário usam a mesma identidade do colecionador; não houve migração de nickname.
- **ENS:** o pagamento desenha o seletor compacto isolado; perfil/carteiras mostram o campo complementar. Mantido também no pagamento para permitir o nome completo exigido pelo contrato. Draft contém nome+sufixo; FormData/REST recebem ENS completo (ou vazio), nunca apenas `.eth`.
- **Indicadores:** exports não definem protótipo. Implementação usa três janelas sobre os mesmos8/9 itens reais retornados, com sobreposição e cinco cards por grupo no desktop; mobile adapta o grid. Sem busca inventada ou indicadores sem efeito. Grupo central reproduz a seleção inicial; nomes/valores continuam da API.
- **Conexão/revisão:** selecionar não significa connected antes do POST. O selo visual do radio representa a seleção; apenas a resposta da API habilita envio. Primeiro CTA aprova os dados exibidos e recota; mudanças exigem confirmação contextual, também revalidada. Erros de recuperação têm retry contextual; não existe botão permanente de novo pedido/recuperação.
- **Assets sociais:** Facebook usa `5561e.svg`. Google recompõe os vetores locais `5f1dc.svg`, `a3c98.svg`, `88a3c.svg`, `75804.svg`, `1174b.svg` em20×20, com offsets derivados das caixas dos próprios paths. Assets originais/manifesto intactos; não foi criado logo por IA nem instalada biblioteca.
- Permanecem diferenças previamente documentadas: quatro artes reutilizadas, quantidades/valores/tokens/datas da API, conteúdo completo adicional no mobile, ações independentes Salvar perfil/Salvar senha, envelope reconstruído e ícones Lucide auxiliares. Antialiasing/pesos/alguns espaçamentos ainda não são equivalência integral pixel a pixel. Não houve novo contexto Figma após o limite registrado.

## Método e capturas

`node scripts/visual-review.mjs final-before` executado antes de editar. `final-after` executado depois das correções. Fixtures: três NFTs/quantidades2,6,9; Ana; principal Ethereum/MetaMask e secundária Polygon/Coinbase; cotação26.846ETH obtida na API. São os mesmos dados usados nos pares de pagamento/carrinho/perfil/carteiras. Nenhum número copiado do Figma para os totais.

Cada conjunto tem as nove telas nas larguras390/414/768/1440, deviceScaleFactor1, reduced-motion; viewport1440×1657,414×896 e390/768×1024. FullPage pode exceder a altura do export; previews do chat redimensionam. Medidas são de PNG original/DOM, não miniaturas. Auth/perfil/carteiras têm exports de outras alturas: comparar áreas locais em escala1, sem alegar equivalência das alturas completas. Auth final aguarda catálogo9cards; a primeira captura before pode mostrar background em carregamento e não serve para comparação pixel a pixel desse background.

| Par relevante | Antes | Depois |
| --- | --- | --- |
| Pagamento1440 | [antes](../artifacts/visual-review/final-before/checkout-1440.png) | [depois](../artifacts/visual-review/final-after/checkout-1440.png) |
| Carrinho1440 | [antes](../artifacts/visual-review/final-before/cart-1440.png) | [depois](../artifacts/visual-review/final-after/cart-1440.png) |
| Detalhe1440 | [antes](../artifacts/visual-review/final-before/detail-1440.png) | [depois](../artifacts/visual-review/final-after/detail-1440.png) |
| Perfil1440 | [antes](../artifacts/visual-review/final-before/profile-1440.png) | [depois](../artifacts/visual-review/final-after/profile-1440.png) |
| Carteiras1440 | [antes](../artifacts/visual-review/final-before/wallets-1440.png) | [depois](../artifacts/visual-review/final-after/wallets-1440.png) |
| Login414 | [antes](../artifacts/visual-review/final-before/login-414.png) | [depois](../artifacts/visual-review/final-after/login-414.png) |

Pastas ignoradas pelo Git, reproduzíveis para o estado atual; originais não alterados. Também há checkout-ready após conexão e walletsempty para comparar cadastro sem seleção. Measurements.json contém overflow/retângulos/foco/reflow por tela. Reflow usa viewport CSS reduzido à metade, com piso320px, simulando o espaço disponível no zoom200% desktop/tablet. É smoke de reflow, não auditoria de zoom nativo/leitor de tela.

Textos/paleta conferidos por contraste relativo WCAG: foreground/ink17.10; secondary/surface8.68; placeholder/ink6.72; ink/primary6.85; accent/surface7.72. Borda#55321F/ink1.71 permanece fiel ao export e requer avaliação de contraste não textual; não certificamos todas as bordas/estados/gradientes. Foco usa outline de alto contraste; testes verificam teclado/diálogos e smoke registra outline/shadow em cada tela. Não equivale à auditoria integral futura.

## Resultados reais

Antes da consolidação: typecheck/lint passaram; testes direcionados de revisão/revalidação18passaram e3skips intencionais em58.3s; catálogo/histórico/scroll/timeout11passaram e1skip em38.5s. Correções de seletores obrigatórios e escopo de alerts foram necessárias; uma rodada com helpers antigos foi interrompida. As falhas não foram aceitas por snapshot novo.

Depois da revisão com exports,24 baselines das telas alteradas foram geradas/revisadas (24/24 em46.8s); as três do recibo permaneceram intactas. Typecheck, lint sem warnings e build demo passaram. Suíte completa executada uma vez após consolidar: **180 passaram,3 skips intencionais,4.6min**, `npx playwright test --workers=6`, sem retry nem update. São153 comportamentais e27 visuais. Skips: Mercado desktop não existe na navbar mobile; fluxo414 não se repete nos projetos desktop/tablet. O fluxo414 passou no projeto mobile, além de390/768/1440 da suíte.

Captura final:36 telas+4checkout-ready+4wallets-empty. Zero overflow normal/reflow nos36 registros; todos registraram outline/shadow de foco. Recibo1440 manteve578×821, x431/y165.6875. Paleta/contraste amostral em artifacts/final-review/contrast.json. Relatório HTML real em playwright-report; abrir `npm run test:report`; traces são mantidos nas falhas conforme configuração. Lighthouse/publicação não executados.
