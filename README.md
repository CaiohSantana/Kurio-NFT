# Kurio — Marketplace de NFTs

**[Aplicação publicada](https://kurio-nft-delta.vercel.app/)** · **[Repositório](https://github.com/CaiohSantana/Kurio-NFT)**

Desafio frontend com catálogo, detalhes de NFTs, autenticação, favoritos, carrinho, pagamento, confirmação, perfil e carteiras, seguindo as referências desktop e mobile do Figma.

APIs, sessão, carteiras e pagamentos são simulados com MSW. A aplicação funciona sem backend privado, extensão de carteira ou integração real com blockchain.

## Tecnologias

React · TypeScript · Vite · TanStack Router · TanStack Query · Axios · Socket.IO · Tailwind CSS · shadcn/ui · MSW · Playwright · Lighthouse.

Router controla rotas e parâmetros da URL; Query controla dados remotos e cache; Axios faz as chamadas REST. Os mocks compartilham os dados entre REST e eventos Socket.IO. Contratos, políticas e decisões estão em [ARCHITECTURE.md](ARCHITECTURE.md).

## Executar localmente

Use **Node.js 22, a partir de 22.14 e abaixo de 23**. Ambiente verificado: Windows/PowerShell, Node 22.14.0 e npm 11.2.0.

```sh
git clone https://github.com/CaiohSantana/Kurio-NFT.git
cd Kurio-NFT
npm ci
npm run dev
```

Abra o endereço exibido no terminal, normalmente http://localhost:5173/.

Os comandos de desenvolvimento e build usam o modo `demo`. A configuração versionada em `.env.demo` habilita `VITE_ENABLE_MOCKS=true`; não é necessário cadastrar serviços externos. Consulte [.env.example](.env.example) para a variável disponível. Alterações nessa configuração exigem reiniciar o desenvolvimento ou gerar um novo build. Os mocks no navegador precisam de localhost ou HTTPS.

## Contas e compra de teste

| Conta | E-mail | Senha |
| --- | --- | --- |
| Ana | `ana@kurio.test` | `Kurio123!` |
| Bruno | `bruno@kurio.test` | `Kurio123!` |

O cadastro também cria contas locais. Use apenas dados fictícios.

Para testar a compra:

1. Abra um NFT, selecione edição e quantidade e adicione ao carrinho.
2. No carrinho, clique em **Conectar e finalizar** e faça login.
3. Se não houver carteira, cadastre uma principal e retome o checkout. Exemplo: Ethereum / MetaMask / `0x1111111111111111111111111111111111111111`.
4. Selecione o provedor para simular a conexão, confira os dados e clique em **Confirmar compra**.
5. Aguarde a confirmação da API e atualize o recibo para conferir a persistência.
6. Faça logout e entre com Bruno para verificar o isolamento dos dados.

Cupons: `KURIO10` aplica 10% de desconto; `DROP2025` está expirado; outros códigos são inválidos.

## Funcionalidades

- Catálogo com busca, filtros combinados, ordenação e paginação na URL.
- Detalhe com galeria, edições, limites de quantidade e favoritos persistentes.
- Carrinho persistente e conciliação única dos itens do visitante ao autenticar.
- Checkout com cotação da API, reconfirmação de valores alterados e envio idempotente.
- Pedidos pendentes, confirmados e recusados, recuperação após refresh e recibo imutável.
- Perfil, avatar, senha e carteiras com validação e persistência.
- Atualizações Socket.IO de preço, disponibilidade e pedido, com reconciliação REST após reconexão.

Todas as telas têm adaptação responsiva. Foram verificadas larguras de 390, 768 e 1440 px; a revisão dos frames mobile também considerou 414 e 440 px.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Desenvolvimento com mocks |
| `npm run build` | Typecheck e build otimizado |
| `npm run preview` | Servir o build local; execute build antes |
| `npm run typecheck` | Verificação de tipos |
| `npm run lint` | ESLint |
| `npm run test:e2e` | E2E e regressão visual em Chromium |
| `npm run test:e2e:dev` | E2E no servidor de desenvolvimento |
| `npm run test:e2e:ui` | Interface do Playwright |
| `npm run test:report` | Abrir o relatório dos testes locais |
| `npm run audit` | Build e 12 medições Lighthouse em preview local |

Antes de executar Playwright ou Lighthouse:

```sh
npx playwright install chromium
```

Os testes usam estados isolados e exercitam os handlers MSW e o cliente Socket.IO. As baselines estão versionadas em `tests/*-snapshots`; detalhes da configuração e artefatos estão na [documentação de entrega](docs/final-delivery.md).

<a id="cenários-críticos-sem-editar-código"></a>

## Cenários de falha e reset

Os mocks permitem reproduzir lentidão, erros REST, sessão expirada, cupom inválido/expirado, mudança de preço/estoque, recusa de pagamento e timeout com recuperação do mesmo pedido.

O [guia de cenários](docs/testing-scenarios.md) contém o helper de console, todos os comandos e os resultados esperados. A rota `/integration` permite observar a prova REST/Socket.IO.

Para restaurar os dados iniciais, abra `/preparation`, aguarde a inicialização e execute no console:

```js
await fetch('/api/__scenario/reset', { method: 'POST' }).then((response) => {
  if (!response.ok) throw new Error('Reset falhou')
})
location.href = '/'
```

O reset remove os dados fictícios cadastrados, carrinhos, favoritos, carteiras, pedidos e cenários de erro, restaurando as 45 fixtures e as duas contas. Não faça reset se quiser recuperar um pedido pendente.

## Validação e relatórios

- Lint, typecheck e build aprovados na correção mais recente.
- Suíte consolidada anterior: **221 testes aprovados, 3 skips e 1 diferença visual** na barra mobile. A baseline foi revisada após aprovação visual e o caso passou na revalidação **1/1**.
- Correção posterior da consulta inicial em `/integration`, fonte `963d0e0`: **27/27 testes direcionados** e validação HTTPS desktop/mobile aprovados. Último commit publicado antes desta reorganização documental: `84093bd`, com o mesmo código da correção. [Relatório da correção](docs/integration-initial-rest-fix.md).
- Instalação/build em checkout limpo da fonte anterior `5acbfaf` e conferência dos fluxos pela interface documentados em [reprodução](docs/delivery-reproduction.md) e [revisão da interface](docs/interface-review.md). Não apresentar esse checkout como nova instalação da versão corrigida.

Lighthouse público do commit `3242294`, com medianas de três execuções por página e perfil:

| Página / perfil | Performance | Accessibility | Best Practices | SEO |
| --- | --- | --- | --- | --- |
| Início / mobile | 91 | 100 | 100 | 100 |
| Início / desktop | 100 | 100 | 100 | 100 |
| Detalhe / mobile | 92 | 100 | 100 | 100 |
| Detalhe / desktop | 100 | 100 | 100 | 100 |

[Relatórios HTML/JSON, métricas e condições](docs/audits/lighthouse-public-final/README.md). Essa auditoria é anterior à correção isolada de `/integration`; não houve uma nova medição da versão posterior.

Para abrir o relatório E2E preservado:

```sh
npx playwright show-report docs/audits/final-delivery/playwright-full
```

A [revalidação da baseline](docs/audits/final-delivery/playwright-navbar-updated/index.html) e o relatório original, com seus anexos e trace, foram preservados.

## Limitações

- Persistência local por navegador e origem, sem backend compartilhado ou sincronização entre abas. Outro dispositivo ou uma nova sessão anônima independente começa com as fixtures iniciais.
- Transações e links de exploração são fictícios; o explorador do recibo é local.
- Leitor de tela, alto contraste real, ampliação apenas de texto, zoom nativo na conferência adicional e Safari/teclado iOS ainda têm verificações humanas pendentes, detalhadas na revisão da interface.
- Baselines visuais foram geradas em Chromium/Windows. Regressão visual e Lighthouse não substituem a comparação com o Figma nem a avaliação humana de acessibilidade.
- A falha de login relatada anteriormente não foi reproduzida; testes posteriores passaram, mas sua causa original permanece não confirmada.

Origem/licença da Roboto Mono local: [fontes](public/assets/fonts/README.md). Artes e exports originais: [assets](public/assets/figma/README.md).

## Documentação

- [Enunciado original](docs/challenge-original.md) e [SPEC](SPEC.md): requisitos e critérios de aceite.
- [PLAN](PLAN.md): etapas de implementação.
- [ARCHITECTURE](ARCHITECTURE.md): contratos, sessão, carrinho, cache, eventos e desvios do design.
- [Entrega e evidências](docs/final-delivery.md): commits, publicação, testes e auditorias.
- [Publicação](docs/first-deploy.md): configuração e reprodução do deploy.
- [Histórico](docs/history/README-at-5acbfaf.md): registros das etapas anteriores.
