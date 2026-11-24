import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './auth'
import { TIENDA_META, type Tienda, type Wish } from './types'

export function TiendaBadge({ tienda }: { tienda: Tienda }) {
  const meta = TIENDA_META[tienda]
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono font-medium"
      style={{ backgroundColor: `${meta.color}22`, color: meta.ink }}
    >
      {meta.label}
    </span>
  )
}

export function NavidadShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <Link to="/navidad" className="flex items-center gap-2 font-mono text-sm">
            <span>🎄</span>
            <span className="font-semibold">Lista de Deseos</span>
          </Link>
          <AccountMenu />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  )
}

// Menú de cuenta en el nav: aparece sólo con sesión iniciada. Lleva a la
// página de cuenta y permite cerrar sesión directamente.
function AccountMenu() {
  const { user, salir } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    function alClicFuera(e: MouseEvent) {
      if (contenedor.current && !contenedor.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    function alEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', alClicFuera)
    document.addEventListener('keydown', alEscape)
    return () => {
      document.removeEventListener('mousedown', alClicFuera)
      document.removeEventListener('keydown', alEscape)
    }
  }, [abierto])

  if (!user) return null

  const nombre = user.displayName ?? 'Mi cuenta'

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        className="flex items-center gap-2 rounded-full border border-gray-200 py-1 pl-1 pr-2 text-sm transition-colors hover:border-gray-300"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            referrerPolicy="no-referrer"
            className="h-7 w-7 rounded-full"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-700">
            {nombre.charAt(0)}
          </span>
        )}
        <span className="hidden max-w-[10rem] truncate font-medium sm:inline">{nombre}</span>
        <span aria-hidden className="text-xs text-gray-400">▾</span>
      </button>
      {abierto && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          <Link
            to="/navidad/cuenta"
            role="menuitem"
            onClick={() => setAbierto(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Mi cuenta
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAbierto(false)
              salir().catch(console.error)
            }}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

export function WishCard({
  wish,
  onBorrar,
  onComprar,
  comprado = false,
}: {
  wish: Wish
  onBorrar?: (id: string) => void
  onComprar?: (id: string) => Promise<void>
  // El estado "comprado" viene del padre (colección `compras`), nunca del deseo.
  // En la lista propia del dueño siempre es false: nunca ve qué le compraron.
  comprado?: boolean
}) {
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function comprar() {
    if (!onComprar || guardando || comprado) return
    setGuardando(true)
    setError('')
    try {
      await onComprar(wish.id)
    } catch {
      setError('No se pudo marcar como comprado. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <li className={`group rounded-xl border border-gray-200 p-4 shadow-sm transition-colors ${comprado ? 'bg-gray-100' : 'bg-white hover:border-gray-300'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
        {wish.imagen && (
          <a
            href={wish.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
            tabIndex={-1}
            aria-hidden
          >
            <img
              src={wish.imagen}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className={`h-16 w-16 rounded-lg border border-gray-200 bg-white object-contain ${comprado ? 'opacity-50 grayscale' : ''}`}
            />
          </a>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <TiendaBadge tienda={wish.tienda} />
            {wish.precio && (
              <span className="font-mono text-xs text-gray-500">{wish.precio}</span>
            )}
          </div>
          {comprado ? (
            <p className="truncate font-medium text-gray-500 line-through" title={wish.titulo}>
              {wish.titulo}
            </p>
          ) : <a
            href={wish.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate font-medium text-gray-900 transition-colors hover:text-cyan-700"
            title={wish.titulo}
          >
            {wish.titulo}
          </a>}
          {wish.nota && <p className="mt-1 text-sm text-gray-600">{wish.nota}</p>}
          {comprado ? (
            <p className="mt-2 truncate font-mono text-[11px] text-gray-500">{wish.url}</p>
          ) : <a
            href={wish.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block max-w-full truncate font-mono text-[11px] text-gray-400 hover:text-gray-600"
            title={wish.url}
          >
            {wish.url}
          </a>}
          {comprado ? (
            <p role="status" className="mt-3 text-sm font-medium text-gray-600">✓ Ya se lo compré</p>
          ) : onComprar && (
            <div className="mt-3">
              <button
                type="button"
                onClick={comprar}
                disabled={guardando}
                aria-label={`Marcar ${wish.titulo} como comprado`}
                className="rounded-lg border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-800 hover:bg-cyan-50 disabled:cursor-wait disabled:opacity-50"
              >
                {guardando ? 'Guardando…' : 'Ya se lo compré'}
              </button>
              <p className="mt-1 text-xs text-gray-500">Se deshabilitará para todos. No se mostrará quién lo compró.</p>
            </div>
          )}
          {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        </div>
        {onBorrar && (
          <button
            onClick={() => onBorrar(wish.id)}
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
