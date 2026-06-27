import { createContext, useContext, useState, useEffect } from 'react'

// Credenciais iniciais — em produção, migrar para backend com bcrypt
const USERS = {
  funcionario1: { password: 'func1@2025', role: 'funcionario', displayName: 'Funcionário 1' },
  funcionario2: { password: 'func2@2025', role: 'funcionario', displayName: 'Funcionário 2' },
  Flavia:       { password: 'climax@admin', role: 'proprietario', displayName: 'Flavia' },
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('climax_session')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const login = (username, password) => {
    const record = USERS[username]
    if (!record || record.password !== password) {
      return { ok: false, error: 'Usuário ou senha inválidos.' }
    }
    const session = { username, role: record.role, displayName: record.displayName }
    localStorage.setItem('climax_session', JSON.stringify(session))
    setUser(session)
    return { ok: true }
  }

  const logout = () => {
    localStorage.removeItem('climax_session')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isOwner: user?.role === 'proprietario' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
