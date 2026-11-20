import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './auth'
import {
  agregarDeseo,
  borrarDeseo,
  escucharDeseosDe,
  listarFamiliares,
} from './db'
import type { FamilyUser, Wish } from './types'
import { Boton, NavidadShell, WishCard } from './components'

export default function NavidadApp() {
  const { user, perfil, salir } = useAuth()
  if (!user || !perfil?.familyCode) return null

  const familyCode = perfil.familyCode

  return (
    <NavidadShell>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt=""
              referrerPolicy="no-referrer"
              className="h-9 w-9 rounded-full border border-gray-200"
            />
          )}
          <div>
            <p className="text-sm font-medium">{user.displayName}</p>
            <p className="font-mono text-xs text-gray-500">
              Familia:{' '}
              <span className="rounded bg-cyan-50 px-1.5 py-0.5 text-cyan-700">
                {familyCode}
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={salir}
          className="font-mono text-xs text-gray-500 transition-colors hover:text-gray-900"
        >
          Salir
        </button>
      </div>

      <MiLista
        uid={user.uid}
        nombre={user.displayName ?? 'Sin nombre'}
        familyCode={familyCode}
      />
      <Familia miUid={user.uid} familyCode={familyCode} />
    </NavidadShell>
  )
}

function MiLista({
  uid,
  nombre,
  familyCode,
}: {
  uid: string
  nombre: string
  familyCode: string
}) {
  const [deseos, setDeseos] = useState<Wish[]>([])
  const [url, setUrl] = useState('')
  const [titulo, setTitulo] = useState('')
  const [nota, setNota] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return escucharDeseosDe(uid, setDeseos, (e) => {
      console.error(e)
      setError('No se pudieron cargar tus deseos.')
    })
  }, [uid])

  async function onAgregar(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() || !titulo.trim()) return
    setGuardando(true)
    setError('')
    try {
      await agregarDeseo(uid, nombre, familyCode, { url, titulo, nota })
      setUrl('')
      setTitulo('')
      setNota('')
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section className="mb-10">
      <h2 className="mb-3 text-lg font-semibold">Mi lista de deseos</h2>

      <form
        onSubmit={onAgregar}
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
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="¿Qué es? (ej. Audífonos inalámbricos)"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
        />
        <input
          type="text"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Nota: color, talla, etc. (opcional)"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
        />
        <Boton type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Agregar a mi lista'}
        </Boton>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {deseos.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aún no has agregado nada. Pega un link arriba para empezar. 🎁
        </p>
      ) : (
        <ul className="space-y-3">
          {deseos.map((w) => (
            <WishCard key={w.id} wish={w} onBorrar={borrarDeseo} />
          ))}
        </ul>
      )}
    </section>
  )
}

function Familia({ miUid, familyCode }: { miUid: string; familyCode: string }) {
  const [familiares, setFamiliares] = useState<FamilyUser[]>([])
  const [cargando, setCargando] = useState(true)
  const [copiado, setCopiado] = useState<string | null>(null)

  useEffect(() => {
    setCargando(true)
    listarFamiliares(familyCode)
      .then(setFamiliares)
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [familyCode])

  function copiarLink(uid: string) {
    const link = `${window.location.origin}/navidad/lista/${uid}`
    navigator.clipboard?.writeText(link)
    setCopiado(uid)
    setTimeout(() => setCopiado(null), 2000)
  }

  const otros = familiares.filter((f) => f.uid !== miUid)

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Listas de la familia</h2>
      {cargando ? (
        <p className="text-sm text-gray-500">Cargando familiares…</p>
      ) : otros.length === 0 ? (
        <p className="text-sm text-gray-500">
          Todavía nadie más ha entrado con el código{' '}
          <span className="font-mono text-cyan-700">{familyCode}</span>. Compártelo con
          tu familia junto con el link de esta app.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {otros.map((f) => (
            <li
              key={f.uid}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
            >
              <Link
                to={`/navidad/lista/${f.uid}`}
                className="flex min-w-0 items-center gap-3"
              >
                {f.foto ? (
                  <img
                    src={f.foto}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 rounded-full"
                  />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm text-gray-700">
                    {f.nombre.charAt(0)}
                  </span>
                )}
                <span className="truncate text-sm font-medium hover:text-cyan-700">
                  {f.nombre}
                </span>
              </Link>
              <button
                onClick={() => copiarLink(f.uid)}
                className="shrink-0 rounded-md border border-gray-300 px-2 py-1 font-mono text-[11px] text-gray-500 transition-colors hover:border-cyan-500 hover:text-cyan-700"
              >
                {copiado === f.uid ? '¡Copiado!' : 'Copiar link'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
