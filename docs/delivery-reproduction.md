# Reprodução da versão entregue em checkout limpo

Executada em 09/10/2026, worktree temporário detached do commit público **5acbfaf02a6c0251644d221963bcfad47200270a**, em `.tmp/delivery-clean-5acbfaf`. Diretório de trabalho principal preservado. Essa fonte tem o mesmo código/configuração do commit auditado `3242294`; a consolidação posterior altera somente documentos/evidências.

| Verificação | Resultado |
| --- | --- |
| Ambiente | Windows 10.0.26300, Node 22.14.0, npm 11.2.0 |
| `npm ci` | Exit 0; 366 pacotes instalados, 367 auditados, 0 vulnerabilidades reportadas pelo npm |
| `npm run build` | Exit 0; typecheck passou, Vite 8.3.3 demo, 2417 módulos, build 1,44 s |
| Arquivos locais privados | Checkout não contém `.env.local`, `.vercel`, node_modules anterior ou configuração da conta; `.env.demo` vem do Git |
| Lockfile/configuração | Instalação por lockfile sem edição de dependências; assets/fontes/worker presentes no dist |
| Suíte/Lighthouse | Não repetidos; resultados anteriores e revalidação pontual preservados, sem mudança de aplicação |

O postinstall do MSW copia novamente o worker gerado. Neste Windows, o arquivo aparece no status do worktree por conversão CRLF/LF; `git diff --exit-code -- public/mockServiceWorker.js` retornou 0, sem diferença de conteúdo normalizado. Lockfile e fontes da aplicação permaneceram iguais; não foi necessária edição manual do worker.

Preview limpo na porta 4186: início, detalhe válido, login e `/integration` tiveram acesso direto e refresh HTTP 200, fontes carregadas e controller MSW ativo. Evento Socket.IO após terminar a consulta inicial sincronizou versão 2. A tentativa durante a consulta inicial revelou a pendência documentada em [interface-review](interface-review.md#pendência-funcional-confirmada-na-prova-técnica), reproduzida em HTTPS; o resultado normal não oculta essa falha. [Registro do preview](evidence/interface-review/clean-preview.json).

Artefatos conferidos: 12 HTML + 12 JSON Lighthouse finais, 27 baselines nos diretórios `tests/*-snapshots`, HTML Playwright completo/pontual e trace ZIP da falha registrada, íntegro com 52 entradas. Links relativos da documentação consolidada e snapshots históricos foram conferidos; [resultado](evidence/interface-review/artifact-check.json).

Comandos equivalentes para o avaliador, usando Node ≥22.14 e <23:

```sh
git clone https://github.com/CaiohSantana/Kurio-NFT.git
cd Kurio-NFT
npm ci
npm run build
npm run preview
```

Não é necessário copiar `.env.example`: os comandos dev/build usam `.env.demo` versionado. `VITE_ENABLE_MOCKS=true` deve permanecer ativo. Não há backend privado ou credencial de serviço necessária. Para testes/auditorias, instalar o Chromium com `npx playwright install chromium`; os comandos e condições estão no README. Essa instalação extra não é necessária para build/preview.

O SHA do commit documental final e o deployment correspondente são informados no fechamento da execução; a equivalência de `src`, `public`, package.json/lockfile, Vite, ambiente e Vercel é conferida antes de enviá-lo. Não declarar que uma instalação anterior testou arquivos de aplicação diferentes.
