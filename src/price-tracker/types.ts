// Tiendas que reconocemos a partir del enlace pegado. "otro" es el fallback.
export type Tienda =
  | 'amazon'
  | 'mercadolibre'
  | 'walmart'
  | 'liverpool'
  | 'coppel'
  | 'aliexpress'
  | 'otro'

// Una opción encontrada por el task en alguna tienda (incluida la base).
export interface Opcion {
  tienda: Tienda | string
  titulo: string
  url: string
  precio: number // precio actual (ya con descuento de tienda si aplica)
  moneda: string
  // Ofertas: promo bancaria / cupón que baja el costo real al pagar.
  precioEfectivo?: number // mejor precio pagando con la promo (<= precio)
  msi?: number // meses sin intereses máximos disponibles (0 = ninguno)
  promos?: string[] // textos legibles: "10% con HSBC", "18 MSI", "Cupón BINES"
}

// Costo real de una opción: el efectivo si hay promo, si no el precio de lista.
export function costoEfectivo(op: Pick<Opcion, 'precio' | 'precioEfectivo'>): number {
  return op.precioEfectivo != null && op.precioEfectivo < op.precio
    ? op.precioEfectivo
    : op.precio
}

// Un punto del historial de precios. Lo escribe el task (admin SDK) en cada corrida.
export interface HistorialPrecio {
  id: string
  fecha: number
  precioBase: number | null
  mejorPrecio: number | null // mejor precio de lista
  mejorOferta: number | null // mejor costo real (con promos)
  mejorTienda: Tienda | string | null
  moneda: string
}

export type EstadoProducto = 'pendiente' | 'rastreando' | 'ok' | 'error'

export interface Producto {
  id: string
  ownerUid: string
  ownerName: string
  titulo: string
  url: string // enlace original que pegó el usuario
  tiendaBase: Tienda
  precioBase: number | null // último precio conocido en la tienda base (lo llena el task)
  moneda: string // 'MXN' por defecto
  mejorOpcion: Opcion | null // mejor PRECIO de lista entre todas las tiendas
  mejorOferta: Opcion | null // mejor COSTO REAL (precio + promo bancaria/MSI/cupón)
  opciones: Opcion[] // todas las alternativas encontradas en la última corrida
  estado: EstadoProducto
  createdAt: number
  actualizadoEn: number | null // timestamp de la última corrida del task
}

// Detecta la tienda a partir del dominio del enlace.
export function detectarTienda(url: string): Tienda {
  const u = url.toLowerCase()
  if (u.includes('amazon.') || u.includes('amzn.')) return 'amazon'
  if (
    u.includes('mercadolibre.') ||
    u.includes('mercadolivre.') ||
    u.includes('meli.') ||
    u.includes('/MLM') ||
    u.includes('articulo.mercadolibre')
  )
    return 'mercadolibre'
  if (u.includes('walmart.')) return 'walmart'
  if (u.includes('liverpool.')) return 'liverpool'
  if (u.includes('coppel.')) return 'coppel'
  if (u.includes('aliexpress.') || u.includes('aliexpress.us')) return 'aliexpress'
  return 'otro'
}

// `color` tiñe el fondo del badge; `ink` es el texto (legible sobre fondo claro).
export const TIENDA_META: Record<
  Tienda,
  { label: string; color: string; ink: string }
> = {
  amazon: { label: 'Amazon', color: '#FF9900', ink: '#B45309' },
  mercadolibre: { label: 'Mercado Libre', color: '#FFC400', ink: '#A16207' },
  walmart: { label: 'Walmart', color: '#0071DC', ink: '#1D4ED8' },
  liverpool: { label: 'Liverpool', color: '#E5007E', ink: '#BE185D' },
  coppel: { label: 'Coppel', color: '#00539F', ink: '#1E40AF' },
  aliexpress: { label: 'AliExpress', color: '#FF4747', ink: '#DC2626' },
  otro: { label: 'Enlace', color: '#00E5FF', ink: '#0E7490' },
}

export function metaTienda(tienda: Tienda | string): {
  label: string
  color: string
  ink: string
} {
  return TIENDA_META[tienda as Tienda] ?? TIENDA_META.otro
}

// Formatea un precio numérico a moneda. Devuelve '—' si no hay dato.
export function formatearPrecio(precio: number | null | undefined, moneda = 'MXN'): string {
  if (precio == null || Number.isNaN(precio)) return '—'
  try {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: moneda }).format(
      precio,
    )
  } catch {
    return `$${precio.toFixed(2)} ${moneda}`
  }
}
