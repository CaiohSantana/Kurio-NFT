# Publicação Vercel e versão entregue

**[URL HTTPS](https://kurio-nft-delta.vercel.app/)** · **[Repositório](https://github.com/CaiohSantana/Kurio-NFT)**.

Fonte corrigida publicada e conferida: `963d0e00dff05dde3d94fef9f4b64152bddb939e`, deployment READY `dpl_7yYDhZVZ9Nz8XcuCLwB31uLW7VAP`. Corrige somente a reconciliação inicial de `/integration`; validação HTTPS desktop/mobile em [integration-initial-rest-fix](integration-initial-rest-fix.md). Commit documental posterior agrega evidências sem alterar essa fonte; SHA final consta no fechamento e Deployment Details. Fonte Lighthouse anterior: `3242294`, deployment `dpl_3M242LpiWcgzrSnxU8YEwQuSxF8G`; suas métricas não são novas medições da versão corrigida. `5acbfaf`/`8d0baa1` são versões anteriores, preservadas nos registros históricos.

## Configuração vigente

| Item | Valor |
| --- | --- |
| Projeto | `caioh-santana/kurio-nft` |
| Origem | GitHub `CaiohSantana/Kurio-NFT`, main, raiz `.` |
| Framework / Node | Vite / 22.x; engines ≥22.14 e <23 |
| Instalação / build / saída | `npm ci` / `npm run build` / `dist` |
| Ambiente | `VITE_ENABLE_MOCKS=true` em Production/Preview; `.env.demo` versionado |
| Rotas | Fallback SPA em `vercel.json`, preservando API/worker/assets |
| Worker | `/mockServiceWorker.js`, `Cache-Control: no-cache`, HTTPS |

Push em main dispara deployment pela integração GitHub existente. Não há serviço privado ou servidor Socket.IO: REST e WebSocket são interceptados por MSW no navegador. Credenciais/OIDC, `.env.local` e `.vercel` ficam fora do Git. Não alterar engines para outra família Node sem validar.

Após envio documental, conferir READY, branch e `meta.githubCommitSha` no deployment correspondente, HTTPS/rotas. A URL isolada não prova o commit publicado. CLI autenticada disponível nesta execução; caso perca autenticação, `npx --yes vercel@63.1.0 login` requer login do titular. Não enviar tokens por chat.

## Evidências e reprodução

- [Fechamento publicado](final-delivery.md): smokes desktop/mobile, 11 rotas/refresh, assets, sessão, carrinho, carteira, compra/recibo e REST/Socket.IO.
- [Conferência adicional pela UI](interface-review.md): Chrome visível, 1440×900/414×896/440×956, controles/validações/isolamento e achados/limites.
- [Checkout limpo](delivery-reproduction.md): npm ci e build da mesma aplicação sem arquivos privados locais.
- [Lighthouse público final](audits/lighthouse-public-final/README.md): 12 relatórios, início91/100, detalhe92/100, demais categorias100; não repetido nesta consolidação.
- [Histórico integral](history/first-deploy-at-5acbfaf.md): registros antigos de acesso/metas/URL pendentes preservados, sem representar o estado atual.

Credenciais e cenários/reset: [README](../README.md). Roteiro: buscar NFT → edição/quantidade → adicionar → carrinho/cupom → login Ana → cadastrar carteira Ethereum/MetaMask (`0x` + quarenta `1`) → conectar/confirmar → refresh do recibo → logout/troca Bruno. Sucesso exige confirmed pela API simulada. Não há blockchain/gateway real.

Leitor de tela, alto contraste real, ampliação somente de texto e Safari/iOS exigem avaliação humana. Zoom nativo não teve efeito na conferência adicional e permanece pendente nela. A aprovação visual anterior não elimina esses limites.
