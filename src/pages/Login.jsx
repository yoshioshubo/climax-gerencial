import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]     = useState({ username: '', password: '' })
  const [error, setError]   = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400)) // micro-delay visual
    const result = login(form.username.trim(), form.password)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at top, #2A0000 0%, #1A0000 60%, #0D0000 100%)' }}>
      {/* Background ornamental */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-climax-gold/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm px-4 animate-fade-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img
            src="/logo.jpg"
            alt="Climax"
            className="w-32 h-32 object-contain rounded-2xl shadow-2xl shadow-black/60 mb-4"
          />
          <div className="gold-divider" />
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Usuário</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full bg-climax-dark border border-climax-dark-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-climax-gold transition-colors"
              placeholder="funcionario1 / Flavia"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Senha</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-climax-dark border border-climax-dark-border rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-climax-gold transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-climax-dark/40 border-t-climax-dark rounded-full animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          © {new Date().getFullYear()} Climax — Uso interno
        </p>
      </div>
    </div>
  )
}
