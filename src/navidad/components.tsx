import { Link } from 'react-router-dom'
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
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/navidad" className="flex items-center gap-2 font-mono text-sm">
            <span>🎄</span>
            <span className="font-semibold">Lista de Deseos</span>
          </Link>
          <Link
            to="/"
            className="font-mono text-xs text-gray-500 transition-colors hover:text-gray-900"
          >
            ← Portafolio
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  )
}

export function WishCard({
  wish,
  onBorrar,
}: {
  wish: Wish
  onBorrar?: (id: string) => void
}) {
  return (
    <li className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-gray-300">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <TiendaBadge tienda={wish.tienda} />
            {wish.precio && (
              <span className="font-mono text-xs text-gray-500">{wish.precio}</span>
            )}
          </div>
          <a
            href={wish.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate font-medium text-gray-900 transition-colors hover:text-cyan-700"
            title={wish.titulo}
          >
            {wish.titulo}
          </a>
          {wish.nota && <p className="mt-1 text-sm text-gray-600">{wish.nota}</p>}
          <a
            href={wish.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block truncate font-mono text-[11px] text-gray-400 hover:text-gray-600"
          >
            {wish.url}
          </a>
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
