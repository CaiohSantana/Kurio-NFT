# Especificação do desafio

## Auditoria de qualidade vigente

ST/EL-01: stack efetivamente exercitada incluindo Lighthouse; critérios funcionais preservados. QA-01/02: checkout limpo da fonte b6fba35, 186 passados/3 skips, 27 baselines. UI-03: corrigidos contraste/nome/alvo/foco/zoom ao vivo; verificações manuais com leitor de tela/alto contraste permanecem pendentes. QA-03: 12 medições finais, A11y/BP/SEO 100; Performance início/detalhe mobile 86/83, desktop 100/99, portanto parcial. DE-01 verificado localmente; DE-02 URL pública pendente. Evidências atuais em docs/quality-audit.md prevalecem sobre as pendências históricas abaixo; desafio ainda não completo.

## Revisão final das nove telas

Verificação consolidada: typecheck/lint/build passaram;180 testes passaram e3 skips intencionais em4.6min, incluindo27 visuais sem update.24 baselines afetadas foram revisadas antes de gerar; recibo intacto. Capturas36 telas nas quatro larguras e smoke de reflow/foco sem overflow. Limites/amostras/checklist em docs/final-screen-review.md.

Apontamentos, decisões de obrigatoriedade/ENS, capturas, desvios e verificações em [docs/final-screen-review.md](docs/final-screen-review.md). Revisão usa exports, preserva contratos e comportamentos; nova conexão ocorre por seleção explícita de registro/provedor e resposta da API. CTA normal confirma o resumo e recota; alterações têm diálogo de nova confirmação. Pending é recuperado pela API após refresh/timeout, sem controls permanentes. UI-01/03 e QA-02 continuam parciais quanto à equivalência integral/contraste não textual/zoom nativo; Lighthouse e publicação não executados nesta etapa.

## Fechamento funcional vigente

Matriz de requisitos, aceite, implementação conferida e testes em [docs/functional-closure.md](docs/functional-closure.md). Corrigidos precisão18 no incremento de preço, revalidação de cupom expirado/taxa mutável, falha real de transporte REST, reset integral, trava de clique repetido e shimmer comum. Novos testes cobrem envio com sessão expirada/retomada, cotação, precisão, reset e rede; feedback de expiração/estado do pedido acessível. Resultados reais estão na matriz, sem extrapolar para auditorias ou produção. Composição visual/baselines preservadas. EL-01 segue parcial porque Lighthouse ainda não participa efetivamente; QA-03, DE-02 e certificação de checkout limpo continuam pendentes.

## Revisão visual vigente

UI-01/02/03 e QA-02 ampliados: checkout/formulário/resumo e modal de confirmação revisados contra os exports, com dados da API; perfil/carteiras/mobile preservam campos e fluxos. Textos técnicos/genéricos de simulação removidos do produto; política registrada em AGENTS. Typecheck/lint/build passaram;150/150 E2E em3,7min,390/768/1440, incluindo27 visuais sem update. Ajustes finais:18/18 conta e12/12 pagamento/recibo passaram nas verificações direcionadas. Comparação manual adicional em414 e capturas antes/depois/medidas/desvios em [docs/visual-refinement.md](docs/visual-refinement.md). Idempotência, cotação, sessão, pedidos, isolamento e Socket.IO continuam cobertos. SVG original da confirmação/contextos bloqueados, fidelidade integral, auditorias finais e publicação seguem pendentes; não marcar gates EL/DE concluídos.

## Entrega anterior — perfil, pagamento e pedidos

Verificação executada: typecheck/lint/build passaram; suíte144/144 em6,1min no preview,390/768/1440, com33 pagamento/pedido,12 conta e21 regressões visuais. Relatório e composição em docs/checkout-validation.md. Esses resultados não substituem Lighthouse, auditorias finais ou publicação.

