# Correção da reconciliação inicial de /integration

Fonte da correção: **963d0e00dff05dde3d94fef9f4b64152bddb939e**. Versão anterior com a falha: `8d0baa1` (mesmo código da prova em `5acbfaf`). URL: https://kurio-nft-delta.vercel.app/. Layouts, assets, mocks e componentes do marketplace preservados.

## Causa confirmada e alcance

O handler REST captura o NFT antes de esperar 650 ms. Durante essa primeira leitura, o mock pode alterar a base e emitir nft.updated. O listener antigo chamava somente `invalidateQueries`; TanStack Query 5.104.1 reaproveita uma leitura em andamento quando não há dados em cache (`query-core/src/query.ts`, condição `state.data !== undefined` para cancelar refetch). Assim, o evento chegava, mas o snapshot inicial versão 1 permanecia sem nova leitura automática.

O novo teste falhou antes da correção recebendo `{version:1,priceEth:'1.19',available:10}` em vez de versão 2. [HTML da reprodução](audits/integration-initial-rest/red/index.html), com screenshot e trace anexados. Não se atribui o problema a rede/cache de navegador/credenciais.

`use-nft-socket` pertence somente à prova. Catálogo/detalhe/cotações do carrinho usam `features/catalog/use-catalog-socket`, que já cancela consultas antes de invalidar. Axios, MSW, estado canônico e socket.io-client são compartilhados, mas não eram a origem desta falha. Nenhum desses módulos precisou ser alterado. Testes direcionados verificaram também os fluxos de atualização/reconexão do marketplace.

## Correção mínima

No listener da prova, eventos válidos e connect/reconnect agora aguardam `cancelQueries(nftKey)` antes de `invalidateQueries(nftKey)`. Axios consome AbortSignal; o snapshot anterior não conclui a consulta cancelada. Uma guarda de efeito ativo evita iniciar nova leitura após desmontagem. Descarte de eventos antigos/duplicados e structuralSharing de versão continuam preservados.

O caminho permanece: controle → Axios POST → handler MSW altera a base → binding emite Socket.IO → socket.io-client recebe identidade/versão → Query cancela/invalida → Axios GET → MSW retorna dados atuais. Não há preço injetado no cache, setter de NFT, DTO fabricado ou evento sintético no teste/UI.

## Verificação local

- `npm run lint`: passou.
- `npm run typecheck`: passou.
- Build demo Vite (`npm exec vite build -- --mode demo` após typecheck): passou, 2417 módulos, 827 ms. É a mesma etapa Vite do comando `npm run build`; não se repetiu typecheck local.
- Teste novo: controla apenas os timers com `page.clock` para manter a resposta MSW inicial pendente, aciona **Alterar NFT** pela interface, observa evento real e resposta REST versão 2, avança o timer anterior e verifica ausência de regressão. Antes da correção: **1 falhou**; depois, a seleção pertinente: **27/27 passaram** em 1,6 min, Chromium desktop/mobile/tablet (1440/390/768).
- Seleção: seis casos de integration por viewport (corrida inicial, carregamento/duplicata/antigo, reconexão, 503/refresh/fontes, cleanup/reduced-motion e heartbeat); três casos por viewport de catálogo/detalhe/carrinho com eventos/reconexão/recotação. [HTML da validação](audits/integration-initial-rest/green/index.html).
- Sem suíte completa, Lighthouse ou alteração de baseline.

Reprodução dos testes direcionados no setup padrão:

```sh
npx playwright test tests/integration.spec.ts tests/catalog.spec.ts tests/commerce.spec.ts --grep "an event before|REST, loading|transport outage|503 is visible|route teardown|Engine.IO heartbeat|reconnect cancels|Socket.IO"
```

A execução registrada usou configuração temporária que serve o dist já construído por preview, mantendo os três projetos e os testes, para não repetir build. O comando padrão acima prepara build/preview conforme playwright.config.ts.

## Versões e limites dos relatórios

A suíte completa anterior (221 passados, 1 baseline aprovada antiga, 3 skips; revalidação pontual 1/1) e as 12 medições Lighthouse pertencem à aplicação anterior; Lighthouse auditou **3242294**, com início91/100 e detalhe92/100. Não são medições novas da correção. Apenas o código da prova foi alterado; não se afirma equivalência integral de src com a fonte auditada nem se atribuem novos scores à versão atual.

Login anterior é uma investigação separada: testes de Ana/Bruno, refresh, visitante, logout/isolamento e senha inválida passaram; o usuário confirmou login funcionando. **A causa original de “Falha de conexão” não foi confirmada.** Esta correção não é apresentada como solução para aquele relato. [Evidências separadas](login-investigation.md).

## Publicação e validação HTTPS

Deployment **READY `dpl_7yYDhZVZ9Nz8XcuCLwB31uLW7VAP`**, GitHub/main, fonte `963d0e0`, verificado na URL HTTPS. Chrome instalado **154.0.8037.99**, visível, perfis isolados em **1440×900 e 414×896**; ações pelos controles, relógio controla somente a ordem dos timers, sem reset/API direta para substituir ações:

- Evento antes da primeira resposta: reconciliação automática para versão 2/1.29 ETH, sem consulta manual; avançar o timer antigo não regride.
- Nova alteração após carregar: versão 3; eventos duplicado/antigo ignorados sem regressão.
- Alteração durante outage: reconexão recupera versão 4/1.49 ETH por REST.
- Acesso direto e refresh HTTP 200; recurso persiste versão 4. Detalhe do marketplace consulta a mesma base e mostra 1.49 ETH.
- Sem exceções de página nesses percursos. Responses de dados passaram por handlers MSW, como `proof-nft`; transporte usa socket.io-client.

[Registro HTTPS](evidence/integration-initial-rest/public-validation.json), [captura desktop](evidence/integration-initial-rest/reconciled-1440.png), [captura mobile](evidence/integration-initial-rest/reconciled-414.png). O commit documental posterior agrega estas evidências sem alterar a aplicação; seu SHA final é informado no fechamento/Deployment Details e a equivalência com `963d0e0` é verificada.

## Pendências reais e conferência manual

Não há nova falha funcional conhecida nos critérios exercitados. Permanecem avaliações humanas com leitor de tela, alto contraste real, ampliação apenas de texto, zoom nativo na conferência adicional e Safari/iOS; não equivalem aos testes automatizados/Lighthouse. O aviso técnico de atualização do registro do worker observado na revisão anterior não teve vínculo causal demonstrado com bloqueio de fluxo. Causa do login anterior continua indeterminada; monitorar eventual nova ocorrência preservando a sessão e a requisição, sem afirmar correção por este patch.

Antes do envio: abrir `/integration` em perfil novo e alterar enquanto carrega → dados atualizados automaticamente; clicar duplicado/antigo → sem regressão; interromper conexão e alterar → recuperação automática; refresh → mesmo valor. Em perfil já usado, anotar versão inicial e verificar incremento, pois a base persiste. Depois conferir login Ana/Bruno, carrinho e recibo conforme README; usar somente dados fictícios.
