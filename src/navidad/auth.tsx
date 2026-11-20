import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { deleteField, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db, googleProvider, firebaseReady } from '../lib/firebase'
import type { FamilyUser } from './types'
import { normalizarCodigo } from './types'

interface AuthState {
  user: User | null
  perfil: FamilyUser | null
  cargando: boolean
  firebaseReady: boolean
  entrarConGoogle: () => Promise<void>
  salir: () => Promise<void>
  guardarCodigoFamiliar: (code: string) => Promise<void>
  desvincularFamilia: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<FamilyUser | null>(null)
  const [cargando, setCargando] = useState(true)

  // Sesión de Firebase Auth.
  useEffect(() => {
    if (!firebaseReady) {
      setCargando(false)
      return
    }
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setCargando(false)
      if (u) {
        // Guardamos/actualizamos datos básicos (sin tocar el familyCode existente).
        try {
          await setDoc(
            doc(db, 'users', u.uid),
            {
              uid: u.uid,
              nombre: u.displayName ?? 'Sin nombre',
              foto: u.photoURL ?? null,
              ultimoAcceso: Date.now(),
            },
            { merge: true },
          )
        } catch (e) {
          console.error('No se pudo guardar el perfil', e)
        }
      } else {
        setPerfil(null)
      }
    })
  }, [])

  // Perfil en tiempo real (incluye el código familiar).
  useEffect(() => {
    if (!firebaseReady || !user) {
      setPerfil(null)
      return
    }
    return onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => setPerfil(snap.exists() ? (snap.data() as FamilyUser) : null),
      (e) => console.error('No se pudo leer el perfil', e),
    )
  }, [user])

  async function entrarConGoogle() {
    await signInWithPopup(auth, googleProvider)
  }

  async function salir() {
    await signOut(auth)
  }

  async function guardarCodigoFamiliar(code: string) {
    if (!user) return
    const familyCode = normalizarCodigo(code)
    if (!familyCode) throw new Error('Código inválido')
    await setDoc(doc(db, 'users', user.uid), { familyCode }, { merge: true })
  }

  async function desvincularFamilia() {
    if (!user) throw new Error('Debes iniciar sesión.')
    await updateDoc(doc(db, 'users', user.uid), { familyCode: deleteField() })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        perfil,
        cargando,
        firebaseReady,
        entrarConGoogle,
        salir,
        guardarCodigoFamiliar,
        desvincularFamilia,
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
