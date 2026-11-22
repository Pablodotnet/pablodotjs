export type Tienda = 'amazon' | 'mercadolibre' | 'otro'

export interface FamilyUser {
  uid: string
  nombre: string
  foto: string | null
  familyCode?: string
  ultimoAcceso?: number
}

// Normaliza el código familiar para que "Lopez Navidad" == "lopez-navidad".
export function normalizarCodigo(code: string): string {
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
  titulo: string
  url: string
  tienda: Tienda
  precio?: string
  nota?: string
  createdAt: number
}

export function detectarTienda(url: string): Tienda {
  const u = url.toLowerCase()
  if (u.includes('amazon.') || u.includes('amzn.')) return 'amazon'
  if (u.includes('mercadolibre.') || u.includes('mercadolivre.') || u.includes('meli.') || u.includes('/MLM') || u.includes('articulo.mercadolibre')) return 'mercadolibre'
  return 'otro'
}

// `color` tiñe el fondo del badge; `ink` es el texto (legible sobre fondo claro).
export const TIENDA_META: Record<
  Tienda,
  { label: string; color: string; ink: string }
> = {
  amazon: { label: 'Amazon', color: '#FF9900', ink: '#B45309' },
  mercadolibre: { label: 'Mercado Libre', color: '#FFC400', ink: '#A16207' },
  otro: { label: 'Enlace', color: '#00E5FF', ink: '#0E7490' },
}