FL-08/09 implementados e testados: perfil/avatar/senha/carteiras privadas. FL-02 agora inicia `/checkout` por COMPRAR; FL-03 integra cotação e limpeza parcial confirmada. FL-04/05 implementados na simulação: conexão/revisão/aceite, criação idempotente, pending/confirmed/refused, recuperação e snapshot. IN-06/07 e RT-01/02 incluem pedidos privados/versionamento/reconciliação. Evidências reais, limites e roteiro em [docs/checkout-validation.md](docs/checkout-validation.md). Gates finais EL-01, QA-03, DE-01/02 e fidelidade integral não concluídos.

| Critérios | Evidência desta entrega | Limite de aceite |
| --- | --- | --- |
| FL-08/09 |12 E2E perfil/avatar/senha/carteiras, validação, persistência, isolamento; carteiras selecionáveis no pagamento. | Ajustes visuais e auditoria integral finais. |
| FL-04/05; IN-04/06/07 | Compra, reaceite após preço/estoque, recusa/desconexão, concorrência409, timeout/refresh, snapshot, limpeza parcial. | Somente simulação; sem pagamento real. |
| IN-02/05; RT-01/02 | Socket.IO público/privado, REST após reconnect, antigos/duplicados/terminais, ownership e sessão atrasada. | Transporte mock documentado; não servidor de produção. |
| UI/QA parciais |390/768/1440, campos/teclado/foco, revisão PNG e baselines de pagamento/recibo. | Lighthouse, contraste/zoom e fidelidade restantes. |

## Evidências históricas (não descrevem o estado atual)

FL-08/09: perfil/avatar/senha e carteiras principal/secundária/reutilização, validação/persistência/isolamento e adaptação mobile implementados;12/12 E2E passaram. Evidência em docs/account-validation.md. Integração das carteiras no pagamento segue em execução; Lighthouse/publicação/ajustes visuais finais continuam pendentes.

Correções FL-01/FL-03/ST-02/03/UI-03: navegação Mercado e demais retornos ao catálogo preservam URL/histórico, DOM e scroll/reduced-motion; badge global soma quantidades da query do carrinho e respeita troca de sessão.78/78 testes comportamentais passaram, com evidência em docs/navigation-cart-fixes.md. Perfil/carteiras/pagamento/pedidos foram autorizados na sequência; não considerar sua autorização evidência de implementação.

Status: base e prova de integração executadas em 2026-10-07. Evidências e alcance parcial em [docs/proof-validation.md](docs/proof-validation.md). Os nove fluxos, gates finais e critérios completos de marketplace permanecem pendentes; não extrapolar a prova de um NFT para a aplicação inteira.

Etapa catálogo/detalhe anterior: comportamentos públicos FL-01 implementados e testados; FL-02 então parcial. Evidências históricas em [docs/catalog-validation.md](docs/catalog-validation.md); revisão/desvios em [docs/catalog-visual-review.md](docs/catalog-visual-review.md).

Atualização 2026-10-08: sessão/login/cadastro/favoritos e carrinho/cotação implementados; `npm run test:e2e` passou84/84 no build preview, incluindo30 cenários de commerce,24 catálogo,15 prova e15 visuais nos três tamanhos. Detalhe adiciona ao carrinho e COMPRAR abre `/cart`; envio ao checkout/pedidos continuam pendentes. Evidências, roteiro e desvios em [docs/commerce-validation.md](docs/commerce-validation.md); decisões em ARCHITECTURE.md. Gates dos nove fluxos, fidelidade integral, Lighthouse e deploy não estão concluídos.

## Evidências desta etapa (escopo parcial do desafio)

