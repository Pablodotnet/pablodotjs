// Backfill único: migra los usuarios del modelo antiguo (familyCode: string)
// al nuevo (familyCodes: string[]), para que los familiares registrados antes
// del cambio vuelvan a aparecer.
//
// El cliente sólo migra el documento de quien abre la app (las reglas sólo
// permiten escribir el propio perfil). Este script usa el Admin SDK, que
// ignora las reglas, para migrar a TODOS de una vez.
//
// Requiere firebase-admin y un service account (igual que el price-tracker):
//   export GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/serviceAccount.json
//   (opcional) export FIREBASE_PROJECT_ID=dinamicanavidad-1caec
//   node scripts/navidad-migrate-familias.mjs          # simula (dry-run)
//   node scripts/navidad-migrate-familias.mjs --apply  # aplica los cambios
//
// Es idempotente y no destructivo: sólo añade familyCodes a quien no lo tenga
// y conserva el campo familyCode antiguo.

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

// Misma normalización que src/navidad/types.ts
function normalizarCodigo(code) {
  return String(code)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function initAdmin() {
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const projectId = process.env.FIREBASE_PROJECT_ID
  initializeApp({
    credential: credsPath ? cert(credsPath) : applicationDefault(),
    ...(projectId ? { projectId } : {}),
  })
  return getFirestore()
}

async function main() {
  const aplicar = process.argv.includes('--apply')
  const db = initAdmin()
  const snap = await db.collection('users').get()

  const pendientes = []
  for (const doc of snap.docs) {
    const d = doc.data()
    const yaTiene = Array.isArray(d.familyCodes)
    const codigo = typeof d.familyCode === 'string' ? normalizarCodigo(d.familyCode) : ''
    if (!yaTiene && codigo) {
      pendientes.push({ id: doc.id, nombre: d.nombre ?? '(sin nombre)', codigo })
    }
  }

  if (pendientes.length === 0) {
    console.log('Nada que migrar: todos los usuarios ya tienen familyCodes[].')
    return
  }

  console.log(`${pendientes.length} usuario(s) por migrar:`)
  for (const p of pendientes) {
    console.log(`  - ${p.nombre} (${p.id}) -> familyCodes: ['${p.codigo}']`)
  }

  if (!aplicar) {
    console.log('\nDry-run. Vuelve a correr con --apply para aplicar los cambios.')
    return
  }

  let n = 0
  for (const p of pendientes) {
    await db.collection('users').doc(p.id).update({
      familyCodes: FieldValue.arrayUnion(p.codigo),
    })
    n++
  }
  console.log(`\nListo: ${n} usuario(s) migrado(s).`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
