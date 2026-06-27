import { useAuth } from '../contexts/AuthContext'
import { LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur border-b border-white/10" style={{ background: 'rgba(26,0,0,0.92)' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-climax-gold uppercase">
          Climax Gerencial
        </span>
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <User size={14} />
              <span>{user.displayName}</span>
              {user.role === 'proprietario' && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-climax-gold text-climax-dark tracking-wider">
                  ADMIN
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
