import { useEffect, useRef, useState } from 'react'
import { useAuth } from './auth'
import { TrackerShell, ProductCard, Boton } from './components'
import { agregarProducto, borrarProducto, escucharProductos } from './db'
import { detectarTienda, metaTienda, type Producto } from './types'

export default function Dashboard() {
  const { user, salir } = useAuth()
  const [productos, setProductos] = useState<Producto[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    return escucharProductos(
      user.uid,
      setProductos,
      (e) => {
        console.error(e)
        setError('No se pudieron cargar tus productos.')
      },
    )
  }, [user])

  async function onBorrar(id: string) {
    try {
      await borrarProducto(id)
    } catch (e) {
      console.error(e)
      setError('No se pudo borrar el producto.')
    }
  }

  const cargando = productos === null

  return (
    <TrackerShell onSalir={() => salir().catch(console.error)}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Mis productos</h1>
        <p className="text-sm text-gray-600">
          Hola, {user?.displayName ?? 'bienvenido'}. Pega el link de un producto para
          empezar a rastrear su precio.
        </p>
      </div>

      <FormAgregar />

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {cargando ? (
        <p className="py-10 text-center text-sm text-gray-500">Cargando…</p>
      ) : productos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <div className="mb-2 text-3xl">📦</div>
          <p className="text-sm text-gray-600">
            Aún no rastreas nada. Agrega tu primer producto arriba.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {productos.map((p) => (
            <ProductCard key={p.id} producto={p} onBorrar={onBorrar} />
          ))}
        </ul>
      )}
    </TrackerShell>
  )
}

function FormAgregar() {
  const { user } = useAuth()
  const [url, setUrl] = useState('')
  const [titulo, setTitulo] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (abierto) inputRef.current?.focus()
  }, [abierto])

  const tiendaDetectada = url.trim() ? metaTienda(detectarTienda(url)).label : null

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !url.trim()) return
    setGuardando(true)
    setError('')
    try {
      await agregarProducto(user.uid, user.displayName ?? 'Sin nombre', { titulo, url })
      setUrl('')
      setTitulo('')
      setAbierto(false)
    } catch (err) {
      console.error(err)
      setError('No se pudo agregar el producto. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  if (!abierto) {
    return (
      <div className="mb-6">
        <Boton onClick={() => setAbierto(true)} className="w-full px-4 py-3 sm:w-auto">
          + Agregar producto
        </Boton>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div>
        <label htmlFor="pt-url" className="mb-1 block text-sm font-medium text-gray-700">
          Link del producto
        </label>
        <input
          id="pt-url"
          ref={inputRef}
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.amazon.com.mx/…"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
        />
        {tiendaDetectada && (
          <p className="mt-1 text-xs text-gray-500">
            Tienda base detectada: <span className="font-medium">{tiendaDetectada}</span>
          </p>
        )}
      </div>

      <div>
        <label htmlFor="pt-titulo" className="mb-1 block text-sm font-medium text-gray-700">
          Nombre (opcional)
        </label>
        <input
          id="pt-titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Si lo dejas vacío usamos el link"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Boton type="submit" disabled={guardando} className="px-5 py-2">
          {guardando ? 'Guardando…' : 'Rastrear'}
        </Boton>
        <button
          type="button"
          onClick={() => {
            setAbierto(false)
            setError('')
          }}
          className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:text-gray-900"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
