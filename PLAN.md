# Plano de execução

Status: etapa pública de catálogo/detalhe autorizada e executada após bootstrap. P00/P01 concluídos; P02 aplicada a catálogo/detalhe para nft.updated. P03 preparada sem URL pública. P04/P05 parciais, P07 comportamentos públicos concluídos, P08 parcial sem favoritos/compra. P06/P09–P16 pendentes. Evidências em docs/catalog-validation.md; parar ao fim desta etapa.

## Ordem e critérios de conclusão

| Etapa | Dependência | Trabalho pequeno | Conclusão verificável |
| --- | --- | --- | --- |
| P00 Documentação/assets | Atual | Preservar fonte, referência, SPEC, regras e manifesto de assets; registrar pendências. | Arquivos revisados, cópia original conferida e downloads auditados. Não equivale a requisitos implementados. |
| P01 Bootstrap | Autorização futura, P00 | Vite/React/TS, Router/Query/Axios, Tailwind/shadcn, MSW, Playwright, scripts e lockfile; fixar versões. | Typecheck/lint/build e primeiro E2E de página/handler MSW; componentes acessíveis adaptáveis. |
| P02 Prova Socket.IO | P01 | Provar socket.io-client + MSW + binding no navegador, namespace padrão/eventos texto/WebSocket. Um estado mock é atualizado, emite nft.updated/order.updated e GET retorna mesma versão. Testar desconexão/reconexão e cleanup. | E2E observa UI via eventos do cliente real e verifica REST; funciona dev e preview/build. Nenhum setter substitui socket. Documentar versões, transporte e limitações; incompatibilidade bloqueia integração posterior. |
| P03 Primeiro deploy | P02 | Publicar esqueleto com mocks e prova de rede, rewrite SPA e assets locais. | HTTPS: rota direta/refresh, worker inicializado, REST e socket/reconnect funcionando. Registrar URL/commit; não esperar todas as telas. |
| P04 Contratos e simulação | P02 | DTOs por funcionalidade, erros, ETH exato, catálogo variado/2 usuários, persistência, reset e cenários controlados; estado único REST/eventos. | Verificações de precisão/versão/idempotência/reset; E2E de cenário/configuração e erros de rede. |
| P05 Base visual | P03/P04 | Tokens, fontes locais, shell desktop/mobile, navegação, botões, campos, diálogos/drawers e skeletons/reduced-motion. | Comparação do início com referências 1440/414 e inspeção 390/768; teclado/foco sem overflow. |
| P06 Sessão e autenticação | P04/P05 | Cadastro/login/logout, guards/returnTo, expiração, persistência, cache por usuário e cleanup socket. | E2E criação/conflito/validação/refresh/expiração/troca A/B. Sessão anterior não vaza dados. |
| P07 Catálogo | P04/P05 | Destaques/lista, busca/filtros combinados/sort/page no Router; Query/Axios, cancelamento/vazio/erro. | E2E histórico/refresh/fora de ordem/skeleton/retry; baseline início desktop/mobile. |
| P08 Detalhe e favoritos | P06/P07 | Galeria, dados/edição/quantidade, adicionar/comprar; favorito otimista. | E2E direto/404/esgotado/limite/rollback/persistência; baseline detalhe. |
| P09 Carrinho e cotação | P08 | Quantidade/remover/cupom/cotação, persistir visitante e merge único no login; eventos de preço/estoque. | E2E refresh/login/cupom inválido/expirado/conflito/precision/evento; baseline carrinho. |
| P10 Perfil | P06/P05 | Formulário/dados/avatar/senhas em desktop e uma coluna mobile. | E2E salvar/erro/refresh/avatar removido/senha atualizada; teclado e 390/768/1440. |
| P11 Carteiras | P10/P04 | Principal/secundária criar/editar, validar endereço/rede/provider; vazio e igual à principal. | E2E erros/persistência; registros disponíveis no pagamento; sem duplicação de estado. |
| P12 Pagamento/revisão | P09/P11 | Dados equivalentes desktop/mobile, carteira/rede/conexão, revisar cotação e revalidar. | E2E recusa/desconexão/sem carteira/session-expired, mudanças exigem novo aceite; baseline pagamento. |
| P13 Pedido/recibo | P12 | Idempotência persistida, pending/confirmed/refused, recuperação timeout/refresh/reconnect, snapshot e limpeza parcial. | Compra completa e E2E repetição/timeout/antigos/duplicatas/403/recusa/terminal; recibo jamais fabricado pela UI. |
| P14 Falhas e qualidade | P06–P13 | Completar matriz QA-01/02, cenários rede, visual e acessibilidade de todas telas; ajustes justificados. | Chromium desktop/mobile, 390/768/1440, baselines revisadas, HTML/traces e zoom/contraste/foco. |
| P15 Lighthouse | P14 | Auditar build padrão: 2 páginas × 2 perfis × 3 execuções; corrigir causas e repetir somente afetados. | Medianas/metas, LCP/CLS/TBT, relatórios HTML/JSON e ambiente/config versionados; sem atalhos para pontuar. |
| P16 Entrega | P15 | README/ARCHITECTURE, comandos, limitações, checkout limpo, deploy final e correspondência commit. | Gate EL-01 e DE-01/03; URL pública testa rotas/refresh/mocks/socket e coincide com repositório. |