| Critério | Verificado em 2026-10-08 | Pendência |
| --- | --- | --- |
| FL-02 / IN-03 | Favoritos autenticados persistem; intenção retoma edição/quantidade; mutation otimista e rollback503. Adicionar valida estoque/edição e compra abre carrinho. | Início real do pagamento/compra. |
| FL-03 / MK-01 / IN-04 | Visitante persiste; quantidade/remoção/cupom/cotação exata; transferência única com replay; itens esgotados/excesso preservados; eventos recotam. | Vínculo com revisão/pedido, taxa por carteira/rede no pagamento. |
| FL-06 / FL-07 | Cadastro/422/confirmação/409, login/401, refresh, returnTo seguro, expiração inclusive refresh, logout/troca. Hash sem senha em persistência. | Retomada de checkout/tentativa de pedido, ainda não implementados. |
| IN-02 / IN-05 / RT-01 / RT-02 | Cache por scope, cancelamento/cleanup, mutation atrasada recebe401 sem afetar nova conta; uma conexão ativa/zero no teardown. Estado API único para NFT/favoritos/carrinho. Eventos duplicados/antigos e reconexão verificados. | Perfil/carteiras/pedidos/eventos privados futuros. |
| IN-01 / UI-01/02/03 / QA-01 / QA-02 | Slow/skeleton/vazio/erro/retry; 390/768/1440, labels, teclado/foco/Escape e overflow;30 commerce + verificações públicas/prova preservadas;15 baselines revisadas e regressão passou sem update. | Auditoria completa de acessibilidade, páginas futuras e baseline de pagamento. |
| ST / DE-03 | Stack preservada, contratos/arquitetura/cenários/credenciais/comandos documentados; typecheck/lint/build e84E2E passaram. | Gates completos EL-01, QA-03 Lighthouse, DE-01 checkout limpo e DE-02 URL pública. |

As evidências acima são operações realmente executadas, não aceite das partes futuras de cada requisito. Nomes exatos de IDs abrangentes permanecem nas tabelas originais abaixo.

## Fontes e limites

- Requisitos funcionais/técnicos: [enunciado preservado](docs/challenge-original.md), seções 1–12. A mensagem de recrutamento e a pergunta final são contexto, não requisitos de produto.
- Referência visual: [análise do Figma](docs/design-reference.md), cópia `y1ACuUlG8c6eRylaa4qWI2` e exports em `Frontend Challenge/`. Propostas neste documento não modificam a fonte original.
- Escopo: nove telas, descoberta, compra e conta, desktop/tablet/mobile. Blockchain, extensões e pagamentos reais excluídos. Páginas editoriais, suporte, atividade, ofertas e downloads excluídos.
- Interfaces auxiliares fora do escopo devem informar indisponibilidade ou levar a destino real coerente, sem falso sucesso. Newsletter, OAuth real, scanner e estúdio do criador não serão implementados. Botões sociais da referência terão aviso explícito de ação fora do escopo, sem criar sessão; login/cadastro REST continuam completos. Favoritos pertencem ao fluxo obrigatório.

## Stack e responsabilidades

| ID | Obrigação / critério de aceite | Verificação prevista |
| --- | --- | --- |
| ST-01 | React e TypeScript em toda a interface; contratos tipados entre DTOs, mocks, estado e componentes. | Typecheck estrito, build e revisão dos contratos. |
| ST-02 | TanStack Router controla rotas, parâmetros da URL, guards e retorno após login. | E2E de acesso direto, refresh, histórico e proteção. |
| ST-03 | TanStack Query controla consultas, mutations, cache e sincronização; React local guarda apenas interações/drafts. | Revisão de ownership e E2E de isolamento/invalidação. |
| ST-04 | Todas as chamadas REST passam por Axios e são interceptadas por MSW; componentes/hooks não possuem dados ou caminhos de negócio fictícios. | E2E pela rede, registro dos handlers e revisão. |
| ST-05 | Socket.IO é exercitado por socket.io-client; MSW simula protocolo, eventos e falhas. | Prova inicial, E2E de eventos/reconexão e smoke publicado. |
| ST-06 | Tailwind CSS e shadcn/ui participam efetivamente: tokens/estilos e primitivas acessíveis de formulários, diálogos, drawers e seleções adaptadas ao Figma. | Revisão, screenshots e teclado/foco. |
| ST-07 | Playwright executa E2E e regressão visual; Lighthouse audita o build real. | Comandos reproduzíveis, relatórios e baselines. |

