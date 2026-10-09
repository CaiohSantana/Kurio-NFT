# Cenários de teste e falhas

[Voltar ao README](../README.md). Estes roteiros exercitam a API simulada e os eventos pelo transporte existente. Use dados fictícios e restaure o cenário entre testes independentes.

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

Isso restaura 45 NFTs e duas contas/senhas; limpa carrinhos, favoritos, perfil/avatar/carteiras, sessão, pedidos/timers, configuração/falhas/latência/outage da prova e dos demais mocks e drafts do checkout. Não apaga storage alheio. O reload limpa o cache/listeners do cliente. Reset é destrutivo apenas para os dados fictícios; não o use se quiser recuperar um pedido pendente.

Cada roteiro parte de reset, salvo indicação contrária:

| Cenário | Comando / ação do avaliador | Resultado esperado |
| --- | --- | --- |
| Vazio/URL/histórico | Buscar `inexistente`; depois limpar, combinar filtros, ordenar/paginar, refresh/back/forward | Vazio recuperável; parâmetros/resultados restaurados |
| Lentidão/fora de ordem | `await kurioScenario('catalog','slow',{delay:1500})`; buscar `Kurio`, depois `Emerald` enquanto carrega | Skeleton; consulta antiga não substitui Emerald. Kurio tem atraso determinístico mínimo 900 ms |
| REST503 | `await kurioScenario('catalog','fail')`; mudar para sort ainda não consultado ou dar refresh | Erro com Tentar novamente; retry recupera |
| Transporte REST indisponível | Em `/preparation`: `await kurioScenario('catalog','network-error')`; abrir `/nfts/emerald-042` | Falha de transporte interceptada, erro e retry. Para cotação: `await kurioScenario('commerce','network-error',{target:'quote'})`, abrir carrinho com itens |
| Favorito otimista/rollback | Logado no detalhe: `await kurioScenario('commerce','slow',{delay:1200})`; `await kurioScenario('commerce','fail',{target:'favorites'})`; clicar coração | Estado muda antes da resposta e é restaurado após 503; falha acessível |
| Cadastro/validação | Criar e-mail já usado; preencher perfil/ENS/senha/carteira inválidos | 409/422 e erros associados, sem falso sucesso. API protege mesmo além da validação HTML |
| Sessão expirada durante checkout | Com carteira conectada e draft editado: `await kurioScenario('commerce','expire')`; Confirmar compra | Login explica expiração; retorno ao checkout mantém draft/carrinho e exige seleção de provedor/revisão |
| Preço alterado no carrinho/checkout | `await kurioScenario('catalog','change',{id:'emerald-042'})` | nft.updated chega pelo cliente; REST recota; feedback e reconfirmação contextual antes do envio |
| Edição esgotada | `await kurioScenario('catalog','sold-out',{id:'emerald-042'})` | Item preservado, aviso/compra bloqueada |
| Precisão18 | `await kurioScenario('catalog','price',{id:'emerald-042',priceEth:'0.123456789012345678'})` | Valor string preservado na API/UI; dois itens + KURIO10 + taxa Ethereum totalizam0.238222220222222221ETH |
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

Identificador interno do pedido vem da URL, não do ID abreviado da transação. Endpoints auxiliares de cenários são exclusivos dos mocks. HTTP 4xx comuns são reproduzidos pela UI; os testes de conflito de idempotência e de ownership também verificam respostas dos handlers. A configuração persiste até consumo/reset: fail/network-error são one-shot; slow/coupon-expired/fee-change e hold persistem. `checkout auto` usa confirmed para próximas tentativas; pedidos já terminais não mudam. Não há retry automático de mutations.


## Relatórios, traces e auditoria

Os resultados já entregues estão em [docs/final-delivery.md](final-delivery.md), [correção da integração](integration-initial-rest-fix.md) e [Lighthouse público](audits/lighthouse-public-final/README.md).

Para executar os testes localmente e abrir o relatório gerado:

```sh
npx playwright install chromium
npm run test:e2e
npm run test:report
```

Screenshots e traces locais de falhas ficam em `test-results`; os artefatos da entrega estão versionados em `docs/audits`. Para abrir o relatório consolidado e seu trace preservado:

```sh
npx playwright show-report docs/audits/final-delivery/playwright-full
npx playwright show-trace docs/audits/final-delivery/playwright-full/data/22b680d331ca469128cb59eb8598a194f1180f50.zip
```

A [revalidação pontual da baseline](audits/final-delivery/playwright-navbar-updated/index.html) é distinta da execução consolidada, que registrou a diferença visual. Não apresente os dois resultados como uma única execução inteiramente verde.

O runner `scripts/audit.mjs` usa Lighthouse 12.8.2 e Chromium instalado pelo Playwright. `npm run audit` faz build, inicia preview na porta 4175 e mede início/detalhe × mobile/desktop × três, com mocks e funcionalidades ativos. Cada execução usa perfil temporário, reset de storage e throttling simulado. Feche testes e auditorias concorrentes.

Para preservar uma nova rodada em outra pasta, no PowerShell:

```powershell
$env:AUDIT_OUTPUT = 'docs/audits/minha-auditoria'
npm run audit
```

Para auditar a publicação HTTPS:

```powershell
$env:AUDIT_OUTPUT = 'docs/audits/minha-auditoria-publica'
$env:AUDIT_URL = 'https://kurio-nft-delta.vercel.app'
$env:AUDIT_DEPLOYED_COMMIT = 'SHA_CONFIRMADO_NO_DEPLOYMENT'
npm run audit
```

Substitua `SHA_CONFIRMADO_NO_DEPLOYMENT` pelo commit realmente publicado. Os relatórios Lighthouse públicos finais correspondem ao commit `3242294`, anterior à correção isolada de `/integration`; não são novas medições da versão posterior. A validação direcionada da correção pertence à fonte `963d0e0`, documentada separadamente.
