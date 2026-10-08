# Kurio — marketplace de NFTs

A aplicação usa dados locais simulados por MSW, incluindo REST e o protocolo Socket.IO. Contas, carteiras, cotações e pedidos não usam blockchain, extensões ou gateways reais. Referências `SIM-…` são fictícias; o explorador do recibo é local e identificado. Diagnósticos ficam em `/integration` ou no console do modo demo.

O enunciado original é a fonte dos requisitos: [docs/challenge-original.md](docs/challenge-original.md). A matriz conferida no código/testes, resultados e pendências estão em [docs/functional-closure.md](docs/functional-closure.md). Consulte também [SPEC](SPEC.md), [PLAN](PLAN.md), [ARCHITECTURE](ARCHITECTURE.md) e a [revisão visual](docs/visual-refinement.md).

## Executar

Ambiente verificado: Windows/PowerShell, Node22.14.0 e npm11.2.0. Use Node >=22.14.0; versões estão fixadas em package.json/package-lock.json.

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

Para comprar: detalhe → adicionar → carrinho → Conectar e finalizar → login. Se não houver carteira, cadastre a principal e clique Retomar fluxo. Exemplo Ethereum/MetaMask: `0x1111111111111111111111111111111111111111`; secundária Polygon/Coinbase: `0x2222222222222222222222222222222222222222`. Endereços fictícios compatíveis com a validação, sem extensão real. Revise os dados, conecte, aceite a cotação e confirme. Sucesso aparece somente após a API confirmar o pedido.

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
| `npx playwright test --workers=6` | Mesma suíte com seis workers, como na execução consolidada |
| `npx playwright test tests/functional-closure.spec.ts` | Cenários críticos acrescentados no fechamento |
| `npm run test:e2e:dev` | Suíte no Vite dev, porta5174 |
| `npm run test:e2e:ui` | Playwright UI |
| `npm run test:report` | Relatório HTML completo em playwright-report |
| `npx playwright show-report playwright-report-dev` | Relatório dev |
| `npm run msw:init` | Atualizar worker após mudar versão de MSW |

Screenshots/traces de falhas ficam em test-results, ignorados pelo Git. Abrir trace com `npx playwright show-trace CAMINHO/trace.zip`. Cada teste usa contexto isolado e reset pelos handlers. A aplicação passa por Axios/MSW; os testes não usam page.route para substituir REST ou setters para simular Socket.IO.

As27 baselines versionadas abrangem início, detalhe, login/cadastro, carrinho, pagamento, recibo, perfil e carteiras nas três larguras. Comparação com baseline é regressão da implementação, distinta da comparação manual com o Figma. Não gerar novas imagens para simplesmente aceitar uma falha. Nesta etapa as baselines foram preservadas.

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
| Sessão expirada durante checkout | Com carteira conectada, draft editado e cotação aceita: `await kurioScenario('commerce','expire')`; Confirmar compra | Login explica expiração; retorno ao checkout mantém draft/carrinho e exige conexão/novo aceite |
| Preço alterado no carrinho/checkout | `await kurioScenario('catalog','change',{id:'emerald-042'})` | nft.updated chega pelo cliente; REST recota; feedback e aceite anterior inválido |
| Edição esgotada | `await kurioScenario('catalog','sold-out',{id:'emerald-042'})` | Item preservado, aviso/compra bloqueada |
| Precisão18 | `await kurioScenario('catalog','price',{id:'emerald-042',priceEth:'0.123456789012345678'})` | Valor string preservado na API/UI; dois itens +KURIO10 +taxa Ethereum totalizam0.238222220222222221ETH |
| Cupom | Aplicar BAD, DROP2025 e KURIO10 no carrinho | Inválido, expirado e desconto10%; remover recupera total sem desconto |
| Cupom expira após revisão | Com KURIO10 já aplicado e aceite marcado: `await kurioScenario('commerce','coupon-expired')`; Confirmar compra | Fresh quote bloqueia, retira desconto e avisa; remover cupom no carrinho e revisar novamente |
| Taxa muda sem evento | Cotação aceita: `await kurioScenario('checkout','fee-change')`; Confirmar compra | Taxa aumenta0.001ETH; não cria pedido até novo aceite |
| Carteira recusa/desconecta | Antes de conectar: `await kurioScenario('checkout','connection-refused')`; Conectar. Liberar: connection-allowed. Para desconectar, Gerenciar → Desconectar | Recusa/desconexão bloqueiam envio. Selecionar rede incompatível retorna erro |
| Pagamento recusado | Antes de enviar: `await kurioScenario('checkout','order-refused')` | Pedido refused, carrinho preservado; Revisar pagamento inicia nova tentativa explícita. Usar auto antes da próxima compra para sucesso |
| Clique repetido | Dblclick em Confirmar compra | Uma requisição de envio e um pedido; backend protege também replays/concorrência |
| Pending/refresh/reconexão | Antes de enviar: `await kurioScenario('checkout','hold')`; enviar e guardar ID da URL `/orders/ID`; refresh. Reexecute helper se necessário | Mesmo pedido pendente; nenhum novo envio |
| Confirmar durante outage | Na rota do pedido: `await kurioScenario('catalog','disconnect')`; `await kurioScenario('checkout','confirm',{id:location.pathname.split('/').pop()})` | Socket reconecta; GET recupera confirmed, mesmo ID |
| Timeout após criação | Antes de enviar: `await kurioScenario('checkout','timeout')`; enviar, aguardar erro (>5s), refresh e Recuperar pedido | Pedido persistido pending, mesma tentativa/chave; confirmar por cenário com ID da URL |
| Duplicata/antigo/terminal | No recibo: checkout duplicate/old/refuse com `{id:ID_DA_URL}` após confirmed | Sem regressão ou nova limpeza; snapshot permanece |
| Adição posterior/snapshot | Criar hold; guardar ID; adicionar mais uma unidade da mesma edição no detalhe; voltar ao pedido; confirmar. Depois alterar preço e refresh | Remove somente quantidade comprada, mantém unidade acrescentada; recibo conserva preço anterior |
| Ownership/isolamento | Guardar URL do recibo de Ana, trocar para Bruno no menu Minha conta; abrir URL antiga |403, sem dados de Ana; carrinho/favoritos/perfil/carteiras isolados |
| Teclado/movimento reduzido | Tab/Enter, abrir diálogo de carteiras/galeria e Escape; habilitar reduced-motion nas ferramentas e cenário slow | Foco visível/trap/restauração, campos associados; shimmer parado |