Proposta de build: Vite, npm e lockfile; versões serão escolhidas e fixadas após a prova de compatibilidade. Organização prevista: `src/app` (bootstrap, rotas e providers), `src/features/{catalog,cart,checkout,orders,auth,profile,wallets}`, `src/shared/{api,ui}` e `src/mocks` (estado, handlers, cenários e eventos). Contratos ficam junto à funcionalidade; somente tipos realmente compartilhados vão para shared. Sem store global adicional.

## Nove telas e critérios de aceite

| ID / rota | Critério de aceite | Verificação prevista |
| --- | --- | --- |
| FL-01 Início `/` | Destaques, catálogo, busca, coleções/redes combináveis, faixa de preço, ordenação e paginação. URL validada contém `q`, `collections`, `networks`, `minPrice`, `maxPrice`, `sort`, `page`; filtros reiniciam page=1. API recebe esses parâmetros; refresh/back/forward restauram resultados. Respostas obsoletas não vencem a busca atual. | E2E busca+combinação+ordem+paginação+histórico; vazio, 500, latência fora de ordem; visual desktop/mobile. |
| FL-02 Detalhe `/nfts/$nftId` | Acesso direto, galeria com seleção/ampliação, dados/atributos, edição, quantidade inteira válida, favoritos autenticados e compra. 404 recuperável; edição esgotada e limite impedem ação inválida. Comprar adiciona a seleção ao carrinho e inicia checkout; adicionar ao carrinho permite continuar. Favorito persiste e faz atualização otimista com rollback. | E2E detalhe direto/404/edição/limite, galeria, favorito sucesso/falha/refresh; visual. |
| FL-03 Carrinho `/cart` | Visitante pode adicionar/alterar/remover; API valida estoque por NFT+edição. Persistência após refresh; login preserva/mescla itens do visitante uma única vez. Aplicar/remover cupom válido, inválido e expirado. Subtotal/desconto/taxa/total retornados pela cotação; evento altera resumo e informa usuário. | E2E quantidades/remover/cupom/merge/reload, vazio, conflitos e evento. Visual. |
| FL-04 Pagamento `/checkout` | Autenticado; dados do colecionador e campos do layout validados, carteira cadastrada e rede selecionadas, conexão/recusa/desconexão simuladas. Revisão mostra itens e cotação antes de enviar. Revalidação de preço/estoque/cupom/taxa exige novo aceite se mudar. Cliques repetidos e retry após timeout não duplicam pedido. | E2E compra completa e cada falha; price-change via socket; visual. |
| FL-05 Confirmação `/orders/$orderId` | Consulta privada do pedido. Pending mostra espera/recuperação; refused mostra recusa e preserva carrinho; somente confirmed mostra sucesso/recibo. Snapshot imutável de itens, quantidades, valores, taxas, total, data, transação e carteira. Refresh/reconexão recuperam mesmo pedido. Link de exploração explicitamente simulado. | E2E pending/reconnect/reload/refused/confirmed/404/403, alteração posterior de preço, isolamento e limpeza parcial do carrinho. |
| FL-06 Login `/login` | E-mail/senha validados, erros REST, sessão recuperável, retorno interno seguro à rota/contexto anterior. Sessão expirada no checkout não perde carrinho nem tentativa existente. Logout e troca de conta limpam cache privado e listeners. | E2E login/401/expiração/returnTo/logout/troca/refresh. |
| FL-07 Cadastro `/signup` | Nome de usuário/e-mail/senha/confirmação, validação e conflito. Conta persiste; retorno ao fluxo com sessão conforme contrato. Credenciais fictícias; senhas não persistidas em claro. | E2E criação/login posterior, 409, 422, confirmação divergente e persistência. |
| FL-08 Perfil `/account/profile` | Dados de exibição/usuário/e-mail/ENS/apelido, avatar alterar/remover e senha atual/nova/confirmação. Validação local/REST; alterações confirmadas persistem após refresh; erro mantém draft; senha antiga deixa de autenticar após mudança. | E2E dados/avatar/senha/422/reload, teclado e mobile. |
| FL-09 Carteiras `/account/wallets` | Cadastrar/editar principal e secundária; nome/apelido, rede, endereço, tipo, perfil/e-mail/ENS/indicação presentes no layout. Validar endereço conforme rede, duplicidade e erros REST; persistir; checkout usa registros atualizados. “Igual à principal” reutiliza a seleção, sem duplicar registro. | E2E criar/editar/erro/refresh, estado vazio e seleção no checkout. |

