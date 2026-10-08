import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { getProofNft, nftKey, runScenario } from './api'
import { useNftSocket } from './use-nft-socket'

export function IntegrationProof() {
  const [message, setMessage] = useState('Escolha um cenário para observar a integração.')
  const nftQuery = useQuery({ queryKey: nftKey, queryFn: ({ signal }) => getProofNft(signal),
    staleTime: 30000, retry: false, refetchOnWindowFocus: false,
    structuralSharing: (previous, next) => {
      const old = previous as Awaited<ReturnType<typeof getProofNft>> | undefined
      const incoming = next as Awaited<ReturnType<typeof getProofNft>>
      return old && old.nft.version > incoming.nft.version ? old : incoming
    },
  })
  const socket = useNftSocket()
  const scenario = useMutation({ mutationFn: runScenario,
    onSuccess: (result, action) => {
      if (action === 'reset') window.location.reload()
      else setMessage(result.message)
    },
    onError: () => setMessage('Não foi possível executar o cenário.'),
  })

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6 sm:p-10">
      <header className="space-y-3">
        <Link to="/preparation" className="text-sm text-primary underline">Voltar à preparação</Link>
        <p className="text-sm font-bold tracking-widest text-primary">KURIO · PROVA TÉCNICA</p>
        <h1 className="text-2xl font-bold sm:text-3xl">REST + Socket.IO</h1>
        <p className="text-sm leading-6 text-muted-foreground">Base de integração separada do marketplace. Os controles abaixo atuam nos handlers dos mocks.</p>
      </header>
      <section aria-label="NFT consultado" className="rounded-lg border border-border bg-card p-6">
        {nftQuery.isPending ? (
          <div role="status" className="min-h-40 space-y-4">
            <p>Carregando NFT por REST…</p>
            <Skeleton className="proof-skeleton h-8 w-3/4" />
            <Skeleton className="proof-skeleton h-16 w-full" />
          </div>
        ) : nftQuery.data ? (
          <div className="min-h-40 space-y-4" aria-live="polite">
            <h2 className="text-xl font-bold">{nftQuery.data.nft.name}</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <dt>Preço</dt><dd data-testid="price">{nftQuery.data.nft.priceEth} ETH</dd>
              <dt>Disponíveis</dt><dd data-testid="available">{nftQuery.data.nft.available}</dd>
              <dt>Versão REST</dt><dd data-testid="version">{nftQuery.data.nft.version}</dd>
              <dt>Consultas REST</dt><dd data-testid="read-count">{nftQuery.data.readCount}</dd>
            </dl>
          </div>
        ) : null}
        {nftQuery.isFetching && !nftQuery.isPending && <p role="status" className="mt-4 text-sm">Sincronizando por REST…</p>}
        {nftQuery.isError && <p role="alert" className="mt-4 text-sm text-destructive">Falha na consulta REST. Use “Consultar REST” para tentar novamente.</p>}
      </section>
      <section aria-label="Estado do transporte" className="space-y-2 text-sm" aria-live="polite">
        <p>Socket.IO: <strong data-testid="connection">{socket.status}</strong></p>
        <p>Conexões: <span data-testid="connections">{socket.connections}</span> · Eventos recebidos: <span data-testid="received">{socket.received}</span> · Ignorados: <span data-testid="ignored">{socket.ignored}</span></p>
      </section>
      <section aria-label="Controles de cenário" className="flex flex-wrap gap-3">
        <Button disabled={scenario.isPending} onClick={() => scenario.mutate('change')}>Alterar NFT</Button>
        <Button variant="outline" disabled={scenario.isPending} onClick={() => scenario.mutate('duplicate')}>Evento duplicado</Button>
        <Button variant="outline" disabled={scenario.isPending} onClick={() => scenario.mutate('old')}>Evento antigo</Button>
        <Button variant="outline" disabled={scenario.isPending} onClick={() => scenario.mutate('disconnect')}>Interromper conexão</Button>
        <Button variant="outline" disabled={scenario.isPending} onClick={() => scenario.mutate('fail-next')}>Falhar próxima consulta</Button>
        <Button variant="outline" disabled={nftQuery.isFetching} onClick={() => void nftQuery.refetch()}>Consultar REST</Button>
        <Button variant="outline" disabled={scenario.isPending} onClick={() => scenario.mutate('reset')}>Reiniciar cenário</Button>
      </section>
      <p role="status" className="min-h-12 text-sm leading-6 text-muted-foreground">{message}</p>
      <p className="text-xs leading-5 text-muted-foreground">WebSocket · namespace padrão · dados simulados. Os fluxos de compra e conta ainda não foram implementados.</p>
    </main>
  )
}
