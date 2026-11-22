import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { HistorialPrecio, Producto } from './types'
import { detectarTienda } from './types'

// Las referencias se crean dentro de cada función (no a nivel de módulo),
// porque `db` sólo existe cuando Firebase está configurado.
const productsRef = () => collection(db, 'products')
const historialRef = (productId: string) =>
  collection(db, 'products', productId, 'historial')

export interface NuevoProducto {
  titulo: string
  url: string
}

// Crea un producto en estado "pendiente". El task (admin SDK) lo completará con
// el precio base, las alternativas y el historial en su próxima corrida.
export async function agregarProducto(
  ownerUid: string,
  ownerName: string,
  datos: NuevoProducto,
) {
  const url = datos.url.trim()
  await addDoc(productsRef(), {
    ownerUid,
    ownerName,
    titulo: datos.titulo.trim() || url,
    url,
    tiendaBase: detectarTienda(url),
    precioBase: null,
    moneda: 'MXN',
    mejorOpcion: null,
    mejorOferta: null,
    opciones: [],
    estado: 'pendiente',
    intentos: 0,
    ultimoMotivo: null,
    createdAt: Date.now(),
    actualizadoEn: null,
  })
}

export async function borrarProducto(id: string) {
  await deleteDoc(doc(productsRef(), id))
}

// Escucha en tiempo real los productos del usuario.
export function escucharProductos(
  ownerUid: string,
  cb: (productos: Producto[]) => void,
  onError?: (e: unknown) => void,
) {
  const q = query(productsRef(), where('ownerUid', '==', ownerUid))
  return onSnapshot(
    q,
    (snap) => {
      const productos = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Producto)
      productos.sort((a, b) => b.createdAt - a.createdAt)
      cb(productos)
    },
    onError,
  )
}

// Escucha un solo producto (para la vista de detalle).
export function escucharProducto(
  id: string,
  cb: (producto: Producto | null) => void,
  onError?: (e: unknown) => void,
) {
  return onSnapshot(
    doc(productsRef(), id),
    (snap) => cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as Producto) : null),
    onError,
  )
}

// Escucha el historial de precios de un producto (ascendente por fecha).
export function escucharHistorial(
  productId: string,
  cb: (historial: HistorialPrecio[]) => void,
  onError?: (e: unknown) => void,
) {
  const q = query(historialRef(productId), orderBy('fecha', 'asc'))
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as HistorialPrecio)),
    onError,
  )
}
