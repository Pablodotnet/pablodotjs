import { Link } from 'react-router-dom'
import {
  costoEfectivo,
  formatearPrecio,
  metaTienda,
  type HistorialPrecio,
  type Opcion,
  type Producto,
  type Tienda,
} from './types'

export function TiendaBadge({ tienda }: { tienda: Tienda | string }) {
  const meta = metaTienda(tienda)
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-medium"
      style={{ backgroundColor: `${meta.color}22`, color: meta.ink }}
    >
      {meta.label}
    </span>
  )
}

export function Boton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// Chips de las ofertas de una opción: MSI y promos legibles.
export function OfertaBadges({ opcion }: { opcion: Opcion }) {
  const chips: string[] = []
  if (opcion.msi && opcion.msi > 0) chips.push(`${opcion.msi} MSI`)
  if (opcion.promos) chips.push(...opcion.promos)
  if (chips.length === 0) return null
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {chips.map((c, i) => (
        <span
          key={i}
          className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700"
        >
          {c}
        </span>
      ))}
    </div>
  )
}

export function TrackerShell({
  children,
  onSalir,
}: {
  children: React.ReactNode
  onSalir?: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/price-tracker" className="flex items-center gap-2 font-mono text-sm">
            <span>🏷️</span>
            <span className="font-semibold">Price Tracker</span>
          </Link>
          {onSalir && (
            <button
              onClick={onSalir}
              className="font-mono text-xs text-gray-500 transition-colors hover:text-gray-900"
            >
              Salir
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  )
}

// Etiqueta del estado de rastreo del producto.
function EstadoBadge({ producto }: { producto: Producto }) {
  const estilos: Record<string, string> = {
    pendiente: 'bg-amber-50 text-amber-700',
    rastreando: 'bg-blue-50 text-blue-700',
    ok: 'bg-emerald-50 text-emerald-700',
    sin_precio: 'bg-gray-100 text-gray-600',
    error: 'bg-red-50 text-red-700',
  }
  const texto: Record<string, string> = {
    pendiente: 'En cola',
    rastreando: 'Rastreando…',
    ok: 'Actualizado',
    sin_precio: 'Sin precio',
    error: 'Error',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${estilos[producto.estado] ?? estilos.pendiente}`}
    >
      {texto[producto.estado] ?? 'En cola'}
    </span>
  )
}

export function ProductCard({
  producto,
  onBorrar,
}: {
  producto: Producto
  onBorrar?: (id: string) => void
}) {
  const mejor = producto.mejorOpcion
  const oferta = producto.mejorOferta
  // Ahorro contra el precio de la tienda base.
  const ahorro =
    producto.precioBase != null && mejor && mejor.precio < producto.precioBase
      ? producto.precioBase - mejor.precio
      : null
  // Mostramos la mejor oferta aparte sólo si su costo real mejora al mejor precio.
  const ofertaDistinta =
    oferta &&
    (!mejor || costoEfectivo(oferta) < mejor.precio || (oferta.msi ?? 0) > 0)

  return (
    <li className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-gray-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <TiendaBadge tienda={producto.tiendaBase} />
            <EstadoBadge producto={producto} />
          </div>

          <Link
            to={`/price-tracker/producto/${producto.id}`}
            className="block truncate font-medium text-gray-900 transition-colors hover:text-cyan-700"
            title={producto.titulo}
          >
            {producto.titulo}
          </Link>

          <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-sm text-gray-500">
              Base:{' '}
              <span className="font-mono text-gray-800">
                {formatearPrecio(producto.precioBase, producto.moneda)}
              </span>
            </span>
            {mejor && (
              <span className="text-sm text-gray-500">
                Mejor:{' '}
                <span className="font-mono font-semibold text-emerald-700">
                  {formatearPrecio(mejor.precio, mejor.moneda)}
                </span>{' '}
                <TiendaBadge tienda={mejor.tienda} />
              </span>
            )}
          </div>

          {ahorro != null && (
            <p className="mt-1 text-xs font-medium text-emerald-700">
              Ahorras {formatearPrecio(ahorro, producto.moneda)} vs. la tienda base
            </p>
          )}

          {ofertaDistinta && oferta && (
            <div className="mt-2 rounded-lg bg-violet-50 px-2.5 py-1.5">
              <span className="text-sm text-violet-800">
                Mejor oferta:{' '}
                <span className="font-mono font-semibold">
                  {formatearPrecio(costoEfectivo(oferta), oferta.moneda)}
                </span>{' '}
                <TiendaBadge tienda={oferta.tienda} />
              </span>
              <OfertaBadges opcion={oferta} />
            </div>
          )}

          {producto.estado === 'pendiente' && (
            <p className="mt-2 text-xs text-gray-500">
              Se buscarán precios y alternativas en la próxima corrida del rastreador.
            </p>
          )}

          {producto.estado === 'sin_precio' && (
            <p className="mt-2 text-xs text-gray-500">
              {producto.ultimoMotivo ?? 'No se encontró un precio confiable.'} Se
              reintentará más tarde.
            </p>
          )}
        </div>

        {onBorrar && (
          <button
            onClick={() => onBorrar(producto.id)}
            className="shrink-0 rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label="Borrar"
          >
            Borrar
          </button>
        )}
      </div>
    </li>
  )
}

// Sparkline simple en SVG del historial de precios (sin librerías externas).
export function HistorialSparkline({
  historial,
  moneda = 'MXN',
}: {
  historial: HistorialPrecio[]
  moneda?: string
}) {
  const puntos = historial
    .map((h) => h.mejorPrecio ?? h.precioBase)
    .filter((v): v is number => v != null)

  if (puntos.length < 2) {
    return (
      <p className="text-sm text-gray-500">
        Aún no hay suficiente historial para graficar. Se irá completando en cada corrida.
      </p>
    )
  }

  const w = 600
  const h = 140
  const pad = 8
  const min = Math.min(...puntos)
  const max = Math.max(...puntos)
  const span = max - min || 1
  const dx = (w - pad * 2) / (puntos.length - 1)
  const y = (v: number) => h - pad - ((v - min) / span) * (h - pad * 2)
  const path = puntos
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * dx} ${y(v)}`)
    .join(' ')

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Historial de precios">
        <path d={path} fill="none" stroke="#0891b2" strokeWidth="2.5" />
        {puntos.map((v, i) => (
          <circle key={i} cx={pad + i * dx} cy={y(v)} r="3" fill="#0891b2" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between font-mono text-[11px] text-gray-500">
        <span>Mín: {formatearPrecio(min, moneda)}</span>
        <span>Máx: {formatearPrecio(max, moneda)}</span>
      </div>
    </div>
  )
}