Identificador interno do pedido vem da URL, não do ID abreviado da transação. Endpoints auxiliares de cenários são exclusivos dos mocks. HTTP4xx comuns são reproduzidos pela UI; os testes de conflito de idempotência e de ownership também verificam respostas dos handlers. A configuração persiste até consumo/reset: fail/network-error são one-shot; slow/coupon-expired/fee-change e hold persistem. `checkout auto` usa confirmed para próximas tentativas; pedidos já terminais não mudam. Não há retry automático de mutations.

## Configuração e limites

`.env.demo`: `VITE_ENABLE_MOCKS=true` nos comandos dev/build. `.env.example` documenta override; variáveis são substituídas no build e exigem rebuild. Com false, a aplicação não inicia APIs/socket e informa ausência de backend. MSW começa antes de importar rotas/socket.io-client; requer localhost/HTTPS.

Cache real: catálogo/detalhe/favoritos staleTime30s; recursos privados/cotação staleTime0; sessão Infinity com timer/401 e recuperação inicial. Retryfalse nas queries/mutations, recuperação explícita por UI. Leituras recebem AbortSignal. Reconexão invalida recursos ativos; pedido tem polling2s somente enquanto pending. Contratos, validação de identidade e limites do transporte WebSocket em ARCHITECTURE. Estado de negócio persiste somente nos mocks; drafts de checkout não incluem senha.

Roboto Mono local, origem/checksum/licença em [public/assets/fonts/README.md](public/assets/fonts/README.md). Quatro artes/exports originais preservados. Envelope reconstruído e documentado em public/assets/icons/README.md. Persistência multiaba e servidor real não fazem parte da simulação.

## Auditorias e publicação pendentes

O desafio ainda não está completo. Faltam instalação/validação de checkout limpo, auditoria integral de acessibilidade/contraste/zoom, runner/comando/configuração Lighthouse e12 medições com HTML/JSON/medianas/LCP/CLS/TBT, ajustes visuais finais documentados e URL pública HTTPS verificada. Não existe comando Lighthouse implementado nesta etapa.

Vercel já tem configuração em vercel.json: build Vite/demo, saída dist, fallback SPA e worker sem cache persistente. Nenhum push/deploy nesta etapa. Publicação depende da conta do usuário: enviar os commits para o origin configurado, importar na Vercel, usar Node22.x compatível e VITE_ENABLE_MOCKS=true no build; publicar e verificar rotas diretas/refresh, worker/assets, REST e Socket.IO. Registrar URL e commit. Passos em [docs/first-deploy.md](docs/first-deploy.md); preview local não equivale a deploy.
