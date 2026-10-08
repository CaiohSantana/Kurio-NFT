# Evidências da primeira etapa técnica

Data: 2026-10-07, America/Sao_Paulo. Escopo autorizado: preparação e prova isolada. Nenhum fluxo final de marketplace implementado e nenhum deploy público declarado.

## Ambiente e preservação

- Node 22.14.0; npm 11.2.0; Windows/PowerShell. Chromium instalado pelo Playwright 1.64.0: Chrome for Testing 156.0.8078.4, revisão 1248.
- Git ausente no início e no fim (`not a git repository`). Nenhuma inicialização ou commit; commit solicitado era condicional a Git configurado.
- 111 assets Figma e 15 exports do usuário conferidos por SHA-256 contra os manifestos: zero modificações. Texto do anexo permanece integralmente contido em challenge-original.md. Documentação de acompanhamento atualizada separadamente.
- Nenhuma alteração no Figma, criação de serviço remoto ou publicação. Dependências e ferramentas locais instaladas dentro do escopo autorizado.

## Resultados reais

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | Exit 0; compilação estrita de src/testes/config. Também executada pelos builds E2E. |
| `npm run lint` | Exit 0, sem warnings de lint. |
| `npm run build` | Exit 0; Vite 8.3.3, build demo com MSW disponível em dist. |
| `npm run test:e2e` | Exit 0; 15/15 testes em Chromium, 390/768/1440, build/preview; duração aproximada 1,3 min. |
| `npm run test:e2e:dev` | Exit 0; os mesmos 15/15 testes no Vite dev; duração aproximada 1,3 min. |
| Mocks desativados | Verificação em contexto novo de Chromium com VITE_ENABLE_MOCKS=false: aviso visível, zero requisições /api, zero registros de Service Worker. |
| Fonte local | E2E confirmou document.fonts carregada e recurso WOFF2 da própria origem; 400/500/700 disponíveis no arquivo variável. Licença/checksum registrados. |
| Preservação | 111 hashes de assets + 15 exports sem alteração; fonte textual original intacta. |

Relatórios HTML gerados em `playwright-report/index.html` e `playwright-report-dev/index.html`. Traces/screenshots configurados para falhas em test-results. Os relatórios são artefatos locais ignorados pelo Git; executar comandos os regenera.

Cada configuração executa cinco casos × três larguras: (1) carregamento/REST/evento/duplicata/antigo, (2) interrupção com atualização perdida e reconciliação automática REST, (3) 503/retry/persistência/fonte/overflow, (4) cleanup de conexão, acesso direto/refresh/404 e reduced-motion, (5) conexão contínua por 31s e atualização posterior. O quinto caso verifica período superior a pingInterval+pingTimeout do handshake, não um sleep arbitrário de UI. Cada teste usa contexto isolado e reset via handler MSW. Não usa page.route para fabricar resultados nem acesso a setters/cache da aplicação.

## Critérios da SPEC: alcance verificado

| IDs | Evidência desta etapa | O que permanece pendente |
| --- | --- | --- |
| ST-01 | React/TS estrito, DTO da prova, typecheck/build | Contratos dos nove fluxos. |
| ST-02 | Router, rota direta/refresh/404 e navegação entre preparação/prova | Search params do catálogo, guards e returnTo. |
| ST-03/04 | Query/Axios; loading, cache e erro; GET/POST pelos handlers MSW | Remoto/isolamento/mutations de todos os fluxos. |
| ST-05, RT-01 | socket.io-client 4.8.4 + binding 0.2.0 + MSW 2.15.0; handshake, evento nft.updated, heartbeat, reconexão em dev/build | order.updated, HTTPS publicado, sessão/pedidos e demais eventos privados. |
| ST-06 | Tailwind 4 plugin, Button/Skeleton shadcn gerados e adaptados, tokens e Roboto Mono local | Componentes finais, diálogos/formulários e fidelidade dos frames. |
| IN-01/02 | Loading, background refetch, 503/retry, 404; signal Axios e cleanup no unmount | Isolamento A/B, expiração e demais erros/respostas fora de ordem. |
| IN-04/05 | Preço string, alteração inteira BigInt; NFT único serve REST/evento e persiste | Precisão completa/cotação, outros recursos e usuários. |
| MK-01/02 | Worker antes do consumo, config dev/demo/teste/reset; delay/503/outage determinísticos | Catálogo amplo, dois usuários e matriz completa de falhas. |
| RT-02 | Duplicatas/antigos ignorados, desconexão/reconexão reconcilia recurso por REST | Carrinho/checkout/cotação stale, pedido pendente e terminais. |
| UI-01/02 | Fonte local, 390/768/1440 sem overflow na prova, skeleton com reduced-motion | Nove telas, fidelidade visual, zoom/contraste completos. |
| QA-01/02 | Playwright executável e isolado pela interface/resultados reais, HTML/traces configurados | E2E dos fluxos e regressão visual/baselines. |
| DE-01/03 | Lockfile, scripts, origem/licença, README/ARCHITECTURE | Entrega completa, checkout limpo da solução final e auditorias. |

Nenhum ID amplo acima é considerado integralmente atendido pelo bootstrap. FL-01–FL-09, IN-03/06/07, QA-03 e gate EL-01 seguem pendentes. P01 concluída no escopo técnico; P02 verificada para NFT; P03 apenas preparada, ainda sem URL/commit remoto.

## Problemas encontrados e resolvidos

As primeiras execuções falharam na conexão: engine.io-client capturava WebSocket antes de worker.start e o matcher do MSW 2.15 remove o prefixo padrão /socket.io/. Corrigidos import tardio e transporte dedicado `/proof-socket.io/`. A primeira tentativa de interrupção ficava presa aguardando handshake; durante outage, o mock agora abre somente Engine.IO e fecha sem aprovar namespace, permitindo retry automático do Manager. As execuções completas posteriores passaram em ambos ambientes.

A documentação da branch principal do binding descreve uma API diferente da versão npm publicada. A implementação usa `toSocketIo`, verificado no pacote 0.2.0/tag correspondente; não a API ainda não publicada. O heartbeat ausente no wrapper foi suprido na camada MSW e validado por teste de 31s.

Avisos do runner sobre NO_COLOR/FORCE_COLOR não alteraram o resultado; sem warnings de lint. Limitações do protocolo, ambiente publicado e escopo estão em ARCHITECTURE.md. Não foi executado Lighthouse nem criada baseline visual dos frames.

## Próximo passo fora desta etapa

Seguir os passos de conta/repositório/deploy do README e validar URL HTTPS pública para encerrar P03. Não avançar nos fluxos sem nova autorização. As decisões propostas no SPEC continuam sendo propostas até implementadas/testadas.
