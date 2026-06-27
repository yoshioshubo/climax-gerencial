import { createContext, useContext, useState, useCallback } from 'react'
import { format } from 'date-fns'

const DataContext = createContext(null)

const STORAGE_KEY = 'climax_estoque'
const LOG_KEY     = 'climax_log'

function loadFromStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? null } catch { return null }
}
function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function DataProvider({ children }) {
  const [estoqueData, setEstoqueData]   = useState(() => loadFromStorage(STORAGE_KEY))
  const [auditLog, setAuditLog]         = useState(() => loadFromStorage(LOG_KEY) ?? [])

  // ── Aliases: mapeamento nome_sistema → alias_exibição
  const [aliases, setAliases] = useState(() => loadFromStorage('climax_aliases') ?? {})

  const appendLog = useCallback((entry) => {
    setAuditLog(prev => {
      const next = [{ id: Date.now(), timestamp: format(new Date(), 'dd/MM/yyyy HH:mm:ss'), ...entry }, ...prev]
      saveToStorage(LOG_KEY, next)
      return next
    })
  }, [])

  const saveEstoque = useCallback((data, user) => {
    saveToStorage(STORAGE_KEY, data)
    setEstoqueData(data)
    appendLog({ action: 'SALVAR_ESTOQUE', user, details: `${data.items?.length ?? 0} itens` })
  }, [appendLog])

  const updateItem = useCallback((itemId, field, value, user) => {
    setEstoqueData(prev => {
      const next = { ...prev, items: prev.items.map(it =>
        it.id === itemId ? { ...it, [field]: value } : it
      )}
      saveToStorage(STORAGE_KEY, next)
      appendLog({ action: 'EDITAR_ITEM', user, details: `${field} → "${value}" (id: ${itemId})` })
      return next
    })
  }, [appendLog])

  const deleteItem = useCallback((itemId, itemName, user) => {
    setEstoqueData(prev => {
      const next = { ...prev, items: prev.items.filter(it => it.id !== itemId) }
      saveToStorage(STORAGE_KEY, next)
      appendLog({ action: 'EXCLUIR_ITEM', user, details: `"${itemName}" removido` })
      return next
    })
  }, [appendLog])

  const renameItem = useCallback((itemId, newAlias, user) => {
    setAliases(prev => {
      const next = { ...prev, [itemId]: newAlias }
      saveToStorage('climax_aliases', next)
      return next
    })
    appendLog({ action: 'RENOMEAR_ITEM', user, details: `id ${itemId} → alias "${newAlias}"` })
  }, [appendLog])

  const clearEstoque = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setEstoqueData(null)
  }, [])

  return (
    <DataContext.Provider value={{
      estoqueData, saveEstoque, updateItem, deleteItem, renameItem, clearEstoque,
      aliases, auditLog,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
