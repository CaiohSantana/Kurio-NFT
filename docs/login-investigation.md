# Investigação do login publicado — 09/10/2026

**Atualização:** o usuário informou que o login funcionou e pediu retomada do fechamento documental. A causa da ocorrência anterior permanece indeterminada; não houve correção ou reset para atribuir a recuperação. O relato abaixo preserva as condições e pendências daquela investigação.

Falha informada pelo usuário: “Falha de conexão. Tente novamente.” ao entrar com Ana em https://kurio-nft-delta.vercel.app/. **Não reproduzida nas condições abaixo; causa ainda não confirmada. Não considerar resolvida.** Fechamento documental suspenso. Aplicação, dados do usuário e versão publicada não foram alterados.

## Condições e resultados

Chrome instalado 154.0.8037.99, visível, controlado por Playwright, perfil próprio persistente separado, Windows, viewport 1440×900. Login e ações pelo formulário/controles; sem chamadas diretas à API ou reset. Capturas/respostas não incluem senhas, tokens, headers de identidade ou conteúdo do store. O perfil de diagnóstico fica em `artifacts/login-investigation/chrome-profile`, ignorado pelo Git; não compartilhar esse diretório.

- Perfil novo: login Ana, POST `/api/session` 200, handler `login`, Service Worker, 231 ms; recuperação GET 200 ~220 ms; carrinho/favoritos 200.
- Perfil já usado nesta versão: login Bruno 200, 230 ms. Senha inválida de Ana: 401 `INVALID_CREDENTIALS`, “E-mail ou senha inválidos.”, 222 ms. Não ocorreu timeout de 5 s.
- Após fechar e reabrir o Chrome: Bruno recuperado. Logout; visitante adicionou duas unidades e manteve-as após refresh. Login Ana conciliou uma vez; refresh manteve duas unidades. Troca para Bruno: carrinho vazio. Logout: visitante vazio. Novo login Ana: carrinho privado preservado com duas unidades, inclusive após refresh.
- Perfil com dados **realmente originados de versões anteriores no navegador do usuário não foi acessado nem reproduzido**. O perfil retornante desta investigação não substitui essa condição.

Evidências: [requisições iniciais](evidence/login-investigation/initial.json), [carrinho e troca](evidence/login-investigation/targeted.json), [conclusão dos checkpoints](evidence/login-investigation/completed.json), [Ana](evidence/login-investigation/ana-cart.png), [Bruno](evidence/login-investigation/bruno-cart.png), [credenciais inválidas](evidence/login-investigation/invalid.png). Uma asserção do harness usou indevidamente ponto final no título do carrinho vazio; a captura mostrava o estado correto. O checkpoint foi corrigido no harness e validado na continuação, sem alterar aplicação.

## Console, interceptação e persistência

Durante uma navegação apareceu `Failed to update a ServiceWorker ...: Not found`. Nesse momento o documento ainda tinha controller, mas a lista de registros estava vazia; as operações de login/carrinho/favoritos/cotação seguintes retornaram 200 via Service Worker. Na continuação, nenhuma exceção de página ocorreu. Portanto esse aviso é um achado, **sem vínculo demonstrado com a falha de login relatada**. O worker gerado pelo MSW possui desregistro quando não restam clientes ativos; sua biblioteca inicia atualização de registro existente. Não foi aplicado patch especulativo ao worker ou à dependência.

GET/POST `/api/session` foram interceptados pelo MSW, sem fallback de API de negócio. Build demo e configuração Production habilitam mocks; worker `/mockServiceWorker.js`, escopo raiz, HTTPS. Axios tem timeout de 5 s. `apiMessage` usa “Falha de conexão” também quando uma resposta Axios não fornece `data.message`; o texto isolado não distingue erro de transporte de uma resposta inesperada.

Store `kurio-commerce-v1` no perfil testado tinha hashes/salts, array `merged`, carrinhos válidos e nenhum cenário de falha/latência configurado. Comparação com o commit inicial de sessão `3e78233`: mesma chave e estrutura básica de sessão/contas/carrinho/conciliação; perfil/carteiras são opcionais. A leitura atual valida apenas parte do shape; isso é um limite de robustez observado no código, **não evidência de corrupção ou incompatibilidade no navegador do usuário**. Nada foi resetado para obter sucesso.

## Próxima evidência necessária

Preservar o navegador afetado. Em F12 → Network, ativar Preserve log, tentar login e informar método/caminho, status ou erro, duração e Response da requisição que falha; informar também erro relevante do Console e versão do Chrome. Não enviar payload, headers, senha, token, HAR completo ou store integral. Isso permitirá distinguir POST de login, recuperação da sessão, conciliação e carregamento privado, além de identificar timeout/resposta não interceptada/exceção do handler.

Ainda falta reproduzir no estado antigo afetado e confirmar a causa. Sem causa confirmada, não houve alteração de código, checks de compilação, suíte, Lighthouse, commit corretivo ou nova publicação. Fonte publicada permanece `5acbfaf02a6c0251644d221963bcfad47200270a`; esta investigação não encerra a entrega.