## Integração, valores e consistência

| ID | Critério de aceite | Verificação prevista |
| --- | --- | --- |
| IN-01 | Carregamento, vazio, erro, sucesso e atualização em segundo plano; retry acessível sem perder dados/contexto. Rotas inexistentes e recursos ausentes têm recuperação. | E2E cenários lentos/offline/404/500 e retry. |
| IN-02 | Query keys incluem parâmetros completos e identidade do usuário; cancelar requisições Axios via signal ou descartar obsoletas. Logout cancela/remove cache privado e fecha socket antes da nova sessão; API verifica ownership. | E2E fora de ordem, usuário A/B, 403 e evento atrasado da sessão anterior. |
| IN-03 | Favorito otimista cancela consultas conflitantes, guarda snapshot e restaura em falha; sucesso/eventos invalidam recursos afetados. | E2E observando UI antes/depois de resposta 500 e refetch. |
| IN-04 | ETH no transporte é string decimal; quantidades inteiras. Mocks calculam com unidades inteiras de precisão definida (proposta: 18 casas/BigInt), nunca float; transporte continua JSON com strings. UI formata sem alterar valor. | Verificações de precisão/fronteira e E2E de subtotal/desconto/taxa/total. |
| IN-05 | Catálogo, favoritos, carrinho, perfil, carteiras e pedidos têm fonte única na simulação persistida; REST e socket usam a mesma transição de estado/versionamento. Componentes não copiam remoto para context/useState. | E2E evento seguido de GET/reload e reset completo. |
| IN-06 | Tentativa de pedido tem chave persistida por usuário e payload estável; chave igual+payload igual retorna mesmo pedido; diferente retorna conflito. Timeout mantém chave. Cotação revisada é vinculada à tentativa; nova revisão não reaproveita chave com payload distinto. | E2E duplo clique, timeout após criação, refresh e 409 por chave alterada. |
| IN-07 | Estados pending → confirmed/refused; terminais não regridem. Snapshot do pedido é congelado. Confirmação remove somente quantidades compradas uma única vez na simulação; itens acrescentados durante pending ficam. | E2E duplicatas, eventos antigos e carrinho alterado durante compra. |

Política inicial histórica (substituída pela política real de ARCHITECTURE): staleTime de 30s para catálogo/detalhe e 0 para recursos privados/cotação; refetch ao focar/reconectar para recursos ativos. Consultas somente leitura: até 2 retries em conexão/5xx, sem retry de 4xx; mutations sem retry automático. Pending reconcilia por GET ao retornar/reconectar/refresh, com consulta periódica de recuperação se o socket falhar. Documentar parâmetros finais em ARCHITECTURE.md. Persistência de negócio fica nos mocks, não em uma segunda cópia do cache Query. Guard consulta sessão antes de renderizar dados privados.

Sessão inicial histórica (contrato real em ARCHITECTURE): token opaco e sessão na simulação, expiração configurável, hash de senha com salt (Web Crypto) no estado persistido; drafts nunca incluem senha na persistência. Avatar fictício armazenado pela API simulada com validação de formato/tamanho. Persistência local serve apenas à demonstração. Merge do carrinho visitante é idempotente e valida estoque; excessos geram aviso sem perda silenciosa.

## Contratos iniciais (históricos; implementados em ARCHITECTURE)

