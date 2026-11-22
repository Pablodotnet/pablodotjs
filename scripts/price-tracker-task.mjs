// Helper del rastreador de precios de Price Tracker.
//
// Lo usa la tarea programada de Claude (ver PRICE-TRACKER-SETUP.md):
//   1. `node scripts/price-tracker-task.mjs list`  -> imprime en JSON los
//      productos a revisar (pendientes o que no se actualizan hace >12 h).
//   2. Claude busca precios/alternativas en la web para cada producto.
//   3. `node scripts/price-tracker-task.mjs save <archivo.json>`  -> guarda
//      los resultados: precio base, mejor opción, opciones e historial.
//
// Requiere firebase-admin y un service account:
//   pnpm add -D firebase-admin
//   export GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/serviceAccount.json
//   (opcional) export FIREBASE_PROJECT_ID=dinamicanavidad-1caec
//
// NUNCA se corre contra producción sin querer: el service account decide el
// proyecto. El Admin SDK ignora las reglas de Firestore, así que este script
// es el único autorizado a escribir el historial.

import { readFile } from 'node:fs/promises'
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

// Cuántas horas deben pasar para volver a revisar un producto ya actualizado.
const HORAS_FRESCURA = 12
// Backoff para productos sin precio: no insistir cada corrida (ahorra búsquedas).
const HORAS_BACKOFF_SIN_PRECIO = 24
const LIMITE = Number(process.env.PT_LIMITE ?? 25)

function initAdmin() {
  // cert() acepta la RUTA a un service account JSON; si no hay ruta, usamos las
  // Application Default Credentials del entorno.
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const projectId = process.env.FIREBASE_PROJECT_ID
  initializeApp({
    credential: credsPath ? cert(credsPath) : applicationDefault(),
    ...(projectId ? { projectId } : {}),
  })
  return getFirestore()
}

// Lista los productos que toca revisar en esta corrida.
async function listar(db) {
  const ahora = Date.now()
  const umbralOk = ahora - HORAS_FRESCURA * 60 * 60 * 1000
  const umbralSinPrecio = ahora - HORAS_BACKOFF_SIN_PRECIO * 60 * 60 * 1000
  const snap = await db.collection('products').get()
  const pendientes = []
  for (const doc of snap.docs) {
    const d = doc.data()
    const act = typeof d.actualizadoEn === 'number' ? d.actualizadoEn : 0
    // Ya actualizado hace poco: sáltalo.
    if (d.estado === 'ok' && act > umbralOk) continue
    // Sin precio reciente: espera el backoff antes de reintentar.
    if (d.estado === 'sin_precio' && act > umbralSinPrecio) continue
    pendientes.push({
      id: doc.id,
      titulo: d.titulo ?? '',
      url: d.url ?? '',
      tiendaBase: d.tiendaBase ?? 'otro',
      moneda: d.moneda ?? 'MXN',
    })
    if (pendientes.length >= LIMITE) break
  }
  return pendientes
}

// Marca los productos como "rastreando" para que la UI muestre el estado.
async function marcarEnProceso(db, ids) {
  const batch = db.batch()
  for (const id of ids) {
    batch.update(db.collection('products').doc(id), { estado: 'rastreando' })
  }
  await batch.commit()
}

// Guarda los resultados que Claude obtuvo de la web.
// Formato esperado del archivo JSON (un arreglo):
// [
//   {
//     "id": "<productId>",
//     "precioBase": 1299.00,            // null si no se encontró
//     "moneda": "MXN",
//     "opciones": [
//       { "tienda": "amazon",  "titulo": "...", "url": "https://...", "precio": 1299, "moneda": "MXN" },
//       { "tienda": "walmart", "titulo": "...", "url": "https://...", "precio": 1150, "moneda": "MXN",
//         "precioEfectivo": 1035, "msi": 18, "promos": ["10% con HSBC", "18 MSI"] }
//     ]
//   },
//   // Un producto sin precio confiable se reporta así para marcarlo "sin_precio"
//   // (en vez de dejarlo colgado en "rastreando"):
//   { "id": "<productId>", "sinPrecio": true, "motivo": "Página bloqueada / sin precio actual" }
// ]
//
// mejorOpcion = menor "precio" de lista.
// mejorOferta = menor COSTO REAL = precioEfectivo (si hay promo) o precio.

// Costo real de una opción: el efectivo si mejora al de lista, si no el de lista.
function costoEfectivo(o) {
  return typeof o.precioEfectivo === 'number' && o.precioEfectivo < o.precio
    ? o.precioEfectivo
    : o.precio
}

async function guardar(db, resultados) {
  let ok = 0
  for (const r of resultados) {
    if (!r?.id) continue
    const ref = db.collection('products').doc(r.id)
    const opciones = Array.isArray(r.opciones)
      ? r.opciones.filter((o) => o && typeof o.precio === 'number')
      : []

    // Fallo explícito o sin ningún precio: marca "sin_precio" con el motivo y
    // suma un intento (backoff en list evita insistir cada corrida).
    const sinPrecio =
      r.sinPrecio === true ||
      (opciones.length === 0 && typeof r.precioBase !== 'number')
    if (sinPrecio) {
      await ref.set(
        {
          estado: 'sin_precio',
          ultimoMotivo: r.motivo ?? 'No se encontró un precio confiable.',
          intentos: FieldValue.increment(1),
          actualizadoEn: Date.now(),
        },
        { merge: true },
      )
      ok++
      continue
    }
    const mejorOpcion =
      opciones.length > 0
        ? opciones.reduce((a, b) => (b.precio < a.precio ? b : a))
        : null
    const mejorOferta =
      opciones.length > 0
        ? opciones.reduce((a, b) => (costoEfectivo(b) < costoEfectivo(a) ? b : a))
        : null
    const precioBase = typeof r.precioBase === 'number' ? r.precioBase : null
    const moneda = r.moneda ?? mejorOpcion?.moneda ?? 'MXN'
    const ahora = Date.now()

    await ref.set(
      {
        precioBase,
        moneda,
        opciones,
        mejorOpcion,
        mejorOferta,
        estado: 'ok',
        intentos: 0,
        ultimoMotivo: null,
        actualizadoEn: ahora,
      },
      { merge: true },
    )

    // Un punto del historial por corrida (sólo si hay algún precio).
    if (precioBase != null || mejorOpcion) {
      await ref.collection('historial').add({
        fecha: ahora,
        precioBase,
        mejorPrecio: mejorOpcion ? mejorOpcion.precio : null,
        mejorOferta: mejorOferta ? costoEfectivo(mejorOferta) : null,
        mejorTienda: mejorOpcion ? mejorOpcion.tienda : null,
        moneda,
        createdAt: FieldValue.serverTimestamp(),
      })
    }
    ok++
  }
  return ok
}

async function main() {
  const [cmd, arg] = process.argv.slice(2)
  const db = initAdmin()

  if (cmd === 'list') {
    const pendientes = await listar(db)
    if (pendientes.length > 0) {
      await marcarEnProceso(db, pendientes.map((p) => p.id))
    }
    process.stdout.write(JSON.stringify(pendientes, null, 2) + '\n')
    return
  }

  if (cmd === 'save') {
    if (!arg) throw new Error('Uso: node scripts/price-tracker-task.mjs save <archivo.json>')
    const contenido = await readFile(arg, 'utf8')
    const resultados = JSON.parse(contenido)
    const n = await guardar(db, Array.isArray(resultados) ? resultados : [])
    process.stdout.write(`Guardados ${n} producto(s).\n`)
    return
  }

  throw new Error('Comando desconocido. Usa "list" o "save <archivo.json>".')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
