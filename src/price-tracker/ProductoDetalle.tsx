import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from './auth'
import { HistorialSparkline, OfertaBadges, TiendaBadge, TrackerShell } from './components'
import { escucharHistorial, escucharProducto } from './db'
import {
  costoEfectivo,
  formatearPrecio,
  type HistorialPrecio,
  type Producto,
} from './types'

export default function ProductoDetalle() {
  const { id } = useParams<{ id: string }>()
  const { salir } = useAuth()
  const [producto, setProducto] = useState<Producto | null | undefined>(undefined)
  const [historial, setHistorial] = useState<HistorialPrecio[]>([])

  useEffect(() => {
    if (!id) return
    const off1 = escucharProducto(id, setProducto, (e) => {
      console.error(e)
      setProducto(null)
    })
    const off2 = escucharHistorial(id, setHistorial, console.error)
    return () => {
      off1()
      off2()
    }
  }, [id])

  return (
    <TrackerShell onSalir={() => salir().catch(console.error)}>
      <Link
        to="/price-tracker"
        className="mb-4 inline-block font-mono text-xs text-gray-500 hover:text-gray-900"
      >
        ← Volver
      </Link>

      {producto === undefined ? (
        <p className="py-10 text-center text-sm text-gray-500">Cargando…</p>
      ) : producto === null ? (
        <p className="py-10 text-center text-sm text-gray-500">
          Este producto ya no existe.
        </p>
      ) : (
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <TiendaBadge tienda={producto.tiendaBase} />
            </div>
            <h1 className="text-2xl font-semibold">{producto.titulo}</h1>
            <a
              href={producto.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block max-w-full truncate font-mono text-xs text-gray-400 hover:text-gray-600"
              title={producto.url}
            >
              {producto.url}
            </a>
            {producto.actualizadoEn && (
              <p className="mt-2 text-xs text-gray-500">
                Última actualización:{' '}
                {new Date(producto.actualizadoEn).toLocaleString('es-MX')}
              </p>
            )}
          </div>

          {/* Precios */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Tienda base</p>
              <p className="mt-1 font-mono text-xl font-semibold text-gray-900">
                {formatearPrecio(producto.precioBase, producto.moneda)}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-700">
                Mejor precio
              </p>
              {producto.mejorOpcion ? (
                <>
                  <p className="mt-1 font-mono text-xl font-semibold text-emerald-800">
                    {formatearPrecio(
                      producto.mejorOpcion.precio,
                      producto.mejorOpcion.moneda,
                    )}
                  </p>
                  <a
                    href={producto.mejorOpcion.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-2 text-sm text-emerald-800 hover:underline"
                  >
                    <TiendaBadge tienda={producto.mejorOpcion.tienda} /> Ver →
                  </a>
                </>
              ) : (
                <p className="mt-1 text-sm text-emerald-700">Buscando…</p>
              )}
            </div>

            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
              <p className="text-xs uppercase tracking-wide text-violet-700">
                Mejor oferta
              </p>
              {producto.mejorOferta ? (
                <>
                  <p className="mt-1 font-mono text-xl font-semibold text-violet-800">
                    {formatearPrecio(
                      costoEfectivo(producto.mejorOferta),
                      producto.mejorOferta.moneda,
                    )}
                  </p>
                  {producto.mejorOferta.precioEfectivo != null &&
                    producto.mejorOferta.precioEfectivo < producto.mejorOferta.precio && (
                      <p className="font-mono text-xs text-violet-600 line-through">
                        {formatearPrecio(
                          producto.mejorOferta.precio,
                          producto.mejorOferta.moneda,
                        )}
                      </p>
                    )}
                  <OfertaBadges opcion={producto.mejorOferta} />
                  <a
                    href={producto.mejorOferta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-2 text-sm text-violet-800 hover:underline"
                  >
                    <TiendaBadge tienda={producto.mejorOferta.tienda} /> Ver →
                  </a>
                </>
              ) : (
                <p className="mt-1 text-sm text-violet-700">Buscando ofertas…</p>
              )}
            </div>
          </div>

          {/* Historial */}
          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">
              Historial de precios
            </h2>
            <HistorialSparkline historial={historial} moneda={producto.moneda} />
          </section>

          {/* Todas las opciones */}
          {producto.opciones.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-gray-700">
                Opciones encontradas
              </h2>
              <ul className="space-y-2">
                {[...producto.opciones]
                  .sort((a, b) => costoEfectivo(a) - costoEfectivo(b))
                  .map((op, i) => (
                    <li
                      key={`${op.url}-${i}`}
                      className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3"
                    >
                      <div className="min-w-0">
                        <div className="mb-1">
                          <TiendaBadge tienda={op.tienda} />
                        </div>
                        <a
                          href={op.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate text-sm text-gray-900 hover:text-cyan-700"
                          title={op.titulo}
                        >
                          {op.titulo}
                        </a>
                        <OfertaBadges opcion={op} />
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {formatearPrecio(costoEfectivo(op), op.moneda)}
                        </span>
                        {op.precioEfectivo != null && op.precioEfectivo < op.precio && (
                          <span className="block font-mono text-[11px] text-gray-400 line-through">
                            {formatearPrecio(op.precio, op.moneda)}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </TrackerShell>
  )
}
