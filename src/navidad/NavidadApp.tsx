import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './auth'
import {
  addWish,
  deleteWish,
  listFamilyMembersOf,
  watchWishesOf,
} from './db'
import { familiesOf, type FamilyUser, type Wish } from './types'
import { Button, NavidadShell, WishCard } from './components'

export default function NavidadApp() {
  const { user, profile } = useAuth()
  const families = familiesOf(profile)
  if (!user || families.length === 0) return null

  return (
    <NavidadShell>
      <MyList uid={user.uid} name={user.displayName ?? 'Sin nombre'} />
      <Family myUid={user.uid} families={families} />
    </NavidadShell>
  )
}

function MyList({
  uid,
  name,
}: {
  uid: string
  name: string
}) {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle')
  // Recordamos si la lista estaba minimizada entre visitas (por dispositivo).
  const [minimized, setMinimized] = useState(() => {
    try {
      return localStorage.getItem('navidad:myList:minimized') === '1'
    } catch {
      return false
    }
  })
  const myLink = `${window.location.origin}/navidad/lista/${uid}`

  useEffect(() => {
    try {
      localStorage.setItem('navidad:myList:minimized', minimized ? '1' : '0')
    } catch {
      // localStorage puede no estar disponible (modo privado); no pasa nada.
    }
  }, [minimized])

  useEffect(() => {
    if (copyState !== 'copied') return
    const timer = window.setTimeout(() => setCopyState('idle'), 2000)
    return () => window.clearTimeout(timer)
  }, [copyState])

  async function copyMyLink() {
    setCopyState('copying')
    try {
      await navigator.clipboard.writeText(myLink)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  useEffect(() => {
    return watchWishesOf(uid, setWishes, (e) => {
      console.error(e)
      setError('No se pudieron cargar tus deseos.')
    })
  }, [uid])

  async function onAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() || !title.trim()) return
    setSaving(true)
    setError('')
    try {
      await addWish(uid, name, { url, title, note })
      setUrl('')
      setTitle('')
      setNote('')
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mb-10">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setMinimized((v) => !v)}
          aria-expanded={!minimized}
          className="flex items-center gap-2 text-lg font-semibold transition-colors hover:text-cyan-700"
        >
          <span
            aria-hidden
            className={`inline-block text-sm text-gray-400 transition-transform ${minimized ? '' : 'rotate-90'}`}
          >
            ▶
          </span>
          Mi lista de deseos
          {minimized && wishes.length > 0 && (
            <span className="font-mono text-xs font-normal text-gray-400">({wishes.length})</span>
          )}
        </button>
        <button
          type="button"
          onClick={copyMyLink}
          disabled={copyState === 'copying'}
          className="rounded-lg border border-cyan-700 px-3 py-2 text-sm font-medium text-cyan-800 hover:bg-cyan-50 disabled:cursor-wait disabled:opacity-50"
        >
          {copyState === 'copied' ? '¡Link copiado!' : copyState === 'copying' ? 'Copiando…' : 'Copiar mi link'}
        </button>
      </div>
      {minimized ? null : (
      <>
      <div aria-live="polite">
        {copyState === 'copied' && <p className="mb-3 text-sm text-cyan-800">Enlace de tu lista copiado para compartir.</p>}
        {copyState === 'error' && (
          <label className="mb-3 block text-sm text-gray-600">
            No se pudo copiar automáticamente. Copia este enlace:
            <input
              type="text"
              readOnly
              value={myLink}
              onFocus={(e) => e.currentTarget.select()}
              className="mt-1 block w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </label>
        )}
      </div>

      <form
        onSubmit={onAdd}
        className="mb-5 space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Pega el link de Amazon o Mercado Libre"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
        />
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué es? (ej. Audífonos inalámbricos)"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nota: color, talla, etc. (opcional)"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
        />
        <Button type="submit" disabled={saving}>
          {saving ? 'Guardando…' : 'Agregar a mi lista'}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {wishes.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aún no has agregado nada. Pega un link arriba para empezar. 🎁
        </p>
      ) : (
        <ul className="space-y-3">
          {wishes.map((w) => (
            <WishCard key={w.id} wish={w} onDelete={deleteWish} />
          ))}
        </ul>
      )}
      </>
      )}
    </section>
  )
}

function Family({ myUid, families }: { myUid: string; families: string[] }) {
  const [members, setMembers] = useState<FamilyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const codesKey = families.join(',')

  useEffect(() => {
    setLoading(true)
    listFamilyMembersOf(families)
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codesKey])

  function copyLink(uid: string) {
    const link = `${window.location.origin}/navidad/lista/${uid}`
    navigator.clipboard?.writeText(link)
    setCopied(uid)
    setTimeout(() => setCopied(null), 2000)
  }

  const others = members.filter((f) => f.uid !== myUid)

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Listas de la familia</h2>
      {loading ? (
        <p className="text-sm text-gray-500">Cargando familiares…</p>
      ) : others.length === 0 ? (
        <p className="text-sm text-gray-500">
          Todavía nadie más ha entrado con{' '}
          {families.length === 1 ? 'el código' : 'tus códigos'}{' '}
          {families.map((c, i) => (
            <span key={c}>
              {i > 0 && ', '}
              <span className="font-mono text-cyan-700">{c}</span>
            </span>
          ))}
          . Compártelo con tu familia junto con el link de esta app.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {others.map((f) => (
            <li
              key={f.uid}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
            >
              <Link
                to={`/navidad/lista/${f.uid}`}
                className="flex min-w-0 items-center gap-3"
              >
                {f.photo ? (
                  <img
                    src={f.photo}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 rounded-full"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm text-gray-700">
                    {f.name.charAt(0)}
                  </span>
                )}
                <span className="truncate text-sm font-medium hover:text-cyan-700">
                  {f.name}
                </span>
              </Link>
              <button
                onClick={() => copyLink(f.uid)}
                className="shrink-0 rounded-md border border-gray-300 px-2 py-1 font-mono text-[11px] text-gray-500 transition-colors hover:border-cyan-500 hover:text-cyan-700"
              >
                {copied === f.uid ? '¡Copiado!' : 'Copiar link'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
