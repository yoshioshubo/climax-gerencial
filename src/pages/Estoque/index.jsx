import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Play, RotateCcw, ChevronLeft, FileSpreadsheet, AlertCircle } from 'lucide-react'
import Header from '../../components/Header'
import EstoqueTable from './components/EstoqueTable'
import AuditTab from './components/AuditTab'
import LogTab from './components/LogTab'
import { useAuth } from '../../contexts/AuthContext'
import { useData } from '../../contexts/DataContext'
import { parseVendasFile, calcAuditoria } from '../../utils/fileParser'

const TABS = ['Controle', 'Auditoria', 'LOG']

export default function Estoque() {
  const navigate  = useNavigate()
  const { user, isOwner } = useAuth()
  const { estoqueData, saveEstoque, aliases, clearEstoque } = useData()

  const [tab, setTab]           = useState('Controle')
  const [setupMode, setSetupMode] = useState(false)
  const [rawItems, setRawItems] = useState(null)   // itens lidos do arquivo antes de salvar
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [fileName, setFileName] = useState('')
  const fileRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setLoading(true)
    setFileName(file.name)
    try {
      const items = await parseVendasFile(file)
      setRawItems(items)
      if (isOwner) setSetupMode(true)
      else iniciarControle(items)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  const iniciarControle = (items = rawItems) => {
    if (!items) return
    saveEstoque({ items, importedAt: new Date().toISOString(), fileName }, user.displayName)
    setRawItems(null)
    setSetupMode(false)
  }

  const handleReset = () => {
    if (!confirm('Limpar todos os dados de estoque? Esta ação é irreversível.')) return
    clearEstoque()
    setRawItems(null)
    setSetupMode(false)
    setFileName('')
  }

  const items = setupMode ? rawItems : estoqueData?.items
  const hasData = !!items?.length

  return (
    <div className="min-h-screen bg-climax-dark">
      <Header />

      <main className="pt-14 max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-climax-gold mb-6 transition-colors"
        >
          <ChevronLeft size={16} /> Home
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Controle de Estoque</h2>
            {estoqueData?.importedAt && (
              <p className="text-xs text-gray-500 mt-1">
                Última importação: {new Date(estoqueData.importedAt).toLocaleString('pt-BR')}
                {estoqueData.fileName && ` · ${estoqueData.fileName}`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {estoqueData && isOwner && (
              <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors">
                <RotateCcw size={14} /> Resetar
              </button>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {loading
                ? <span className="inline-block w-4 h-4 border-2 border-climax-dark/40 border-t-climax-dark rounded-full animate-spin" />
                : <Upload size={16} />
              }
              {loading ? 'Lendo...' : 'Importar Arquivo'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.pdf"
              onChange={handleFile}
              className="hidden"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 mb-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Setup mode banner */}
        {setupMode && (
          <div className="mb-6 p-4 rounded-xl bg-climax-gold/10 border border-climax-gold/30 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-climax-gold">Modo de Configuração Inicial</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Renomeie ou exclua itens antes de iniciar o controle. Use os ícones na coluna "Ações".
              </p>
            </div>
            <button
              onClick={() => iniciarControle()}
              className="flex items-center gap-2 bg-climax-gold text-climax-dark font-bold text-sm px-5 py-2 rounded-lg hover:bg-climax-gold-light transition-colors"
            >
              <Play size={16} /> Iniciar Controle
            </button>
          </div>
        )}

        {/* Empty state */}
        {!hasData && !loading && (
          <div className="card flex flex-col items-center justify-center py-24 text-gray-600">
            <FileSpreadsheet size={48} className="mb-4 opacity-30" />
            <p className="text-sm font-medium">Nenhum dado importado ainda.</p>
            <p className="text-xs mt-1">Clique em "Importar Arquivo" para carregar um vendasDDMMAAAA.xlsx ou .pdf</p>
          </div>
        )}

        {/* Data view */}
        {hasData && (
          <div className="card p-0 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-climax-dark-border px-4 pt-2">
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`mr-6 pb-3 text-sm font-medium transition-colors ${tab === t ? 'tab-active' : 'tab-inactive'}`}
                >
                  {t}
                  {t === 'Auditoria' && items && (() => {
                    const n = items.filter(it => calcAuditoria(it).status === 'alerta').length
                    return n > 0 ? (
                      <span className="ml-1.5 text-[10px] bg-orange-500 text-white rounded-full px-1.5 py-0.5 font-bold">{n}</span>
                    ) : null
                  })()}
                </button>
              ))}
            </div>

            <div className="p-4">
              {tab === 'Controle' && (
                <EstoqueTable items={items} aliases={aliases} setupMode={setupMode} />
              )}
              {tab === 'Auditoria' && (
                <AuditTab items={items} aliases={aliases} />
              )}
              {tab === 'LOG' && <LogTab />}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
