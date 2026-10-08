# Publicação preparada; URL ainda pendente

Repositório: https://github.com/CaiohSantana/Kurio-NFT.git. Nesta etapa o acesso de escrita foi confirmado por git push --dry-run. O envio final dos commits será registrado após executar o push. Não há URL HTTPS da aplicação verificada. Preview/repositório não equivalem a deploy.

Vercel não possui CLI autenticada, VERCEL_TOKEN nem .vercel/project.json neste ambiente. A etapa depende de login/autorização na conta do usuário. Não foram criados serviços externos nem inventadas credenciais.

## Passos exatos na sua conta

1. Entrar em https://vercel.com/new e selecionar Add New / Project. Conectar sua conta GitHub e importar CaiohSantana/Kurio-NFT. Se não aparecer, liberar esse repositório na instalação GitHub da Vercel.
2. Production Branch: main; Root Directory: raiz; Framework: Vite; Install Command: npm ci; Build Command: npm run build; Output Directory: dist; Node.js:22.x compatível com engines (>=22.14). vercel.json já configura build, fallback SPA e worker no-cache.
3. Environment Variables: VITE_ENABLE_MOCKS=true, para Production e Preview. Nenhum segredo/backend/servidor Socket.IO é necessário. .env.demo já ativa os mocks no comando de build; explicitar a variável na conta evita override inesperado. Variáveis VITE são públicas e substituídas no build.
4. Clicar Deploy. Conferir em Deployment Details o commit da main entregue nesta etapa. Guardar a URL HTTPS. Ainda não marcar DE-02/P03 concluídos.
5. Na pasta do projeto, com dependências/Chromium instalados, executar o smoke na URL real:

```powershell
$env:REVIEW_URL = 'https://SEU-PROJETO.vercel.app'
$env:SMOKE_OUTPUT = 'artifacts/public-delivery-smoke.json'
node scripts/delivery-smoke.mjs
Remove-Item Env:REVIEW_URL, Env:SMOKE_OUTPUT
```

O script usa um contexto próprio e cenários da API, verifica11 rotas com entrada direta/refresh, worker/fonte/artes, REST/evento pela prova, login/carrinho/carteira/compra/recibo confirmado pela API. Não é prova de equivalência com o commit: conferir também Deployment Details na Vercel.

6. Conferir manualmente certificado HTTPS, console sem erros impeditivos e390px: login, filtros/histórico, carrinho, pagamento e recibo. Abrir diretamente /account/profile e /account/wallets; acessar /orders/ID criado na compra e dar refresh. Usar os cenários do README para pedido hold/timeout, sessão expirada e reconexão sem criar outro pedido. /nfts/inexistente e pedido inexistente devem mostrar erro recuperável; não sucesso.
7. Registrar URL, commit, data/resultados do smoke e pendências. Só após verificar essas evidências pode-se declarar publicação concluída.

## Preview local

```sh
npm ci
npx playwright install chromium
npm run build
npm run preview
```

Abrir http://127.0.0.1:4173/ e rotas diretas. Para o smoke local, iniciar preview explicitamente em4176, conforme README/scripts. O smoke desta etapa está em docs/audits/performance-preview.json:11 rotas/quatro recursos locais/recibo confirmado. Isso não verifica HTTPS, cache/CDN ou rewrites da conta Vercel.

Auditoria vigente, source commit e limitações em [performance-closure.md](performance-closure.md). Medidas anteriores continuam preservadas em quality-audit.md. Nenhuma URL pública verificada até este registro.
