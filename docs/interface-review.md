# Conferência adicional da interface publicada

**Atualização:** a falha da prova descrita neste registro histórico foi corrigida e validada na fonte `963d0e0`. [Resultados e evidências novas](integration-initial-rest-fix.md). Capturas/requisições abaixo pertencem à versão anterior; não são pendência funcional vigente.

Em 09/10/2026, sobre https://kurio-nft-delta.vercel.app/, fonte publicada `5acbfaf`. Chrome instalado **154.0.8037.99**, visível e controlado por Playwright; perfis novos separados, sem acesso ao Chrome pessoal do usuário. Desktop **1440×900**; mobile **414×896 e 440×956**, emulação de viewport/touch, não aparelho Android/iOS real.

Não houve alteração de código durante a conferência. As ações passaram pelos controles da UI, sem chamadas diretas à API, reset ou setters de estado. Observação de responses, geometria/DOM e capturas foi somente de leitura. Não houve suíte completa, Lighthouse ou atualização de baseline.

## Resultado dos percursos

| Percurso | Resultado nas três dimensões |
| --- | --- |
| Catálogo | Busca por Emerald/limpeza via Enter, página 2, refresh, voltar/avançar; coleções + Ethereum combinados reiniciam página; ordenação ascendente/descendente e histórico preservados |
| Destaques | Três indicadores ativos, respectivos CTAs abrem detalhe correspondente, retorno; seta de teclado; altura do hero permanece estável |
| Detalhe | Edição 1/10, duas unidades, favorito exige login e retorna ao contexto com seleção; adição e badge corretos |
| Carrinho | Aumentar/diminuir, remoção e badge vazio; BAD/DROP2025 rejeitados; KURIO10 aplicado/removido; persistência após refresh |
| Login/cadastro | Ana/Bruno; submissão por Enter; cadastro conflitante e criação válida. Investigação anterior cobre também senha inválida, visitante e refresh |
| Perfil/carteiras | Nome de usuário inválido com aria-invalid, salvar/refresh; endereço inválido, Ethereum/MetaMask, salvar/refresh; campos inferiores acessíveis por rolagem |
| Isolamento | Bruno não recebeu carrinho, nome de exibição ou carteira de Ana; retorno a Ana recuperou os dados privados; logout deixa visitante sem dados privados |
| Compra | Conexão por controle MetaMask, confirmação, URL privada do pedido, recibo com total igual à cotação exibida; refresh conserva recibo e badge zero |
| Teclado/diálogos | Tab/Shift+Tab na busca/conta, Enter no formulário, setas nos indicadores, Escape nos filtros/conta/recibo; foco permanece no diálogo de conta; filtros mobile devolvem foco ao acionador |
| Reflow | Sem overflow horizontal nas capturas de início, detalhe, carrinho, perfil, carteiras, checkout e recibo nos três viewports |

O roteiro principal atingiu todos os fluxos no desktop; em mobile, seu último checkpoint procurou indevidamente o botão desktop de conta, oculto por design. O roteiro complementar usou o item **Perfil** da barra mobile, abriu o diálogo e concluiu logout/cadastro/teclado. Outro rascunho do harness procurou ordenação antes de terminar o carregamento e usou aria-current incorreto; foi ajustado no harness. Esses erros de seleção não são falhas da aplicação, nem foram ocultados na evidência. [Registro principal](evidence/interface-review/results.json), [complemento](evidence/interface-review/supplement.json).

## Achados apresentados antes da consolidação

**Nenhum bloqueio funcional reproduzido nos percursos do marketplace. Há uma falha na prova `/integration`, descrita abaixo.** Um erro de atualização do registro do Service Worker apareceu no desktop ao navegar no carrinho: `Failed to update a ServiceWorker ...: Not found`. Chamadas posteriores continuaram via MSW com 200; a compra e recuperação do recibo passaram. É um aviso técnico observado, não uma causa confirmada da falha de login. Não houve correção especulativa ou limpeza de dados. 409/422 no console/rede correspondem aos cenários intencionais de conflito/cupom/perfil/endereço; não afirmar “console sem erros”.

Os cliques abortados pelo cancelamento de consultas em navegação/troca de scope não foram tratados como falha de transporte. Não foi detectada requisição não abortada com falha de rede no registro principal.

O usuário informou posteriormente que o login funcionou em seu navegador; a causa anterior continua indeterminada. [Investigação e requisições preservadas](login-investigation.md).

Capturas relevantes: [Início 414](evidence/interface-review/home-414.png), [Início 440](evidence/interface-review/home-440.png), [checkout desktop](evidence/interface-review/checkout-1440.png), [checkout 414](evidence/interface-review/checkout-414.png), [recibo 440](evidence/interface-review/receipt-440.png). A observação dessas capturas não substitui a aprovação visual humana anterior nem gera novas baselines.

## Verificações não executadas / limites

### Pendência funcional confirmada na prova técnica

Ao conferir o preview do checkout limpo, detectou-se atualização perdida quando o evento chega antes da primeira consulta terminar. Reproduzida também na URL pública, Chrome visível, contexto novo:

1. Abrir `/integration` e, ainda em “Carregando NFT por REST…”, clicar **Alterar NFT** quando o transporte indicar Conectado.
2. Evento recebido sobe para 1; POST de cenário retorna 200. GET inicial retorna snapshot versão 1 e a interface continua com 1.19 ETH/versão 1, mesmo após aguardar 1,5 s.
3. **Consultar REST** recupera versão 2/1.29 ETH. Em contexto separado, aguardar a versão 1 antes de alterar produz versão 2 automaticamente.

O listener de `src/proof/use-nft-socket.ts` chama `invalidateQueries` sem cancelar a leitura inicial; quando ela ainda não tem dados, a invalidação não substitui a requisição em andamento. O snapshot anterior capturado no handler vence essa primeira exibição. O listener do marketplace em `features/catalog/use-catalog-socket.ts` usa cancelamento antes da invalidação; não se extrapola a falha da prova para todos os fluxos.

[Requisições e condições](evidence/interface-review/proof-race.json), [captura pública](evidence/interface-review/proof-public-early.png), [captura local](evidence/interface-review/proof-local-early.png). Esta combinação não estava coberta no teste de integração existente, que aguarda dados antes de alterar. Falha apresentada ao usuário antes do fechamento; código preservado conforme escopo documental. **Pendente de correção e teste direcionado, sem declarar os critérios de reconciliação integralmente atendidos.** Não foi repetida suíte completa ou Lighthouse.

Atalho Ctrl+Equal no Chrome não alterou innerWidth/DPR: **zoom nativo não foi verificado nesta conferência**. Não confundir redimensionamento/emulação com zoom. Também não houve leitor de tela, alto contraste real do sistema, ampliação somente de texto ou Safari/iOS. Não atribuir aprovação humana a scripts ou ao Lighthouse.

Roteiro humano pendente: no Chrome, aplicar zoom 200%/400% pelo menu e percorrer nove telas, sem perder controles/conteúdo por rolagem; habilitar ampliação apenas de texto e alto contraste do sistema, verificando foco/labels/estados; com NVDA/VoiceOver, conferir anúncio de campos/erros, títulos e estado do pedido, foco ao abrir/fechar diálogos; em Safari/iOS, repetir login, carrinho, seleção de carteira, compra e refresh do recibo com teclado virtual. Registrar navegador/tecnologia e resultado efetivo; qualquer falha permanece pendente até reproduzir/corrigir.
