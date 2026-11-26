import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { auth, googleProvider, firebaseReady } from '../lib/firebase'
import type { FamilyUser } from './types'
import {
  joinFamily,
  leaveFamily,
  migrateLegacyFamilyCode,
  saveBasicProfile,
  watchProfile,
} from './db'

interface AuthState {
  user: User | null
  profile: FamilyUser | null
  loading: boolean
  firebaseReady: boolean
  signInWithGoogle: () => Promise<void>
  logOut: () => Promise<void>
  saveFamilyCode: (code: string) => Promise<void>
  leaveFamily: (code: string) => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<FamilyUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Sesión de Firebase Auth.
  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false)
      return
    }
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setLoading(false)
      if (u) {
        try {
          await saveBasicProfile(u.uid, u.displayName ?? 'Sin nombre', u.photoURL ?? null)
        } catch (e) {
          console.error('No se pudo guardar el perfil', e)
        }
      } else {
        setProfile(null)
      }
    })
  }, [])

  // Perfil en tiempo real (incluye los códigos familiares).
  useEffect(() => {
    if (!firebaseReady || !user) {
      setProfile(null)
      return
    }
    return watchProfile(
      user.uid,
      (data) => {
        setProfile(data)
        // Migración del modelo antiguo (familyCode único) al nuevo (familyCodes[]).
        if (data && !Array.isArray(data.familyCodes) && data.familyCode) {
          migrateLegacyFamilyCode(user.uid, data.familyCode).catch((e) =>
            console.error('No se pudo migrar las familias', e),
          )
        }
      },
      (e) => console.error('No se pudo leer el perfil', e),
    )
  }, [user])

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider)
  }

  async function logOut() {
    await signOut(auth)
  }

  async function saveFamilyCode(code: string) {
    if (!user) return
    await joinFamily(user.uid, code)
  }

  async function leaveFamilyCode(code: string) {
    if (!user) throw new Error('Debes iniciar sesión.')
    await leaveFamily(user.uid, code)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        firebaseReady,
        signInWithGoogle,
        logOut,
        saveFamilyCode,
        leaveFamily: leaveFamilyCode,
      }}
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
