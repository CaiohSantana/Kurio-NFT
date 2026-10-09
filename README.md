# Kurio — marketplace de NFTs

**[Aplicação publicada](https://kurio-nft-delta.vercel.app/)** · **[Repositório](https://github.com/CaiohSantana/Kurio-NFT)**

Catálogo, detalhe, login/cadastro, favoritos, carrinho, pagamento, confirmação, perfil e carteiras estão implementados com API simulada por MSW. REST usa Axios e eventos usam o protocolo Socket.IO pelo socket.io-client; não há backend privado, pagamento ou blockchain real. Dados persistem por origem/navegador; não são compartilhados entre dispositivos ou abas. O explorador do recibo é local e identifica a referência fictícia.

## Versão entregue e evidências

- **Commit auditado por Lighthouse:** `3242294e1d4632b68fb9250bc6dc8460a8e473d3`.
- **Fonte da correção publicada e validada:** [963d0e0](https://github.com/CaiohSantana/Kurio-NFT/commit/963d0e00dff05dde3d94fef9f4b64152bddb939e), deployment READY `dpl_7yYDhZVZ9Nz8XcuCLwB31uLW7VAP`. Corrige somente a reconciliação da prova `/integration`. Commits documentais posteriores não mudam essa implementação; conferir o SHA atual em Deployment Details ou `git log -1`. **A fonte Lighthouse 3242294 é anterior à correção**; não são novas medições nem equivalência integral de src com a versão atual.
- **Validação final anterior:** typecheck/build passaram; suíte completa **221 passados, 1 diferença da baseline da barra mobile aprovada, 3 skips**. Somente essa baseline foi revisada/atualizada; o caso pertinente passou **1/1**. Não apresentar o primeiro resultado como uma execução inteira verde. [HTML completo e trace da diferença](docs/audits/final-delivery/playwright-full/index.html), [revalidação pontual](docs/audits/final-delivery/playwright-navbar-updated/index.html).
- **Lighthouse público final:** início mobile/desktop **91/100**, detalhe **92/100**; Accessibility, Best Practices e SEO **100**. Três execuções por combinação, todas as 12 preservadas em HTML/JSON: [tabela, métricas e condições](docs/audits/lighthouse-public-final/README.md), [metadata](docs/audits/lighthouse-public-final/summary.json).
- **Conferência adicional pela interface:** Chrome visível, desktop 1440×900, mobile 414×896 e 440×956; controles, validações, isolamento e compra/recibo passaram. Um erro de atualização do registro do Service Worker apareceu sem impedir operações. [Resultados, capturas e limites](docs/interface-review.md).
- **Reprodução anterior (5acbfaf):** [instalação/build em checkout limpo](docs/delivery-reproduction.md). Não foram repetidos suíte completa ou Lighthouse nesta consolidação.

Fonte de requisitos: [enunciado original](docs/challenge-original.md), [SPEC](SPEC.md), [PLAN](PLAN.md), [matriz funcional](docs/functional-closure.md) e [fechamento com evidências finais](docs/final-delivery.md). Contratos e responsabilidades: [ARCHITECTURE](ARCHITECTURE.md). Publicação: [docs/first-deploy.md](docs/first-deploy.md).

Pendências humanas: leitor de tela, alto contraste real, ampliação apenas de texto, zoom nativo nesta conferência e Safari/iOS. Aprovação visual do usuário e score Lighthouse não equivalem a certificação WCAG integral. [Histórico preservado](docs/history/README-at-5acbfaf.md) contém as antigas metas/publicação/funcionalidades pendentes; esses registros não descrevem a versão atual.

**Lacuna inicial de `/integration` corrigida:** cancelar a leitura anterior antes de invalidar garante reconciliação REST automática. Teste determinístico falhou antes e passou depois; **27/27 testes direcionados**, lint/typecheck/build e validação HTTPS desktop/mobile passaram. [Causa, resultados e capturas](docs/integration-initial-rest-fix.md). Suíte completa/Lighthouse anteriores permanecem históricos, sem repetição nesta correção. Login anterior: testes passaram e usuário confirmou funcionamento, mas a causa original não foi confirmada; [investigação separada](docs/login-investigation.md).

## Executar

Ambiente verificado: Windows/PowerShell, Node22.14.0 e npm11.2.0. Use Node >=22.14.0 e <23; versões estão fixadas em package.json/package-lock.json.

```sh
npm ci
npx playwright install chromium
npm run dev
```

Abra http://localhost:5173/. Credenciais fictícias: `ana@kurio.test` e `bruno@kurio.test`, senha `Kurio123!` para ambos. Cadastro cria outras contas locais. Use dados fictícios. Cupom `KURIO10`:10%; `DROP2025`: expirado; demais códigos: inválidos.

| Rota | Fluxo |
| --- | --- |
| `/` | Destaques, catálogo, busca/filtros/ordem/página na URL |
| `/nfts/emerald-042?edition=ten&quantity=2` | Galeria, dados, edição, quantidade, favorito e compra |
| `/cart` | Itens, quantidades, cupom e cotação |
| `/checkout` | Carteira/rede, dados, conexão, revisão e envio autenticado |
| `/orders/ID_DO_PEDIDO` | Pedido privado pending/confirmed/refused e snapshot |
| `/login`, `/signup` | Autenticação/cadastro e retorno ao contexto anterior |
| `/account/profile`, `/account/wallets` | Perfil/avatar/senha e duas carteiras |
| `/integration` | Prova independente REST/Socket.IO e diagnóstico |
| `/preparation` | Entrada técnica sem consultas privadas; útil para reset |

Para comprar: detalhe → adicionar → carrinho → Conectar e finalizar → login. Se não houver carteira, cadastre a principal e clique Retomar fluxo. Exemplo Ethereum/MetaMask: `0x1111111111111111111111111111111111111111`; secundária Polygon/Coinbase: `0x2222222222222222222222222222222222222222`. Endereços fictícios compatíveis com a validação, sem extensão real. Revise os dados e selecione o provedor da carteira cadastrada para iniciar a conexão. Aguarde a resposta e clique Confirmar compra; cotação alterada pede confirmação contextual. Sucesso aparece somente após a API confirmar o pedido.

Busca/filtros/sort/página sobrevivem a refresh/back/forward; filtro reinicia página. Edição e quantidade válida ficam na URL do detalhe. Favoritar exige login e retoma a intenção. Logout cria visitante vazio e preserva os dados privados na API; outra conta não recebe esse carrinho. Login concilia o visitante uma única vez, somando itens por NFT+edição e mantendo excessos/esgotados para ajuste, sem cortes silenciosos. Repetir login não repete a transferência.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Vite demo com mocks |
| `npm run typecheck` | TypeScript estrito de src/testes/config |
| `npm run lint` | ESLint sem warnings |
| `npm run build` | Typecheck e build otimizado demo |
| `npm run preview` | Servir dist em http://localhost:4173 |
| `npm run test:e2e` | Build/preview automático e Chromium390/768/1440 |
| `npx playwright test tests/functional-closure.spec.ts` | Cenários críticos acrescentados no fechamento |
| `npm run test:e2e:dev` | Suíte no Vite dev, porta5174 |
| `npm run test:e2e:ui` | Playwright UI |
| `npm run test:report` | Relatório HTML completo em playwright-report |
| `npx playwright show-report playwright-report-dev` | Relatório dev |
| `npm run audit` | Build demo +12 auditorias Lighthouse; HTML/JSON/medianas em docs/audits/lighthouse-performance |
| `npm run msw:init` | Atualizar worker após mudar versão de MSW |

Screenshots/traces de falhas ficam em test-results, ignorados pelo Git. Abrir trace com `npx playwright show-trace CAMINHO/trace.zip`. Cada teste usa contexto isolado e reset pelos handlers. A aplicação passa por Axios/MSW; os testes não usam page.route para substituir REST ou setters para simular Socket.IO.

Checklist final, capturas e decisões em [docs/final-screen-review.md](docs/final-screen-review.md).

As 27 baselines versionadas ficam em `tests/*-snapshots`. Regressão automatizada compara a implementação com essas imagens; a comparação com os exports do Figma é uma revisão visual distinta. A última revalidação alterou somente a baseline do Início mobile, conforme evidência acima.

## Cenários críticos sem editar código

Use o console do navegador em uma página já inicializada; aguarde carregar a UI ou o link de `/preparation`. Os comandos abaixo atuam nos handlers MSW, não em React/Query. Não exigem modificar arquivos, dependências ou localStorage manualmente. Reexecute o helper após um refresh/navegação de documento, pois ele não é persistido.

```js
window.kurioScenario = async (area, action, extra = {}) => {
  const response = await fetch(`/api/__${area}/scenario`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...extra })
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message)
  return result
}
```

Reset integral: abra `/preparation`, aguarde o link e execute:

```js
await fetch('/api/__scenario/reset', { method: 'POST' }).then(r => {
  if (!r.ok) throw new Error('Reset falhou')
})
location.href = '/'
```

Isso restaura45 NFTs e duas contas/senhas; limpa carrinhos, favoritos, perfil/avatar/carteiras, sessão, pedidos/timers, configuração/falhas/latência/outage da prova e dos demais mocks e drafts do checkout. Não apaga storage alheio. O reload limpa o cache/listeners do cliente. Reset é destrutivo apenas para os dados fictícios; não o use se quiser recuperar um pedido pendente.

Cada roteiro parte de reset, salvo indicação contrária:

| Cenário | Comando / ação do avaliador | Resultado esperado |
| --- | --- | --- |
| Vazio/URL/histórico | Buscar `inexistente`; depois limpar, combinar filtros, ordenar/paginar, refresh/back/forward | Vazio recuperável; parâmetros/resultados restaurados |
| Lentidão/fora de ordem | `await kurioScenario('catalog','slow',{delay:1500})`; buscar `Kurio`, depois `Emerald` enquanto carrega | Skeleton; consulta antiga não substitui Emerald. Kurio tem atraso determinístico mínimo900ms |
| REST503 | `await kurioScenario('catalog','fail')`; mudar para sort ainda não consultado ou dar refresh | Erro com Tentar novamente; retry recupera |
| Transporte REST indisponível | Em `/preparation`: `await kurioScenario('catalog','network-error')`; abrir `/nfts/emerald-042` | Falha de transporte interceptada, erro e retry. Para cotação: `await kurioScenario('commerce','network-error',{target:'quote'})`, abrir carrinho com itens |
| Favorito otimista/rollback | Logado no detalhe: `await kurioScenario('commerce','slow',{delay:1200})`; `await kurioScenario('commerce','fail',{target:'favorites'})`; clicar coração | Estado muda antes da resposta e é restaurado após503; falha acessível |
| Cadastro/validação | Criar e-mail já usado; preencher perfil/ENS/senha/carteira inválidos | 409/422 e erros associados, sem falso sucesso. API protege mesmo além da validação HTML |
| Sessão expirada durante checkout | Com carteira conectada e draft editado: `await kurioScenario('commerce','expire')`; Confirmar compra | Login explica expiração; retorno ao checkout mantém draft/carrinho e exige seleção de provedor/revisão |
| Preço alterado no carrinho/checkout | `await kurioScenario('catalog','change',{id:'emerald-042'})` | nft.updated chega pelo cliente; REST recota; feedback e reconfirmação contextual antes do envio |
| Edição esgotada | `await kurioScenario('catalog','sold-out',{id:'emerald-042'})` | Item preservado, aviso/compra bloqueada |
| Precisão18 | `await kurioScenario('catalog','price',{id:'emerald-042',priceEth:'0.123456789012345678'})` | Valor string preservado na API/UI; dois itens +KURIO10 +taxa Ethereum totalizam0.238222220222222221ETH |
| Cupom | Aplicar BAD, DROP2025 e KURIO10 no carrinho | Inválido, expirado e desconto10%; remover recupera total sem desconto |
| Cupom expira após revisão | Com KURIO10 já aplicado e valores revisados: `await kurioScenario('commerce','coupon-expired')`; Confirmar compra | Fresh quote bloqueia, retira desconto e avisa; remover cupom no carrinho e revisar novamente |
| Taxa muda sem evento | Cotação exibida: `await kurioScenario('checkout','fee-change')`; Confirmar compra | Taxa aumenta0.001ETH; não cria pedido até novo aceite |
| Carteira recusa/desconecta | Antes de conectar: `await kurioScenario('checkout','connection-refused')`; selecionar o radio do provedor. Liberar: connection-allowed. Para desconectar, Usar outra carteira? → Desconectar | Recusa/desconexão bloqueiam envio. Selecionar rede incompatível retorna erro |
| Pagamento recusado | Antes de enviar: `await kurioScenario('checkout','order-refused')` | Pedido refused, carrinho preservado; Revisar pagamento inicia nova tentativa explícita. Usar auto antes da próxima compra para sucesso |
| Clique repetido | Dblclick em Confirmar compra | Uma requisição de envio e um pedido; backend protege também replays/concorrência |
| Pending/refresh/reconexão | Antes de enviar: `await kurioScenario('checkout','hold')`; enviar e guardar ID da URL `/orders/ID`; refresh. Reexecute helper se necessário | Mesmo pedido pendente; nenhum novo envio |
| Confirmar durante outage | Na rota do pedido: `await kurioScenario('catalog','disconnect')`; `await kurioScenario('checkout','confirm',{id:location.pathname.split('/').pop()})` | Socket reconecta; GET recupera confirmed, mesmo ID |
| Timeout após criação | Antes de enviar: `await kurioScenario('checkout','timeout')`; enviar; a resposta original falha após5s, mas evento/GET podem recuperar o pedido antes. Refresh ou abrir /checkout retomam automaticamente o ID | Pedido persistido pending, mesma tentativa/chave; confirmar por cenário com ID da URL |
| Duplicata/antigo/terminal | No recibo: checkout duplicate/old/refuse com `{id:ID_DA_URL}` após confirmed | Sem regressão ou nova limpeza; snapshot permanece |
| Adição posterior/snapshot | Criar hold; guardar ID; adicionar mais uma unidade da mesma edição no detalhe; voltar ao pedido; confirmar. Depois alterar preço e refresh | Remove somente quantidade comprada, mantém unidade acrescentada; recibo conserva preço anterior |
| Ownership/isolamento | Guardar URL do recibo de Ana, trocar para Bruno no menu Minha conta; abrir URL antiga |403, sem dados de Ana; carrinho/favoritos/perfil/carteiras isolados |
| Teclado/movimento reduzido | Tab/Enter, abrir diálogo de carteiras/galeria e Escape; habilitar reduced-motion nas ferramentas e cenário slow | Foco visível/trap/restauração, campos associados; shimmer parado |

Identificador interno do pedido vem da URL, não do ID abreviado da transação. Endpoints auxiliares de cenários são exclusivos dos mocks. HTTP4xx comuns são reproduzidos pela UI; os testes de conflito de idempotência e de ownership também verificam respostas dos handlers. A configuração persiste até consumo/reset: fail/network-error são one-shot; slow/coupon-expired/fee-change e hold persistem. `checkout auto` usa confirmed para próximas tentativas; pedidos já terminais não mudam. Não há retry automático de mutations.


## Auditoria e artefatos da entrega

O runner `scripts/audit.mjs` usa Lighthouse 12.8.2 e Chromium do Playwright (versões no lockfile). `npm run audit` faz build otimizado, inicia preview próprio na porta 4175 e executa início/detalhe × mobile/desktop × três. Cada execução usa perfil temporário, reset de storage padrão e throttling simulado, com mocks, Socket.IO, fontes e imagens ativos; não há versão simplificada. Feche testes/auditorias concorrentes. Defina uma pasta nova para não sobrescrever evidências:

```powershell
$env:AUDIT_OUTPUT = 'docs/audits/minha-auditoria'
npm run audit
```

Para auditar HTTPS, defina também `AUDIT_URL=https://kurio-nft-delta.vercel.app` e `AUDIT_DEPLOYED_COMMIT` com o SHA confirmado no deployment. Resultados já entregues: [12 HTML/JSON públicos](docs/audits/lighthouse-public-final/README.md), [ambiente/medianas](docs/audits/lighthouse-public-final/summary.json). Não foi feita nova rodada nesta consolidação.

Relatório Playwright da execução completa preservada:

```sh
npx playwright show-report docs/audits/final-delivery/playwright-full
npx playwright show-trace docs/audits/final-delivery/playwright-full/data/22b680d331ca469128cb59eb8598a194f1180f50.zip
```

O HTML inclui anexos e trace da falha de baseline registrada. [Revalidação somente da baseline](docs/audits/final-delivery/playwright-navbar-updated/index.html). A configuração continua com `trace: retain-on-failure` e screenshot em falha; resultados temporários locais ficam ignorados, enquanto relatórios/traces exigidos estão versionados em `docs/audits`. Baselines são Chromium/Windows; execução em outros sistemas não foi comprovada.

Históricos completos: [README anterior](docs/history/README-at-5acbfaf.md), [arquitetura anterior](docs/history/ARCHITECTURE-at-5acbfaf.md), [publicação anterior](docs/history/first-deploy-at-5acbfaf.md). Mantêm evidências sem repetir pendências antigas como estado atual. Avaliações humanas ainda pendentes e roteiro: [conferência da interface](docs/interface-review.md#verificações-não-executadas--limites).
