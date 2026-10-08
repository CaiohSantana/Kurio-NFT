# Primeira publicação: preparada, ainda pendente

Não há remote Git, projeto Vercel autenticado nem URL pública verificada. Configuração local não é deploy. vercel.json define framework Vite, `npm run build`, saída dist, fallback SPA e worker com no-cache. `.env.demo` ativa mocks no build; não é preciso backend/servidor Socket.IO.

## Passos na conta do usuário

1. Criar um repositório vazio na própria conta GitHub (sem README/lockfile gerados pelo site para evitar conflito). Copiar a URL fornecida pelo site.
2. Na pasta do projeto, depois dos commits desta etapa:

```sh
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```

Substituir o marcador pela URL real. Autenticar no GitHub quando solicitado, sem pôr token no arquivo/URL/comando versionado. Nome/e-mail Git já estavam configurados no ambiente; não foram alterados.

3. Entrar em vercel.com → Add New → Project → importar esse repositório. Autorizar leitura do repositório na própria conta. Root Directory: raiz; Framework: Vite; Build: npm run build; Output: dist; Install: npm ci; Node22.x ou versão compatível com engines do package.json. Variável de build `VITE_ENABLE_MOCKS=true` (Production e Preview). Não adicionar segredos para a demonstração.
4. Deploy. Guardar a URL HTTPS retornada e o commit correspondente. Abrir diretamente `/`, `/nfts/emerald-042`, `/nfts/inexistente`, `/login`, `/signup`, `/cart`, `/integration` e atualizar cada rota.
5. Conferir `/mockServiceWorker.js` como JavaScript, fonte WOFF2 local, assets e filtros/histórico. Disparar change/duplicate/disconnect pelos controles da prova ou endpoint de cenário do README; verificar REST/evento/reconexão na publicação.
6. Conferir login/cadastro/retorno/favoritos, carrinho visitante→login e isolamento entre as duas contas fictícias. Registrar URL/commit/resultados do smoke em docs/commerce-validation.md. Somente após essa verificação P03/DE-02 podem ser marcados concluídos.

## Preview local

```sh
npm run build
npm run preview
```

Abrir http://127.0.0.1:4173/ e rotas acima. Playwright também sobe o build/preview automaticamente e testa acesso direto/refresh/404. Isso valida o bundle local, não os rewrites/HTTPS/worker da conta Vercel. Suporte ao fallback público só pode ser confirmado após publicar.
