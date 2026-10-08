# Perfil e carteiras — evidência parcial

2026-10-08. FL-08/09 implementados para a simulação.12/12 Playwright passaram em40,7s no preview1440/390/768. Build/typecheck executados pelo runner; lint passou. Testes observam handlers reais: perfil422/conflito409/save/refresh/A-B; avatar inválido/PNG local/refresh/remover; senha atual/confirmation/credenciais antigas rejeitadas/nova senha sem persistência em claro; carteiras endereço/rede/duplicidade principal-secundária/editar/refresh/reutilizar principal/isolamento/teclado/overflow.

Perfil: identidade username/email é canônica na conta; exibição/apelido/ENS/avatar ficam separados, sem repetir identidade na persistência. AvatarPNG/JPEG/WebP até2MB e decodificação real; senhasPBKDF2/salt, revalidar scope após hash antes de gravar. Carteiras: um registro por tipo, endereço EVM40hex ou Solana32–44base58, duplicidade por rede/endereço (Solana case sensitive), campos do layout e erros por campo. Igual à principal é preferência da API, sem criar cópia; registros existentes permanecem preservados.

Guard usa sessão da API viaQuery; não renderiza recursos privados antes de autenticar. Redirecionamento por efeito preserva o destino original. O login escreve o cache antes das notificações React: guard verifica também esse cache para evitar retorno indevido ao login durante o intervalo de notificação. Não há timeout de coordenação.

Desktop usa sidebar310+gap28, duas colunas e campos40, RobotoMono/paleta existente. Mobile/tablet empilham navegação/formulários e preservam campos; mobile48px para toque. Exports de perfil/carteiras foram inspecionados; não há frame mobile. Avatar com seletor nativo, ações de senha separadas e rodapé global diferem da composição do export. Ajustes visuais/contraste/zoom/Lighthouse permanecem para final; não houve alteração de assets/Figma. Sem baseline nova aceita automaticamente.

Carteiras estão disponíveis pela API para o pagamento, cuja implementação segue na mesma autorização. Não declarar compra/pedido/recibo concluídos com base nesta evidência.
