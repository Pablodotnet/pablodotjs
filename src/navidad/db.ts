import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { FamilyUser, Wish } from './types'
import { detectarTienda } from './types'

// Las referencias se crean dentro de cada función (no a nivel de módulo),
// porque `db` sólo existe cuando Firebase está configurado.
const wishesRef = () => collection(db, 'wishes')
const usersRef = () => collection(db, 'users')

export interface NuevoDeseo {
  titulo: string
  url: string
  nota?: string
}

export async function setCodigoFamiliar(uid: string, familyCode: string) {
  await setDoc(doc(usersRef(), uid), { familyCode }, { merge: true })
}

export async function agregarDeseo(
  ownerUid: string,
  ownerName: string,
  familyCode: string,
  datos: NuevoDeseo,
) {
  await addDoc(wishesRef(), {
    ownerUid,
    ownerName,
    familyCode,
    titulo: datos.titulo.trim(),
    url: datos.url.trim(),
    tienda: detectarTienda(datos.url),
    nota: datos.nota?.trim() || '',
    createdAt: Date.now(),
  })
}

export async function borrarDeseo(id: string) {
  await deleteDoc(doc(wishesRef(), id))
}

// Solo se guarda el estado: ningún dato de quien compró el regalo.
export async function marcarDeseoComprado(id: string) {
  const ref = doc(wishesRef(), id)
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref)
    if (!snap.exists()) throw new Error('El deseo ya no existe.')
    if (snap.data().comprado === true) return
    transaction.update(ref, { comprado: true })
  })
}

// Escucha en tiempo real los deseos de un familiar.
export function escucharDeseosDe(
  ownerUid: string,
  familyCode: string,
  cb: (deseos: Wish[]) => void,
  onError?: (e: unknown) => void,
) {
  const q = query(
    wishesRef(),
    where('ownerUid', '==', ownerUid),
    where('familyCode', '==', familyCode),
  )
  return onSnapshot(
    q,
    (snap) => {
      const deseos = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Wish)
      deseos.sort((a, b) => b.createdAt - a.createdAt)
      cb(deseos)
    },
    onError,
  )
}

// Lista a los familiares que comparten el mismo código.
export async function listarFamiliares(familyCode: string): Promise<FamilyUser[]> {
  const q = query(usersRef(), where('familyCode', '==', familyCode))
  const snap = await getDocs(q)
  const familiares = snap.docs.map((d) => d.data() as FamilyUser)
  familiares.sort((a, b) => a.nombre.localeCompare(b.nombre))
  return familiares
}

export async function obtenerFamiliar(uid: string): Promise<FamilyUser | null> {
  const snap = await getDoc(doc(usersRef(), uid))
  return snap.exists() ? (snap.data() as FamilyUser) : null
}
