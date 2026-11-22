import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth, googleProvider, firebaseReady } from '../lib/firebase'

interface AuthState {
  user: User | null
  cargando: boolean
  firebaseReady: boolean
  entrarConGoogle: () => Promise<void>
  salir: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

// Auth de price-tracker: sólo sesión de Google. Cada quien ve únicamente sus
// propios productos (las reglas filtran por ownerUid), así que no hay perfiles
// compartidos ni código familiar como en la app de Navidad.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!firebaseReady) {
      setCargando(false)
      return
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setCargando(false)
    })
  }, [])

  async function entrarConGoogle() {
    await signInWithPopup(auth, googleProvider)
  }

  async function salir() {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{ user, cargando, firebaseReady, entrarConGoogle, salir }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