| Recurso | REST proposto | Dados/erros essenciais |
| --- | --- | --- |
| Sessão/conta | POST `/api/accounts`, POST/GET/DELETE `/api/session` | Usuário, sessão/expiração; validação, conflito, 401. Expiração também por cenário. |
| NFTs | GET `/api/nfts`, GET `/api/nfts/:id` | Filtros validados, paginação/total, galeria, edições/estoque/preço/version; 404. |
| Favoritos | GET `/api/favorites`, PUT/DELETE `/api/favorites/:nftId` | Escopo autenticado, validação, falha transitória. |
| Carrinho | GET `/api/cart`, POST `/api/cart/items`, PATCH/DELETE `/api/cart/items/:id` | NFT+edição, quantity, version; visitante ou usuário; conflitos de estoque. Merge na autenticação com identificador de carrinho visitante. |
| Cotação | POST `/api/quotes` | Itens, cupom ou remoção, carteira/rede; quoteId/version/validade, preços, desconto, taxa/total, alterações; 409/422. |
| Pedidos | POST `/api/orders`, GET `/api/orders/:id` | Header Idempotency-Key, quoteId/version, dados revisados e fingerprint; pending/confirmed/refused, snapshot; 401/403/404/409. |
| Perfil | GET/PATCH `/api/profile`, PUT/DELETE `/api/profile/avatar`, PATCH `/api/profile/password` | Dados/avatar/hash de senha na simulação; erros por campo. |
| Carteiras | GET/POST `/api/wallets`, PATCH `/api/wallets/:id` | Principal/secundária, rede/provider/endereço/dados; ownership/validação/conflito. |
| Conexão simulada | POST/DELETE `/api/wallet-connection` | walletId/rede/provider, connected/refused/disconnected; sem integração real. |

Erros tipados: `code`, `message`, `fieldErrors?`, `retryable?`, `currentVersion?`. Cobrir 400/422 (validação), 401 (sessão), 403 (permissão), 404, 409 (cadastro/estoque/idempotência/cotação), 5xx e erro de transporte. Contratos detalhados serão documentados e tipados antes dos handlers.

Eventos mínimos: `nft.updated` e `order.updated`, envelope com eventId estável, resourceId, version, payload e escopo de sessão/usuário quando privado. Controle monotônico por recurso: ignorar duplicata/versão antiga; não reaplicar limpeza do carrinho; invalidar/refazer consultas filtradas e cotação para considerar mudanças de ordenação/estoque. Reconexão reconcilia recursos ativos por REST antes de considerar dados atuais. Registrar/liberar listeners no ciclo de vida da sessão.

## Resolução inicial das diferenças do design

- Checkout desktop mantém formulário+resumo; mobile preserva cards de carteiras/provedores e acrescenta seções “Dados” e “Revisão” antes do envio. Os mesmos campos, schema e regras servem a todos os tamanhos. Review não é uma décima página obrigatória, mas seção do pagamento.
- Todos os campos do layout continuam disponíveis. Nome de exibição, e-mail, nome de usuário/perfil e carteira/rede/provider são validados; campos duplicados são ligados ao mesmo dado canônico. ENS/secundária, indicação e observação opcionais. Regras específicas não dadas pelo enunciado (limites de texto, senha e avatar) devem ser documentadas como decisões, não atribuídas à fonte.
- Carteira principal é pré-selecionada quando válida; usuário pode escolher secundária/trocar. Provider é propriedade da carteira, rede deve ser compatível. Sem carteira: CTA cadastra em Carteiras e retorna ao checkout, preservando draft não sensível. Endereço/rede modificados precisam ser salvos/confirmados no cadastro, sem inventar carteira efêmera paralela.
- Ambos os tamanhos oferecem MetaMask, WalletConnect e Coinbase simulados; seleção não é prova de conexão. Recusa/desconexão bloqueiam compra até reconectar. Mudança de carteira/rede invalida cotação/revisão.
- Uma fixture canônica por cenário define IDs, nomes, artes, edições, disponibilidade e preços para todos os tamanhos. Corrigir tokens #0042/#0314/#0088, nomes repetidos em cards e rótulos contrato/royalties; não copiar totais diferentes do desktop/mobile para o mesmo carrinho. Cenários visuais separados podem reproduzir cada composição, com valores sempre calculados e consistentes.
- Perfil/carteiras em mobile: uma coluna, navegação de conta compacta e formulários roláveis. Confirmação: resultado e itens empilhados, dados do mesmo snapshot. Tablet adapta grid/formulários sem esconder requisitos.
- Galeria usa os assets fornecidos, inclusive reutilizações da referência; não gerar novas artes. Detalhes extensos podem ficar em tabs/acordeão no mobile. Área fixa de compra/navegação reserva espaço para o conteúdo.
- Exploração da transação abre um detalhe identificado como simulado (no próprio recibo), sem enviar hash falso ao Etherscan. Compartilhamento pode usar URL local/clipboard com feedback real; botões indisponíveis não simulam sucesso.

