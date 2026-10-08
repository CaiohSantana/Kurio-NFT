import type { QuoteLine } from './contracts'

export function PurchaseItems({ lines, receipt = false }: { lines: QuoteLine[]; receipt?: boolean }) {
  return <table className={`purchase-items ${receipt ? 'receipt-items' : ''}`}>
    <thead><tr><th scope="col">NFTs</th>{receipt && <th scope="col">Edições</th>}<th scope="col">Subtotal</th></tr></thead>
    <tbody>{lines.map((line) => <tr key={line.id}>
      <td><div className="purchase-nft"><img src={line.nft.image} width="70" height="70" alt={line.nft.name} /><div><strong>{line.nft.name}</strong><p>ID do token: {line.nft.token}</p><span className="sr-only">Edição {line.editionLabel}, {line.nft.priceEth} ETH por unidade</span></div></div></td>
      {receipt && <td className="purchase-quantity">(× {line.quantity})</td>}
      <td className="purchase-value">{!receipt && <span className="purchase-quantity">(× {line.quantity})</span>}<strong>{line.lineEth} ETH</strong></td>
    </tr>)}</tbody>
  </table>
}
