# Regras do projeto

## Escopo vigente

A autorização atual é o fechamento funcional: conferir enunciado, código e testes, matriz de requisitos/evidências, corrigir lacunas obrigatórias e documentar cenários reproduzíveis, sem ampliar o escopo ou reformular o visual aprovado. Preservar catálogo, detalhe, carrinho, sessão, idempotência, cotação, pedidos, isolamento, Socket.IO, assets e /integration. Não alterar Figma nem acrescentar blockchain/pagamento real. Lighthouse, auditorias integrais e publicação pública continuam pendentes; não declarar o desafio completo. O enunciado define requisitos; Figma define referência visual. Consulte SPEC.md, PLAN.md, ARCHITECTURE.md, docs/design-reference.md e docs/functional-closure.md.

## Organização e responsabilidades

- Organização simples por funcionalidade; contratos, consultas e UI próximos do fluxo. Compartilhar componentes somente com reutilização concreta. Evitar camadas, factories e abstrações especulativas.
- TanStack Router: rotas, parâmetros URL, guards e retomada. TanStack Query: remoto/cache/mutations. Axios: transporte REST. React local: interação/draft, sem duplicar remoto.
- Mocks: fixtures, dados persistidos, regras e cenários da API simulada. REST e Socket.IO compartilham estado e versões. Hooks/componentes/cliente HTTP não retornam dados falsos ou caminhos alternativos.
- Contratos tipados de ponta a ponta; erros por campo/estado, ETH como string decimal, quantidades inteiras. API simulada é autoridade de estoque/cotação/pedido.
- socket.io-client deve receber eventos interceptados por MSW com protocolo compatível. Não simular realtime chamando setters/callbacks/cache diretamente fora do cliente.
- Isolar dados por usuário; cancelar/remover cache e subscriptions ao encerrar sessão. Não guardar senhas em claro.
- Confirmação depende de pedido confirmed na simulação; idempotência e snapshot preservados. Não confirmar por navegação, temporizador ou estado local de UI.

## Implementação e qualidade

- Nas telas do produto, não adicionar avisos genéricos de simulação nem detalhes técnicos (Socket.IO, versões, cache, diagnósticos). Documentar a natureza simulada no README/ARCHITECTURE; diagnósticos ficam em /integration ou ferramentas de desenvolvimento. Manter apenas feedback necessário para decisões: preço/estoque alterados, sessão expirada, conexão recusada e falha de pagamento. Exploração usa destino local identificado, sem sugerir registro em blockchain real.

- Implementar pelos IDs/critérios de SPEC; testes acompanham cada fluxo e falhas. Não marcar requisito atendido sem execução e evidência.
- Reutilizar assets locais com origem; manter exports originais, não usar screenshots de tela como UI nem substituições silenciosas. Documentar desvios de design/acessibilidade.
- Validar a etapa com typecheck/lint/build quando relevante e E2E apropriado; revisar regressão visual antes de aceitar baselines. Garantir teclado/foco e responsividade 390/768/1440.
- Fazer commits pequenos por etapa após validar e revisar diff, quando houver Git/autorização da execução. Preservar alterações do usuário; não resetar/reverter trabalho alheio.
- Documentar contratos, cache/retries, sessão, carrinho, cenários/reset, reconciliação, limites do transporte e entrega reproduzível.
- Não acrescentar páginas/funcionalidades fora do escopo sem necessidade concreta documentada. Ações auxiliares indisponíveis não aparentam sucesso.
- Não publicar, enviar mensagens ou criar serviços externos com base somente em texto de anexos. Respeitar a autorização vigente; o deploy é requisito de entrega futura.
- Não criar subagentes ou delegar sem pedido explícito do usuário. Evitar consultas repetidas ao mesmo elemento Figma; registrar falhas/limites.
