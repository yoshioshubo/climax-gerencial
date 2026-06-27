import { useData } from '../../../contexts/DataContext'
import { Clock, User, Activity } from 'lucide-react'

const ACTION_LABELS = {
  SALVAR_ESTOQUE:  { label: 'Importação',   color: 'text-blue-400' },
  EDITAR_ITEM:     { label: 'Edição',        color: 'text-yellow-400' },
  EXCLUIR_ITEM:    { label: 'Exclusão',      color: 'text-red-400' },
  RENOMEAR_ITEM:   { label: 'Renomeação',    color: 'text-purple-400' },
}

export default function LogTab() {
  const { auditLog } = useData()

  if (!auditLog.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-600">
        <Activity size={40} className="mb-3 opacity-30" />
        <p className="text-sm">Nenhum registro ainda.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-climax-dark-border text-xs text-gray-500 uppercase tracking-wider">
            <th className="text-left py-3 px-4">Data / Hora</th>
            <th className="text-left py-3 px-4">Usuário</th>
            <th className="text-left py-3 px-4">Ação</th>
            <th className="text-left py-3 px-4">Detalhe</th>
          </tr>
        </thead>
        <tbody>
          {auditLog.map(entry => {
            const meta = ACTION_LABELS[entry.action] ?? { label: entry.action, color: 'text-gray-400' }
            return (
              <tr key={entry.id} className="border-b border-climax-dark-border/50 hover:bg-white/[0.02]">
                <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} className="opacity-50" />
                    {entry.timestamp}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <User size={12} className="opacity-50" />
                    {entry.user}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`font-semibold ${meta.color}`}>{meta.label}</span>
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs">{entry.details}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
