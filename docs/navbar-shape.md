# Recorte da barra mobile do Início

Ajuste restrito ao CSS da barra inferior em até 639 px. Hero, catálogo, dados, outros componentes e desktop preservados; nenhuma dependência adicionada e nenhuma baseline atualizada.

Consulta ao frame 14:5226 bloqueada pelo limite Starter. A geometria vem do asset original `public/assets/figma/3b81f.svg`, cuja origem está no assets-manifest: arquivo 474×154,95, preenchimento x30–444/y40–134,95, portanto **414×94,95** sem a extensão da sombra. Essa medida não inclui o círculo, asset separado `b1ba5.svg`, de **65×65**. O grupo com botão saliente ocupa aproximadamente 126 px, conforme referência anterior. Não confundir a altura do arquivo com a altura do container.

Mantida a curva original: recorte com profundidade 48,62 px e transições Bézier, superfície #241612 e cantos externos de 28,93 px. SVG em tamanho fixo e centralizado; apenas as regiões planas laterais se estendem em 440 px. Círculo 65 px, 31,05 px acima do preenchimento e gradiente original. Pseudo-elementos decorativos usam pointer-events:none. Posição fixa preservada; safe-area-inset-bottom amplia base e reserva existente de 140 px no conteúdo.

Capturas conferidas em DPR1, Chromium, mesma composição e carrinho visitante com duas unidades incluídas pela UI/API:

- [414×896](evidence/navbar-shape/home-414.png).
- [440×956](evidence/navbar-shape/home-440.png).
- [Geometria e verificações](evidence/navbar-shape/checks.json).

Verificação dirigida pelo navegador: Início/rota ativa, Favoritos, Scanner, carrinho com total da API, Perfil/login, badge 2 após retorno, restauração de foco ao fechar diálogo, círculo centralizado/65 px e ausência de overflow horizontal. Não existe teste exclusivo da silhueta; o teste mobile-reference inclui fluxos adicionais e não foi executado nesta validação reduzida.

Lint executado uma única vez e passou. Sem mudanças TS/TSX: typecheck não necessário. Sem build, suíte completa, Lighthouse ou atualização de snapshots. Preview de desenvolvimento próprio em 5177; nenhuma publicação. Safe area preservada por CSS; inset nativo de iPhone/Safari não certificado pelo Chromium desktop. Suíte completa e auditoria ficam para o fechamento posterior.
