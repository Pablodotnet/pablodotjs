import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

// Las credenciales se leen de variables de entorno (archivo .env.local).
// Nunca se suben al repositorio. Ver .env.example para la plantilla.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

// Sólo inicializamos Firebase si hay credenciales. Si faltan, la app muestra
// una pantalla de "configuración pendiente" en lugar de romperse.
const app = firebaseReady ? initializeApp(firebaseConfig) : undefined

export const auth = (firebaseReady ? getAuth(app!) : undefined) as Auth
export const db = (firebaseReady ? getFirestore(app!) : undefined) as Firestore
export const googleProvider = (
  firebaseReady ? new GoogleAuthProvider() : undefined
) as GoogleAuthProvider
