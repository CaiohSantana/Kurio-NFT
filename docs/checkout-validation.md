# Perfil, pagamento e pedidos — evidências de 2026-10-08

Revisão visual posterior: composição atual, capturas, baselines e verificações finais em [visual-refinement.md](visual-refinement.md). As descrições visuais e contagens abaixo registram a entrega anterior; seus contratos funcionais foram preservados.

## Escopo entregue

Correções Mercado/badge estão no commit c1534ed e em navigation-cart-fixes.md. Perfil/avatar/senha/carteiras estão no commit b0ef2cb e em account-validation.md. Esta entrega acrescenta `/checkout` e `/orders/$orderId`, preservando catálogo, detalhe, autenticação, favoritos, carrinho e `/integration`. A aplicação não usa blockchain, extensões ou pagamentos reais.

Critérios exercitados: FL-02/03/04/05/06/08/09, IN-02/04/05/06/07, RT-01/02 e partes UI/QA. Isso não encerra os gates eliminatórios nem o desafio.

## Verificação

- Typecheck, lint sem warnings e build demo executados com sucesso.
- Primeiro conjunto direcionado:57/57 testes (30 pagamento/pedido,12 perfil/carteiras,15 integração), em Chromium390/768/1440.
- Suíte completa no build preview: **144/144 passaram em6,1min**, sem update de snapshots:24 catálogo,30 commerce,15 prova,9 navegação/badge,12 conta,33 pagamento/pedido e21 visuais. Inclui leitura/evento de pedido atrasados após troca de conta. Relatório HTML em `playwright-report` (ignorado pelo Git), abrir com `npm run test:report`.
- Ajuste final: retorno “Continuar explorando” do recibo reutiliza CatalogLink. Novo build/typecheck e6/6 verificações direcionadas (compra/retorno e regressão do recibo nos três tamanhos) passaram em28,2s; lint passou. Execução com reporter=list preserva o relatório HTML da suíte completa.
- Revisão manual dos PNGs de perfil, carteiras, pagamento e confirmação; screenshots locais dos fluxos reais em390/768/1440, sem overflow horizontal. Artefatos em `artifacts/final-flow-review`, ignorados pelo Git.
- Baselines automatizadas de pagamento/recibo criadas após revisão, separadas da comparação com o Figma. Identificador, data e referência SIM são mascarados; valores/itens permanecem visíveis. Carrinho recebeu atualização intencional do encaminhamento ao pagamento.
- Na extração dos helpers de teste, uma conversão de encoding alterou labels e fez seis testes visuais falharem. Corrigido UTF-8; seis baselines novas geradas com sucesso e suíte completa144/144 aprovada depois. A falha não exigiu alteração de comportamento da aplicação.

## Regras verificadas pelos testes

Compra completa por REST/MSW, evento privado pelo socket.io-client, consulta de pedido e sucesso apenas após `confirmed`. Recusa preserva carrinho. Pendência sobrevive a refresh; timeout após criação recupera chave/pedido persistidos. Criações REST concorrentes com mesma chave retornam o mesmo ID; conteúdo distinto recebe409. Snapshot conserva preços após mudanças no catálogo. Confirmação subtrai uma única vez a quantidade comprada, mantendo adições feitas enquanto pendente. Eventos antigos/duplicados não regridem estados terminais. Desconexão/reconexão reconcilia por REST; acesso de outra conta recebe403 e ID ausente404.

Mudança de preço/esgotamento por `nft.updated` recota e exige novo aceite; preço antigo não autoriza envio. Conexão recusada/desconectada bloqueia pedido. Carteira secundária Polygon/Coinbase usa endereço registrado e taxa0.001 ETH; selecionar rede incompatível retorna erro associado. Perfil/avatar/senha/carteiras validam, persistem e isolam contas; senha antiga não autentica após alteração.

## Decisões e diferenças visuais

Desktop/mobile exibem todos os campos necessários, inclusive os omitidos no export mobile do pagamento. Seleção explícita usa carteiras cadastradas; provider/endereço derivam do registro, sem dados fictícios alternativos. ENS recebe o nome completo; identidade do colecionador é canônica, sem copiar valores divergentes dos exemplos. Valores de todas as redes permanecem denominados em ETH na simulação, com taxas demonstrativas documentadas, sem conversão real.

Perfil/carteiras mobile usam uma coluna e navegação compacta. Avatar utiliza seletor nativo acessível. Pagamento tem cartões de carteira e aceite explícito adicionais. Recibo é página com cartão central, snapshot completo e ícone Lucide aproximado; não reproduz integralmente o modal/export. Medidas/assets cujo contexto Figma segue bloqueado usam estimativas dos PNGs, sem alegar medidas confirmadas. Rodapé/controles auxiliares e refinamento de espaçamento/fidelidade ficam para a revisão final.

## Roteiro manual e cenários

1. `npm run dev`; abrir `/nfts/emerald-042?edition=ten&quantity=2`, adicionar e seguir para pagamento.
2. Entrar com `ana@kurio.test` / `Kurio123!`; criar carteira principal Ethereum/MetaMask, endereço `0x1111111111111111111111111111111111111111`; retomar fluxo.
3. Revisar campos/cotação, conectar na simulação, aceitar e confirmar. Esperar recibo confirmado; refresh conserva o pedido. Exploração informa explicitamente que é simulada.
4. Usar `bruno@kurio.test` / `Kurio123!` para conferir isolamento; cadastro também funciona. Senha pode ter sido alterada no cenário local: reset restaura fixtures.
5. No console, cenários atuam somente na camada de mocks:

```js
const scenario = (action, id) => fetch('/api/__checkout/scenario', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action, id })
})
await scenario('hold') // próximo pedido permanece pending
// Após envio, obter ID na URL /orders/ID e usar:
await scenario('confirm', 'ID_DA_URL')
```

Outras ações: `refuse` com ID; `order-refused` para próxima compra; `timeout` perde a resposta após persistir pedido e mantém pending; `connection-refused`, `connection-allowed`, `disconnect-wallet`, `auto`, `duplicate`, `old`, `foreign` (estas três com ID). Eventos passam pelo Socket.IO interceptado. Para preço/estoque, endpoint `/api/__catalog/scenario` com `change`/`sold-out`, id `emerald-042`. Para reiniciar tudo, abrir `/preparation`, enviar POST `/api/__scenario/reset` e recarregar (reset integral introduzido no fechamento funcional); não resetar uma compra que deseja recuperar.

## Pendências finais

Lighthouse, auditoria integral de acessibilidade/contraste/zoom, fidelidade visual restante, checkout limpo de entrega e publicação HTTPS verificável. Preview local e baselines não constituem publicação nem aprovação visual integral. Nenhum serviço externo foi criado/publicado.
