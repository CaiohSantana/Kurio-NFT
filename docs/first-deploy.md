# Primeira publicação: preparada, ainda pendente

Remote atual: `https://github.com/CaiohSantana/Kurio-NFT.git`. Não há publicação/URL pública verificada nesta etapa. Configuração local não é deploy. vercel.json define framework Vite, `npm run build`, saída dist, fallback SPA e worker com no-cache. `.env.demo` ativa mocks no build; não é preciso backend/servidor Socket.IO.

## Passos na conta do usuário

1. Conferir `git remote -v`: origin já aponta para o repositório acima; não adicionar origin novamente.
2. Na etapa final de publicação, na pasta do projeto, depois dos commits:

```sh
git push -u origin main
```

Autenticar no GitHub quando solicitado, sem pôr token no arquivo/URL/comando versionado. Nome/e-mail Git já estavam configurados no ambiente; não foram alterados. Esta etapa não executou push nem deploy.

3. Entrar em vercel.com → Add New → Project → importar esse repositório. Autorizar leitura do repositório na própria conta. Root Directory: raiz; Framework: Vite; Build: npm run build; Output: dist; Install: npm ci; Node22.x ou versão compatível com engines do package.json. Variável de build `VITE_ENABLE_MOCKS=true` (Production e Preview). Não adicionar segredos para a demonstração.
4. Na etapa final autorizada de publicação: Deploy. Guardar URL HTTPS e commit correspondente. Abrir diretamente `/`, `/nfts/emerald-042`, `/nfts/inexistente`, `/login`, `/signup`, `/cart`, `/account/profile`, `/account/wallets`, `/checkout`, `/integration` e atualizar cada rota. Criar pedido simulado e abrir/atualizar `/orders/ID_REAL_DA_SIMULACAO`; `/orders/inexistente` deve tratar404 após autenticação.
5. Conferir `/mockServiceWorker.js` como JavaScript, fonte WOFF2 local, assets e filtros/histórico. Disparar change/duplicate/disconnect pelos controles da prova ou endpoint de cenário do README; verificar REST/evento/reconexão na publicação.
6. Conferir login/cadastro/retorno/favoritos, carrinho visitante→login, perfil/carteiras/pagamento/recibo e isolamento entre contas. Usar roteiro/cenários em docs/checkout-validation.md, inclusive pedido pending/timeout/reconnect. Registrar URL/commit/resultados do smoke. Somente após verificar URL pública P03/DE-02 podem ser marcados concluídos.

## Preview local

Preparação de qualidade atual: [quality-audit.md](quality-audit.md), fonte auditada b6fba35 e checkout limpo verificado. Performance mobile ainda está abaixo da meta (86/83); demais categorias Lighthouse100. Os commits de evidências posteriores não mudam a aplicação. Não houve push/deploy nesta etapa. Ao publicar, registrar o commit de entrega e a URL HTTPS e executar o smoke abaixo; a auditoria local não valida os rewrites públicos. Favicon/robots estão explicitamente fora do fallback SPA, junto de worker/assets.

```sh
npm run build
npm run preview
```

Abrir http://127.0.0.1:4173/ e rotas acima. Playwright também sobe o build/preview automaticamente e testa acesso direto/refresh/404. Isso valida o bundle local, não os rewrites/HTTPS/worker da conta Vercel. Suporte ao fallback público só pode ser confirmado após publicar.
