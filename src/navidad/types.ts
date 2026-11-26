// Nota sobre idioma: el código (identificadores y comentarios) está en inglés.
// Los textos que ve el usuario siguen en español, y las CLAVES guardadas en
// Firestore conservan sus nombres en español (titulo, tienda, nombre, foto…);
// la traducción a estos tipos de dominio se hace en db.ts.

export type Store = 'amazon' | 'mercadolibre' | 'other'

export interface FamilyUser {
  uid: string
  name: string
  photo: string | null
  // Una persona puede pertenecer a varias familias a la vez.
  familyCodes?: string[]
  // Campo antiguo (una sola familia). Se conserva solo para migrar a familyCodes.
  familyCode?: string
  lastSeen?: number
}

// Devuelve las familias a las que pertenece un perfil, normalizando el modelo
// antiguo (familyCode único) al nuevo (familyCodes[]).
export function familiesOf(
  profile: { familyCodes?: string[]; familyCode?: string } | null | undefined,
): string[] {
  if (!profile) return []
  if (Array.isArray(profile.familyCodes)) return profile.familyCodes
  return profile.familyCode ? [profile.familyCode] : []
}

// Normaliza el código familiar para que "Lopez Navidad" == "lopez-navidad".
export function normalizeCode(code: string): string {
  return code
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export interface Wish {
  id: string
  ownerUid: string
  ownerName: string
  familyCode?: string
  title: string
  url: string
  store: Store
  price?: string
  note?: string
  createdAt: number
}

export function detectStore(url: string): Store {
  const u = url.toLowerCase()
  if (u.includes('amazon.') || u.includes('amzn.')) return 'amazon'
  if (u.includes('mercadolibre.') || u.includes('mercadolivre.') || u.includes('meli.') || u.includes('/MLM') || u.includes('articulo.mercadolibre')) return 'mercadolibre'
  return 'other'
}

// `color` tiñe el fondo del badge; `ink` es el texto (legible sobre fondo claro).
export const STORE_META: Record<
  Store,
  { label: string; color: string; ink: string }
> = {
  amazon: { label: 'Amazon', color: '#FF9900', ink: '#B45309' },
  mercadolibre: { label: 'Mercado Libre', color: '#FFC400', ink: '#A16207' },
  other: { label: 'Enlace', color: '#00E5FF', ink: '#0E7490' },
}
