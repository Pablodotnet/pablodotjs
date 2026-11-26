import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './auth'
import { STORE_META, type Store, type Wish } from './types'

export function StoreBadge({ store }: { store: Store }) {
  const meta = STORE_META[store]
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
  const { user, logOut } = useAuth()
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (container.current && !container.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  if (!user) return null

  const name = user.displayName ?? 'Mi cuenta'

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
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
            {name.charAt(0)}
          </span>
        )}
        <span className="hidden max-w-[10rem] truncate font-medium sm:inline">{name}</span>
        <span aria-hidden className="text-xs text-gray-400">▾</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          <Link
            to="/navidad/cuenta"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Mi cuenta
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              logOut().catch(console.error)
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
  onDelete,
  onPurchase,
  onCancel,
  purchased = false,
}: {
  wish: Wish
  onDelete?: (id: string) => void
  onPurchase?: (id: string) => Promise<void>
  // Deshace la marca de "comprado" (por si alguien la puso por error).
  onCancel?: (id: string) => Promise<void>
  // El estado "comprado" viene del padre (colección `compras`), nunca del deseo.
  // En la lista propia del dueño siempre es false: nunca ve qué le compraron.
  purchased?: boolean
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function purchase() {
    if (!onPurchase || saving || purchased) return
    setSaving(true)
    setError('')
    try {
      await onPurchase(wish.id)
    } catch {
      setError('No se pudo marcar como comprado. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  async function cancel() {
    if (!onCancel || saving || !purchased) return
    setSaving(true)
    setError('')
    try {
      await onCancel(wish.id)
    } catch {
      setError('No se pudo deshacer. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <li className={`group rounded-xl border border-gray-200 p-4 shadow-sm transition-colors ${purchased ? 'bg-gray-100' : 'bg-white hover:border-gray-300'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <StoreBadge store={wish.store} />
            {wish.price && (
              <span className="font-mono text-xs text-gray-500">{wish.price}</span>
            )}
          </div>
          {purchased ? (
            <p className="truncate font-medium text-gray-500 line-through" title={wish.title}>
              {wish.title}
            </p>
          ) : <a
            href={wish.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate font-medium text-gray-900 transition-colors hover:text-cyan-700"
            title={wish.title}
          >
            {wish.title}
          </a>}
          {wish.note && <p className="mt-1 text-sm text-gray-600">{wish.note}</p>}
          {purchased ? (
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
          {purchased ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p role="status" className="text-sm font-medium text-gray-600">✓ Ya se lo compré</p>
              {onCancel && (
                <button
                  type="button"
                  onClick={cancel}
                  disabled={saving}
                  aria-label={`Deshacer: ${wish.title} no se ha comprado`}
                  className="text-xs text-gray-500 underline underline-offset-2 transition-colors hover:text-red-600 disabled:cursor-wait disabled:opacity-50"
                >
                  {saving ? 'Deshaciendo…' : 'Deshacer (fue por error)'}
                </button>
              )}
            </div>
          ) : onPurchase && (
            <div className="mt-3">
              <button
                type="button"
                onClick={purchase}
                disabled={saving}
                aria-label={`Marcar ${wish.title} como comprado`}
                className="rounded-lg border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-800 hover:bg-cyan-50 disabled:cursor-wait disabled:opacity-50"
              >
                {saving ? 'Guardando…' : 'Ya se lo compré'}
              </button>
              <p className="mt-1 text-xs text-gray-500">Se deshabilitará para todos. No se mostrará quién lo compró.</p>
            </div>
          )}
          {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(wish.id)}
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

export function Button({
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
