import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package, TrendingUp, Landmark, BarChart2, LayoutDashboard, ArrowLeftRight, Lock
} from 'lucide-react'
import Header from '../components/Header'

const MODULES = [
  {
    id: 'estoque',
    label: 'CONTROLE DE ESTOQUE',
    icon: Package,
    active: true,
    path: '/estoque',
    gradient: 'from-amber-400 via-yellow-400 to-amber-500',
    description: 'Ingestão · Auditoria · LOG',
  },
  {
    id: 'vendas',
    label: 'OTIMIZAÇÃO DE VENDAS',
    icon: TrendingUp,
    active: false,
    gradient: 'from-emerald-600 via-green-500 to-teal-500',
    description: 'Em breve',
  },
  {
    id: 'bancaria',
    label: 'CONCILIAÇÃO BANCÁRIA',
    icon: Landmark,
    active: false,
    gradient: 'from-blue-700 via-blue-500 to-sky-500',
    description: 'Em breve',
  },
  {
    id: 'dre',
    label: 'DRE GERENCIAL',
    icon: BarChart2,
    active: false,
    gradient: 'from-purple-700 via-purple-500 to-violet-500',
    description: 'Em breve',
  },
  {
    id: 'dashboard',
    label: 'DASHBOARD GERENCIAL',
    icon: LayoutDashboard,
    active: false,
    gradient: 'from-orange-600 via-orange-500 to-amber-500',
    description: 'Em breve',
  },
  {
    id: 'movimento',
    label: 'CONTROLE DE MOVIMENTO',
    icon: ArrowLeftRight,
    active: false,
    gradient: 'from-rose-700 via-rose-500 to-pink-500',
    description: 'Em breve',
  },
]

function ModuleButton({ mod, onClick }) {
  const [pressed, setPressed] = useState(false)
  const Icon = mod.icon

  if (!mod.active) {
    return (
      <div className="relative select-none cursor-not-allowed">
        <div className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl h-32
          bg-gradient-to-br ${mod.gradient} opacity-60 border border-white/10`}>
          <div className="absolute top-2.5 right-2.5 bg-black/50 rounded-lg p-1.5">
            <Lock size={22} className="text-white drop-shadow" />
          </div>
          <Icon size={22} className="text-white drop-shadow" />
          <span className="text-[10px] font-extrabold tracking-widest text-white text-center leading-snug uppercase drop-shadow">
            {mod.label}
          </span>
          <span className="text-[9px] text-white/60">Em breve</span>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        setPressed(true)
        setTimeout(() => { setPressed(false); onClick(mod.path) }, 250)
      }}
      className={`
        relative group w-full flex flex-col items-center justify-center gap-2 p-4 rounded-xl h-32
        bg-gradient-to-br from-climax-gold via-yellow-400 to-amber-500
        border border-yellow-300/30
        shadow-lg shadow-yellow-900/30
        transition-all duration-200
        ${pressed ? 'scale-95 shadow-sm' : 'hover:scale-[1.04] hover:shadow-yellow-500/30 hover:shadow-xl'}
      `}
    >
      <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <Icon size={26} className="text-climax-dark drop-shadow" />
      <span className="text-[10px] font-extrabold tracking-widest text-climax-dark text-center leading-snug uppercase">
        {mod.label}
      </span>
      <span className="text-[9px] text-climax-dark/60 font-medium">{mod.description}</span>
    </button>
  )
}

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #2A0000 0%, #1A0000 60%, #0D0000 100%)' }}>
      <Header />

      <main className="pt-14 max-w-3xl mx-auto px-4 py-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 animate-fade-up">
          <img
            src="/logo.jpg"
            alt="Climax Pizzaria & Conveniência"
            className="w-40 h-40 object-contain rounded-2xl shadow-2xl shadow-black/60"
          />
          <p className="text-[11px] tracking-[0.25em] uppercase text-white/30 mt-4">
            Sistema de Gestão Integrada
          </p>
        </div>

        {/* Grid de módulos */}
        <div className="grid grid-cols-3 gap-3">
          {MODULES.map((mod, i) => (
            <div
              key={mod.id}
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              className="animate-fade-up"
            >
              <ModuleButton mod={mod} onClick={navigate} />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
