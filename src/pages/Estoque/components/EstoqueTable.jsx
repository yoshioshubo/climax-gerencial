import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { calcAuditoria } from '../../../utils/fileParser'
import { useAuth } from '../../../contexts/AuthContext'
import { useData } from '../../../contexts/DataContext'

export default function EstoqueTable({ items, aliases, setupMode }) {
  const { user, isOwner } = useAuth()
  const { updateItem, deleteItem, renameItem } = useData()
  const [editAlias, setEditAlias] = useState(null) // { id, value }
  const [editCell, setEditCell]   = useState(null) // { id, field, value }

  const startRename = (item) => setEditAlias({ id: item.id, value: aliases[item.id] ?? item.name })
  const confirmRename = () => {
    if (editAlias) renameItem(editAlias.id, editAlias.value, user.displayName)
    setEditAlias(null)
  }

  const startEdit = (item, field) =>
    setEditCell({ id: item.id, field, value: item[field] })
  const confirmEdit = () => {
    if (editCell) updateItem(editCell.id, editCell.field, Number(editCell.value), user.displayName)
    setEditCell(null)
  }

  const editableFields = ['estoqueInicial', 'estoqueVenda', 'estoqueFinal', 'vendas']

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-climax-dark-border text-xs text-gray-500 uppercase tracking-wider">
            <th className="text-left py-3 px-3 min-w-[160px]">Item</th>
            <th className="text-right py-3 px-3">Est. Loja</th>
            <th className="text-right py-3 px-3">Em Venda</th>
            <th className="text-right py-3 px-3">Est. Final</th>
            <th className="text-right py-3 px-3">Movimentação</th>
            <th className="text-right py-3 px-3">Vendas</th>
            <th className="text-center py-3 px-3">Auditoria</th>
            {setupMode && isOwner && <th className="text-center py-3 px-3">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const { movimentacao, diff, status } = calcAuditoria(item)
            const displayName = aliases[item.id] ?? item.name

            return (
              <tr key={item.id} className="border-b border-climax-dark-border/40 hover:bg-white/[0.02] group">
                {/* Nome / rename */}
                <td className="py-2.5 px-3">
                  {editAlias?.id === item.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        value={editAlias.value}
                        onChange={e => setEditAlias(a => ({ ...a, value: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setEditAlias(null) }}
                        className="bg-climax-dark border border-climax-gold rounded px-2 py-0.5 text-xs text-white w-32 focus:outline-none"
                      />
                      <button onClick={confirmRename} className="text-green-400 hover:text-green-300"><Check size={14} /></button>
                      <button onClick={() => setEditAlias(null)} className="text-gray-500 hover:text-gray-300"><X size={14} /></button>
                    </div>
                  ) : (
                    <span className="text-white font-medium">{displayName}</span>
                  )}
                </td>

                {/* Campos numéricos editáveis */}
                {['estoqueInicial', 'estoqueVenda', 'estoqueFinal'].map(field => (
                  <td key={field} className="py-2.5 px-3 text-right">
                    {editCell?.id === item.id && editCell.field === field ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          autoFocus type="number"
                          value={editCell.value}
                          onChange={e => setEditCell(c => ({ ...c, value: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') setEditCell(null) }}
                          className="bg-climax-dark border border-climax-gold rounded px-2 py-0.5 text-xs w-20 text-right focus:outline-none"
                        />
                        <button onClick={confirmEdit} className="text-green-400"><Check size={12} /></button>
                        <button onClick={() => setEditCell(null)} className="text-gray-500"><X size={12} /></button>
                      </div>
                    ) : (
                      <span
                        className={`text-gray-300 ${isOwner ? 'cursor-pointer hover:text-climax-gold' : ''}`}
                        onClick={() => isOwner && startEdit(item, field)}
                      >
                        {item[field]}
                      </span>
                    )}
                  </td>
                ))}

                {/* Movimentação calculada */}
                <td className="py-2.5 px-3 text-right text-gray-400">{movimentacao}</td>

                {/* Vendas editável */}
                <td className="py-2.5 px-3 text-right">
                  {editCell?.id === item.id && editCell.field === 'vendas' ? (
                    <div className="flex items-center justify-end gap-1">
                      <input
                        autoFocus type="number"
                        value={editCell.value}
                        onChange={e => setEditCell(c => ({ ...c, value: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') setEditCell(null) }}
                        className="bg-climax-dark border border-climax-gold rounded px-2 py-0.5 text-xs w-20 text-right focus:outline-none"
                      />
                      <button onClick={confirmEdit} className="text-green-400"><Check size={12} /></button>
                      <button onClick={() => setEditCell(null)} className="text-gray-500"><X size={12} /></button>
                    </div>
                  ) : (
                    <span
                      className={`text-gray-300 ${isOwner ? 'cursor-pointer hover:text-climax-gold' : ''}`}
                      onClick={() => isOwner && startEdit(item, 'vendas')}
                    >
                      {item.vendas}
                    </span>
                  )}
                </td>

                {/* Auditoria badge */}
                <td className="py-2.5 px-3 text-center">
                  {status === 'ok' ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-900/40 text-green-400 border border-green-800">
                      OK
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-900/40 text-orange-400 border border-orange-800">
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  )}
                </td>

                {/* Setup actions */}
                {setupMode && isOwner && (
                  <td className="py-2.5 px-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => startRename(item)}
                        className="p-1 rounded text-gray-500 hover:text-climax-gold hover:bg-climax-gold/10 transition-colors"
                        title="Renomear"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id, displayName, user.displayName)}
                        className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
