import { calcAuditoria } from '../../../utils/fileParser'
import { AlertTriangle } from 'lucide-react'

export default function AuditTab({ items, aliases }) {
  const flagged = items
    .map(it => ({ ...it, ...calcAuditoria(it) }))
    .filter(it => it.status === 'alerta')

  if (!flagged.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-green-500">
        <div className="text-4xl mb-3">✓</div>
        <p className="text-sm font-semibold">Nenhuma divergência encontrada.</p>
        <p className="text-xs text-gray-500 mt-1">Todas as vendas batem com a movimentação de estoque.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-orange-400">
        <AlertTriangle size={16} />
        <span className="text-sm font-semibold">{flagged.length} item(s) com divergência</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-climax-dark-border text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left py-3 px-4">Item</th>
              <th className="text-right py-3 px-4">Vendas</th>
              <th className="text-right py-3 px-4">Movimentação</th>
              <th className="text-right py-3 px-4">Diferença</th>
            </tr>
          </thead>
          <tbody>
            {flagged.map(it => (
              <tr key={it.id} className="border-b border-climax-dark-border/50 hover:bg-orange-900/10">
                <td className="py-3 px-4 font-medium text-white">
                  {aliases[it.id] ?? it.name}
                </td>
                <td className="py-3 px-4 text-right text-gray-300">{it.vendas}</td>
                <td className="py-3 px-4 text-right text-gray-300">{it.movimentacao}</td>
                <td className="py-3 px-4 text-right">
                  <span className="font-bold text-orange-400">
                    {it.diff > 0 ? `+${it.diff}` : it.diff}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