P10/P11 podem anteceder P08/P09 se necessário, mantendo dependências. Não delegar trabalho a agentes sem solicitação explícita. Testes entram na etapa do fluxo; P14 consolida cobertura, não inicia testes do zero.

## Validação e commits por etapa

1. Antes de cada etapa, selecionar IDs de SPEC e critérios a provar.
2. Implementar somente o escopo da etapa; registrar decisões/limitações em ARCHITECTURE e evidências no plano.
3. Executar typecheck/lint e verificações relevantes; build quando bootstrap/dependências/integração mudarem; E2E do fluxo e falhas novas. Não criar testes que apenas espelham markup.
4. Corrigir falhas antes do commit; revisar diff e arquivos não intencionais. Um commit coerente por etapa, sem misturar mudanças do usuário; manter falhas pendentes explícitas.
5. Publicar marcos após a prova inicial e os fluxos principais; smoke de HTTPS a cada mudança de rede/rotas/worker.

Git inicializado nesta etapa em main, usando identidade preexistente; base técnica preservada em commit inicial e entregas de dados/UI/documentação separadas. Dependências/segredos/relatórios/artefatos temporários ignorados; baselines revisadas versionadas. Publicação e repo remoto continuam dependentes da conta do usuário.

## Acompanhamento da etapa técnica

- P01: React/TS/Vite/Router/Query/Axios, Tailwind/shadcn, MSW condicional, lockfile, Roboto Mono local e scripts preparados; typecheck/lint/build verificados.
- P02: prova `/integration`, REST → base MSW → nft.updated via binding → socket.io-client → refetch REST; eventos duplicados/antigos, desconexão/reconexão, erro 503/retry, refresh, cleanup e heartbeat testados. order.updated, sessão, estoque/cotação/carrinho e pedido não implementados.
- P03: vercel.json e passos README; acesso direto/refresh provados no preview, ainda sem smoke HTTPS público. Conta/repositório/URL dependem do usuário.
- P04 em diante: nenhum fluxo iniciado. Sem baselines dos frames nem Lighthouse.

## Acompanhamento da etapa catálogo/detalhe (substitui o item histórico anterior)

- P04 parcial: 45 NFTs, filtros/paginação/edições, estado persistido compartilhado com a prova; handlers REST, cenários determinísticos de lentidão/503/update/outage/reset. Dois usuários e recursos privados não implementados.
- P05 parcial: shell, hero/cards/filtros/promoções/blog/rodapé, detalhe adaptado em390/768/1440, fonte/arte locais, teclado/modal/reduced-motion. Medidas bloqueadas e diferenças visuais registradas.
- P07: busca/filtros/preço/sort/page/tab na URL, validar entradas, histórico/refresh, Query/Axios/cancelamento, loading/empty/error/retry/background e nft.updated. Testes observam UI e REST/MSW/Socket.IO.
- P08 parcial: identificador direto, galeria/zoom, texto completo mobile, edição indisponível/quantidade/404, relacionados e eventos/reconexão. Favoritos autenticados/compra permanecem fora desta autorização.
- P14 parcial: testes públicos e seis baselines home/detail revisadas; não cobre carrinho/pagamento/nove telas. P15 Lighthouse não iniciado.
- P03: fallback Vercel mantido; preview testa rotas diretas e refresh. Guia de publicação em docs/first-deploy.md; sem URL pública verificada.