## Mocks, cenários e tempo real

| ID | Critério de aceite | Verificação prevista |
| --- | --- | --- |
| MK-01 | MSW inicializa antes do consumo de REST/socket. Mesmos contratos, fixtures e cenários em dev/demo/teste, ativação por configuração no build publicado; reset integral. ≥2 usuários e catálogo suficiente para múltiplas páginas/filtros. | Smoke dev/build/URL e E2E isolado por cenário. |
| MK-02 | Cenários determinísticos: sucesso, vazio, lentidão/latência variável/fora de ordem, conexão indisponível, 4xx/5xx, sessão expirada/não autorizada, conflito de cadastro/validação, cupom inválido/expirado, preço alterado/esgotado, timeout após criação, confirmado/recusado. | Testes por cenário com relógio, latência e eventos controlados. |
| RT-01 | MSW+binding compatível recebe conexão real do socket.io-client, emite ambos os eventos e compartilha estado REST; sem setter/callback direto como substituto do socket. | Prova bloqueante inicial e E2E pelo transporte. |
| RT-02 | Preço/estoque muda com NFT no carrinho, UI informa e recota; checkout bloqueia aceite antigo. Duplicatas/antigos ignorados, reconexão recupera pendente e sessão antiga é isolada. | E2E cenário completo, reconexão/refresh e usuário A/B. |

