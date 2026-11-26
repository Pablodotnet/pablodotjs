import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  type DocumentData,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { FamilyUser, Store, Wish } from './types'
import { detectStore, normalizeCode } from './types'

// Las referencias se crean dentro de cada función (no a nivel de módulo),
// porque `db` sólo existe cuando Firebase está configurado.
const wishesRef = () => collection(db, 'wishes')
const usersRef = () => collection(db, 'users')
// La colección de "comprados" se llama `compras` en Firestore (esquema).
const purchasesRef = () => collection(db, 'compras')

// ---------------------------------------------------------------------------
// Mapeo Firestore <-> dominio. En Firestore las claves siguen en español
// (titulo, tienda, nombre, foto…) para no migrar los datos ya guardados; aquí
// las traducimos a los tipos de dominio en inglés y viceversa.
// ---------------------------------------------------------------------------

function storeFromRaw(value: unknown): Store {
  if (value === 'amazon') return 'amazon'
  if (value === 'mercadolibre') return 'mercadolibre'
  return 'other'
}

function storeToRaw(store: Store): string {
  return store === 'other' ? 'otro' : store
}

function wishFromDoc(id: string, d: DocumentData): Wish {
  return {
    id,
    ownerUid: d.ownerUid,
    ownerName: d.ownerName,
    familyCode: d.familyCode,
    title: d.titulo ?? '',
    url: d.url ?? '',
    store: storeFromRaw(d.tienda),
    price: d.precio,
    note: d.nota,
    createdAt: d.createdAt,
  }
}

function userFromDoc(d: DocumentData): FamilyUser {
  return {
    uid: d.uid,
    name: d.nombre ?? 'Sin nombre',
    photo: d.foto ?? null,
    familyCodes: d.familyCodes,
    familyCode: d.familyCode,
    lastSeen: d.ultimoAcceso,
  }
}

export interface NewWish {
  title: string
  url: string
  note?: string
}

// Un deseo pertenece a su dueño y lo ven todas sus familias; por eso no se
// etiqueta con un código familiar concreto.
export async function addWish(
  ownerUid: string,
  ownerName: string,
  data: NewWish,
) {
  await addDoc(wishesRef(), {
    ownerUid,
    ownerName,
    titulo: data.title.trim(),
    url: data.url.trim(),
    tienda: storeToRaw(detectStore(data.url)),
    nota: data.note?.trim() || '',
    createdAt: Date.now(),
  })
}

export async function deleteWish(id: string) {
  await deleteDoc(doc(wishesRef(), id))
}

// El estado "comprado" vive en la colección `compras` (doc id = id del deseo),
// que el dueño NO puede leer. Así nadie le revela qué le compraron.
// No se guarda quién lo compró, solo que ya se compró.
export async function markWishPurchased(wishId: string, ownerUid: string) {
  await setDoc(doc(purchasesRef(), wishId), {
    ownerUid,
    createdAt: Date.now(),
  })
}

// Deshace la marca de "comprado" (por si se marcó por error). Las reglas sólo
// permiten borrarla a un familiar que comparta la familia, nunca al dueño.
export async function cancelPurchase(wishId: string) {
  await deleteDoc(doc(purchasesRef(), wishId))
}

// Escucha en tiempo real qué deseos de un familiar ya fueron comprados.
// Devuelve un Set con los ids de los deseos comprados.
// Las reglas impiden que el dueño lea esto sobre su propia lista.
export function watchPurchasesOf(
  ownerUid: string,
  cb: (purchased: Set<string>) => void,
  onError?: (e: unknown) => void,
) {
  const q = query(purchasesRef(), where('ownerUid', '==', ownerUid))
  return onSnapshot(
    q,
    (snap) => cb(new Set(snap.docs.map((d) => d.id))),
    onError,
  )
}

// Escucha en tiempo real los deseos de un familiar.
export function watchWishesOf(
  ownerUid: string,
  cb: (wishes: Wish[]) => void,
  onError?: (e: unknown) => void,
) {
  // La familia actual del propietario determina el acceso en las reglas.
  // Los deseos se conservan al salir o cambiar de familia.
  const q = query(wishesRef(), where('ownerUid', '==', ownerUid))
  return onSnapshot(
    q,
    (snap) => {
      const wishes = snap.docs.map((d) => wishFromDoc(d.id, d.data()))
      wishes.sort((a, b) => b.createdAt - a.createdAt)
      cb(wishes)
    },
    onError,
  )
}

// Lista a los familiares que comparten AL MENOS UNA de las familias dadas.
// Firestore limita array-contains-any a 10 valores; tomamos los primeros 10.
export async function listFamilyMembersOf(codes: string[]): Promise<FamilyUser[]> {
  if (codes.length === 0) return []
  const q = query(
    usersRef(),
    where('familyCodes', 'array-contains-any', codes.slice(0, 10)),
  )
  const snap = await getDocs(q)
  const members = snap.docs.map((d) => userFromDoc(d.data()))
  members.sort((a, b) => a.name.localeCompare(b.name))
  return members
}

export async function getFamilyMember(uid: string): Promise<FamilyUser | null> {
  const snap = await getDoc(doc(usersRef(), uid))
  return snap.exists() ? userFromDoc(snap.data()) : null
}

// ---------------------------------------------------------------------------
// Perfil del usuario. Toda la lectura/escritura de /users y el mapeo de claves
// en español vive aquí, para que el resto del código quede en inglés.
// ---------------------------------------------------------------------------

// Guarda/actualiza los datos básicos del perfil (sin tocar los familyCodes).
export async function saveBasicProfile(
  uid: string,
  name: string,
  photo: string | null,
) {
  await setDoc(
    doc(usersRef(), uid),
    { uid, nombre: name, foto: photo, ultimoAcceso: Date.now() },
    { merge: true },
  )
}

// Escucha el perfil en tiempo real (incluye los códigos familiares).
export function watchProfile(
  uid: string,
  cb: (profile: FamilyUser | null) => void,
  onError?: (e: unknown) => void,
) {
  return onSnapshot(
    doc(usersRef(), uid),
    (snap) => cb(snap.exists() ? userFromDoc(snap.data()) : null),
    onError,
  )
}

// Migra el modelo antiguo (familyCode único) al nuevo (familyCodes[]).
export async function migrateLegacyFamilyCode(uid: string, legacyCode: string) {
  await updateDoc(doc(usersRef(), uid), {
    familyCodes: arrayUnion(normalizeCode(legacyCode)),
  })
}

// Une al usuario a una familia (aditivo: puede pertenecer a varias).
export async function joinFamily(uid: string, code: string) {
  const familyCode = normalizeCode(code)
  if (!familyCode) throw new Error('Código inválido')
  await setDoc(
    doc(usersRef(), uid),
    { familyCodes: arrayUnion(familyCode) },
    { merge: true },
  )
}

// Quita al usuario de una familia específica.
export async function leaveFamily(uid: string, code: string) {
  await updateDoc(doc(usersRef(), uid), { familyCodes: arrayRemove(code) })
}
