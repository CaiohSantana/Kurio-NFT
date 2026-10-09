# Publicação Vercel verificada

**Aplicação: https://kurio-nft-delta.vercel.app/** · [Repositório](https://github.com/CaiohSantana/Kurio-NFT).

Versão publicada/auditada: [3242294e1d4632b68fb9250bc6dc8460a8e473d3](https://github.com/CaiohSantana/Kurio-NFT/commit/3242294e1d4632b68fb9250bc6dc8460a8e473d3), deployment READY `dpl_3M242LpiWcgzrSnxU8YEwQuSxF8G`. Primeiro deployment validado nesta etapa: ceaab3f. Consolidação posterior de documentos/relatórios não altera runtime; o SHA atual consta em Deployment Details.

Projeto existente `caioh-santana/kurio-nft`, GitHub/main, root `.`, Vite, Node22.x, instalação npm ci, build npm run build, saída dist. VITE_ENABLE_MOCKS=true em Production/Preview e .env.demo. Engines ≥22.14 e <23 evita escolher Node24 por range abrangente. Dependências intactas; credenciais/OIDC/.vercel fora do Git. Fallback SPA e worker no-cache preservados. Nenhum backend privado/extensão/pagamento real.

Smokes desktop/mobile HTTPS passaram: 11 rotas por perfil com acesso direto/refresh, assets, login/sessão/logout, carrinho/badge, carteira, compra confirmada pela API, recibo e REST/Socket.IO/duplicatas/reconexão. [Resultados/matriz/limitações](final-delivery.md). Lighthouse público: início91 mobile/100 desktop, detalhe92/100, outras categorias100; [12 HTML/JSON](audits/lighthouse-public-final/README.md). Todas as execuções preservadas, incluindo início86/91/91. Verificações humanas ainda pendentes são distintas dessas evidências.

## Reproduzir no deploy

```powershell
$env:REVIEW_URL='https://kurio-nft-delta.vercel.app'
$env:SMOKE_PROFILE='desktop'
$env:SMOKE_OUTPUT='artifacts/public-desktop.json'
node scripts/delivery-smoke.mjs
$env:SMOKE_PROFILE='mobile'
$env:SMOKE_OUTPUT='artifacts/public-mobile.json'
node scripts/delivery-smoke.mjs
# Sem testes/smokes concorrentes:
$env:AUDIT_URL='https://kurio-nft-delta.vercel.app'
$env:AUDIT_OUTPUT='artifacts/lighthouse-public'
$env:AUDIT_DEPLOYED_COMMIT='SHA_CONFIRMADO_EM_DEPLOYMENT_DETAILS'
node scripts/audit.mjs
```

Smokes usam contextos novos e mocks locais ao navegador. Relatórios registram handlers e erros esperados:404 de NFT inexistente e401 da leitura antiga guest durante autenticação. Não mudam dados de outros visitantes. Login: ana@kurio.test ou bruno@kurio.test / Kurio123!. Carteira fictícia Ethereum/MetaMask:0x1111111111111111111111111111111111111111. Recibo depende da sessão e persistência do mesmo navegador.

`git push origin main` publica pelo repositório conectado; confirmar READY/commit antes de validar HTTPS. Login futuro: `npx.cmd --yes vercel@63.1.0 login`, sem enviar senha/token no chat. Produção não depende do terminal local. Leitor de tela/alto contraste/text-only/Safari iOS exigem conferência humana conforme final-delivery.md.

## Histórico anterior à publicação

Os registros abaixo foram preservados como evidências anteriores e não descrevem o estado atual.

# Publicação preparada; URL ainda pendente

Fonte atual pronta para deploy:47469f7, visuais/carrossel validados, Lighthouse85/99 em ambas as páginas. Revisão mais recente em final-polish.md; configuração Vercel/build/ambiente abaixo permanece igual. Registros de push antigos abaixo são históricos; o push dos commits finais foi executado para origin/main (8135f85 confirmado no remoto), incluindo fonte47469f7 e todos os relatórios. Commits posteriores deste registro alteram apenas documentos. Nenhuma URL da aplicação foi verificada.

Repositório: https://github.com/CaiohSantana/Kurio-NFT.git. Nesta etapa o acesso de escrita foi confirmado por git push --dry-run e os commits foram efetivamente enviados para origin/main. git ls-remote confirmou a33fd5c20e0016e627c7ad4ed4420a5e89be4c4f no remoto; fonte auditada1a5dc91. Commits posteriores deste registro alteram apenas documentação, sem mudar o código auditado. Não há URL HTTPS da aplicação verificada. Preview/repositório não equivalem a deploy.

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