Proposta inicial histórica, já comprovada localmente em docs/proof-validation.md e docs/functional-closure.md; HTTPS ainda pendente: transporte WebSocket explícito, namespace padrão, eventos JSON de texto, sem acknowledgements ou anexos binários. O [binding oficial](https://github.com/mswjs/socket.io-binding#limitations) documenta essas limitações; compatibilidade de versões e reconnect real ainda não verificados. A prova deve verificar handshake, MSW/worker no build, reconexão automática e interceptação sob HTTPS. Se não funcionar, investigar integração compatível sem substituir o requisito por atualizações diretas de UI.

## Interface e acessibilidade

| ID | Critério de aceite | Verificação prevista |
| --- | --- | --- |
| UI-01 | Tipografia/paleta/imagens/proporções/composição do Figma; assets e fontes locais, desvios documentados. Nove telas usáveis em 390, 768 e 1440; comparar também 414 com export mobile. | Revisão visual, screenshots, mobile/tablet/desktop e manifesto de assets. |
| UI-02 | Skeletons dimensionados com shimmer em catálogo/detalhe/resumo de carrinho e demais regiões remotas. Movimento reduzido elimina animação; background refresh não apaga conteúdo. | E2E lentidão/retry/reduced-motion e CLS. |
| UI-03 | Teclado, foco visível, trap/restauração de foco de diálogo/drawer; labels/erros associados, semântica, alt, contraste, feedback acessível de mutation/socket e estados além da cor. Sem overflow indevido ou perda com zoom. | E2E teclado/foco/formulários; inspeção manual zoom 200%, contraste e auditoria. |

## Testes, auditorias, eliminatórios e entrega

| ID | Critério de aceite | Evidência prevista |
| --- | --- | --- |
| QA-01 | Playwright cobre todos FL/IN/MK/RT: catálogo+histórico; detalhe direto/404; cadastro/login/expiração/logout/troca; favorito+rollback; carrinho/cupom/refresh/login; compra+recibo; recusa/duplo clique/timeout; perfil/avatar/senha/carteiras+erros; socket preço/estoque/duplicata/antigo/desconexão/pendente; teclado/foco; skeleton/falha/retry. | Suíte Chromium desktop/mobile executável, relatório HTML e traces nas falhas. |
| QA-02 | Cada teste parte de estado isolado/reset conhecido; relógio/latência/eventos controlados. REST pelos handlers e realtime pelo socket.io-client; observar UI e resultados reais da operação simulada. Baselines versionadas de início/detalhe/carrinho/pagamento com dados/fontes/tempo estáveis. | Reexecução consistente, screenshots revisadas; não aceitar baseline automaticamente. |
| QA-03 | Lighthouse início/detalhe × mobile/desktop × 3 execuções = 12 auditorias no build otimizado com mocks padrão e funcionalidades reais. Medianas: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥90. | HTML/JSON, configuração versionada, versões/ambiente/condições, LCP/CLS/TBT; justificar abaixo da meta e causas. |
| EL-01 | Uso efetivo de toda stack; fluxos principais funcionais; sucesso somente da simulação; isolamento entre usuários; eventos via socket; E2E executável. Qualquer ausência é eliminatória. | Gate final com evidências de ST/FL/IN/RT/QA, sem marcar atendido por dependência instalada. |
| DE-01 | Fonte/lockfile/assets/mocks/fixtures/testes/config auditoria; executar de checkout limpo sem serviços privados/backend real. | Instalação limpa futura, typecheck/lint/build/E2E/auditoria. |
| DE-02 | Deploy obrigatório; URL pública e repositório; publicado corresponde ao commit entregue e permanece acessível. Rotas diretas/refresh, REST e realtime funcionam publicados. | Primeiro deploy cedo, smoke final HTTPS e registro do commit/URL. |
| DE-03 | README: setup/env/credenciais fictícias/cenários/reset/comandos/falhas. ARCHITECTURE: contratos REST/eventos, sessão/carrinho/cache/reconciliação, limitações/UX/desvios. | Checklist documental contra fonte e execução dos comandos. |

Comandos dev com mocks, build, preview, typecheck, lint e Playwright disponíveis em package.json e README. Lighthouse ainda pendente;27 baselines já versionadas e preservadas nesta etapa. Pesos de avaliação: visual 20, fluxos 20, integração 15, realtime 10, mocks 10, testes 10, acessibilidade 5, performance 5, arquitetura/documentação 5.

## Rastreabilidade e pendências

Rastreabilidade da fonte: §§1–3 → FL-01/09 e limites; §2 → ST-01/07; §4 → IN-01/03; §5 → contratos e IN-06; §§6–7 → MK-01/02, RT-01/02, IN-05/07; §8 → UI-01/03; §9 → QA-01/02; §10 → QA-03; §11 → EL-01; §12 → DE-01/03. Regras monetárias/sessão/pedidos de §3 também estão em IN-02/04/06/07.

1. Funcional: conferir matriz de fechamento e resultados reais em docs/functional-closure.md; instalação de checkout limpo ainda não certificada. Não há backend/blockchain real exigido.
2. Visual/acessibilidade: contexto Figma limitado, SVG original do envelope e fidelidade integral; auditoria completa de contraste/zoom/leitor de tela/CLS ainda pendente.
3. Lighthouse: runner/comando/configuração e12 medições/HTML/JSON/medianas/LCP/CLS/TBT ainda não executados.
4. Publicação: Vercel/origin configurados, sem push ou URL pública HTTPS verificada; registrar commit publicado e smoke das rotas/mocks/socket.
5. Assets/fontes/exports/licenças/enunciado/lockfile preservados. Prazo original de dois dias sem início explícito; não inventar data de entrega.
