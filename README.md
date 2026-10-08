# Kurio — preparação técnica

Esta entrega parcial contém catálogo em `/`, detalhe em `/nfts/emerald-042` e prova isolada em `/integration`. Conta, favoritos autenticados, carrinho e checkout ainda não implementados. Requisitos: [SPEC.md](SPEC.md); acompanhamento: [PLAN.md](PLAN.md); detalhes: [ARCHITECTURE.md](ARCHITECTURE.md). Evidências públicas e diferenças visuais em docs/catalog-validation.md e docs/catalog-visual-review.md.

## Executar

Ambiente verificado: Node 22.14.0, npm 11.2.0, Windows/PowerShell. Use Node >=22.14.0. Dependências fixadas em package.json e package-lock.json.

```sh
npm ci
npx playwright install chromium
npm run dev
```

Abra http://localhost:5173/integration. Inicialmente: 1.19 ETH, estoque 10, versão 1. “Alterar NFT” muda a base dos mocks e emite nft.updated; a interface obtém o novo estado por REST. “Evento duplicado/antigo” aumenta os contadores de recebidos/ignorados sem regredir o NFT. “Interromper conexão” fecha o transporte e recusa novas conexões por 2s; altere o NFT durante a interrupção e observe a reconciliação automática. “Falhar próxima consulta” seguido de “Consultar REST” demonstra 503 e retry. “Reiniciar cenário” restaura a fixture na camada de mocks e recarrega a página.

Persistência desta prova: um NFT em localStorage, por origem do navegador. Sem contas/credenciais nesta etapa. Preço trafega como string; alterações usam centavos inteiros. Não há conexão com blockchain, carteira ou servidor real.

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Vite em modo demo, com mocks |
| `npm run typecheck` | TypeScript estrito, incluindo testes/config |
| `npm run lint` | ESLint, sem warnings aceitos |
| `npm run build` | Typecheck + build otimizado demo com mocks |
| `npm run preview` | Servir dist em localhost:4173 |
| `npm run test:e2e` | Build/preview automático e Playwright Chromium em 390/768/1440 |
| `npm run test:e2e:dev` | Mesma suíte no Vite dev, porta 5174 |
| `npm run test:e2e:ui` | Playwright UI |
| `npm run test:report` | Abrir relatório HTML da execução demo |
| `npx playwright show-report playwright-report-dev` | Relatório dev |
| `npm run msw:init` | Atualizar worker após mudança de versão do MSW |

Relatórios: playwright-report e playwright-report-dev; screenshots/traces de falhas: test-results. Cada teste usa contexto isolado e endpoint de reset. REST é realmente interceptado por MSW; eventos são recebidos pelo socket.io-client. Não são usadas interceptações Playwright para substituir esses transportes.

## Configuração

`.env.demo` contém `VITE_ENABLE_MOCKS=true`, utilizada pelos comandos dev/build. `.env.example` documenta a variável; `.env.*.local` permite override. Com valor false, a prova não inicia worker, cliente ou chamadas de API, e exibe aviso. Não existe backend alternativo configurado. Vite substitui variáveis no build: mudar variável na hospedagem exige rebuild. MSW começa antes de carregar rotas/socket.io-client.

Roboto Mono é local, com origem, checksum e licença em [public/assets/fonts/README.md](public/assets/fonts/README.md). Assets Figma e exports existentes foram preservados.

## Primeiro deploy preparado, ainda não publicado

`vercel.json` configura Vite, build `npm run build`, saída `dist`, fallback SPA e worker sem cache persistente. Assets/worker/API são excluídos do rewrite. REST e socket são simulados no navegador; a hospedagem não precisa de servidor Socket.IO. [Documentação Vercel/Vite](https://vercel.com/docs/frameworks/frontend/vite).

Passos que dependem da conta do usuário:

1. Criar/conectar um repositório remoto (o workspace ainda não possui Git configurado).
2. Importá-lo em um projeto Vercel usando a própria conta, Node 22.x ou superior compatível, build/output do vercel.json. Garantir `VITE_ENABLE_MOCKS=true` no ambiente de build.
3. Publicar e verificar a URL HTTPS: abrir `/integration` diretamente e dar refresh; conferir `/mockServiceWorker.js` como JavaScript; executar alteração/duplicata/outage e conferir REST/reconexão. Conferir fonte local e rota inexistente.
4. Registrar URL pública, commit publicado e resultados do smoke. Sem isso P03/DE-02 permanecem pendentes.

Git agora inicializado localmente; ainda não existe remote/URL pública. Passos exatos em [docs/first-deploy.md](docs/first-deploy.md). Lighthouse e testes dos nove fluxos ficam pendentes. Baselines de início/detalhe já versionadas após revisão manual; carrinho/pagamento ainda não possuem baselines.

## Catálogo e detalhe: roteiro manual

1. `npm run dev`: abrir http://localhost:5173/. Buscar Emerald com Enter; combinar coleções/redes no aside desktop ou botão de filtros mobile. Aplicar faixa de preço, ordenar e paginar; refresh/back/forward conservam estado da URL.
2. Abrir um card ou `/nfts/emerald-042`; alternar galeria/ampliar, escolher1/10 e alterar quantidade. Quantidade5 excede limite4;1/1 está esgotada. Testar `/nfts/inexistente` e recuperação.
3. Rolar no mobile para informações completas/rede/contrato/royalties/relacionados. Compra/favoritos/conta mostram indisponibilidade; não simulam sucesso.
4. Para cenários de rede/eventos, executar no console do navegador (MSW já iniciado):

```js
fetch('/api/__catalog/scenario', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'change', id: 'emerald-042' })
})
```

Trocar action por `duplicate`, `old`, `sold-out`, `disconnect`, `fail`, `slow` (adicionar delay:1500) ou `reset`. Cenários atuam na base/mock de rede; não alteram diretamente React/Query. Após reset, recarregue para limpar cache/eventos locais. Para observar503, selecionar um sort ainda não consultado ou recarregar após fail; retry explícito pela tela.

Regressão visual: `npx playwright test tests/visual.spec.ts`. Baselines Chromium/Windows em390/768/1440. Gerar novas somente após revisão: `npx playwright test tests/visual.spec.ts --update-snapshots`. O teste compara a implementação com sua baseline, não certifica equivalência com Figma.
