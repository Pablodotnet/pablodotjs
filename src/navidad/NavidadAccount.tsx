import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './auth'
import { familiesOf } from './types'
import { Button, NavidadShell } from './components'

// Página "Mi cuenta": datos del usuario, las familias a las que pertenece
// (con opción de desvincularse de cada una), unirse a otra y cerrar sesión.
export default function NavidadAccount() {
  const { user, profile, logOut, leaveFamily, saveFamilyCode } = useAuth()
  const families = familiesOf(profile)

  const dialog = useRef<HTMLDialogElement>(null)
  const [target, setTarget] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)
  const [leaveError, setLeaveError] = useState('')

  const [newCode, setNewCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState('')

  if (!user) return null

  function askLeave(code: string) {
    setTarget(code)
    setLeaveError('')
    dialog.current?.showModal()
  }

  async function confirmLeave() {
    if (!target || leaving) return
    setLeaving(true)
    setLeaveError('')
    try {
      await leaveFamily(target)
      dialog.current?.close()
      setTarget(null)
    } catch {
      setLeaveError('No se pudo desvincular. Intenta de nuevo.')
    } finally {
      setLeaving(false)
    }
  }

  async function join(e: React.FormEvent) {
    e.preventDefault()
    if (!newCode.trim() || joining) return
    setJoining(true)
    setJoinError('')
    try {
      await saveFamilyCode(newCode)
      setNewCode('')
    } catch {
      setJoinError('No se pudo unir a esa familia. Revisa el código e intenta de nuevo.')
    } finally {
      setJoining(false)
    }
  }

  const name = user.displayName ?? 'Sin nombre'

  return (
    <NavidadShell>
      <Link
        to="/navidad"
        className="mb-4 inline-flex items-center gap-1 font-mono text-sm text-cyan-700 hover:underline"
      >
        ← Volver a mis listas
      </Link>

      <div className="mb-8 flex items-center gap-3">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            referrerPolicy="no-referrer"
            className="h-12 w-12 rounded-full border border-gray-200"
          />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg text-gray-700">
            {name.charAt(0)}
          </span>
        )}
        <div>
          <h1 className="text-xl font-semibold">{name}</h1>
          <p className="text-sm text-gray-500">Mi cuenta</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Mis familias</h2>
        {families.length === 0 ? (
          <p className="text-sm text-gray-500">No perteneces a ninguna familia todavía.</p>
        ) : (
          <ul className="space-y-2">
            {families.map((code) => (
              <li
                key={code}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
              >
                <span className="truncate font-mono text-sm text-cyan-700">{code}</span>
                <button
                  type="button"
                  onClick={() => askLeave(code)}
                  className="shrink-0 rounded-md px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-50"
                >
                  Desvincularme
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={join} className="mt-4 flex flex-wrap items-start gap-2">
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Unirme a otra familia (código)"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
          />
          <Button type="submit" disabled={joining || !newCode.trim()}>
            {joining ? 'Uniendo…' : 'Unirme'}
          </Button>
        </form>
        {joinError && <p className="mt-2 text-sm text-red-600">{joinError}</p>}
      </section>

      <section className="border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => logOut().catch(console.error)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cerrar sesión
        </button>
      </section>

      <dialog
        ref={dialog}
        aria-labelledby="leave-title"
        aria-describedby="leave-description"
        aria-busy={leaving}
        onCancel={(e) => {
          if (leaving) e.preventDefault()
        }}
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-gray-200 bg-white p-6 text-gray-900 shadow-xl backdrop:bg-black/40"
      >
        <h2 id="leave-title" className="text-lg font-semibold">
          ¿Desvincularte de esta familia?
        </h2>
        <p id="leave-description" className="mt-3 text-sm text-gray-600">
          Saldrás de la familia <strong className="break-all">{target}</strong> y dejarán de
          compartir sus listas contigo. Tus deseos se conservarán y podrás volver a unirte con
          el mismo código.
        </p>
        {leaveError && <p role="alert" className="mt-3 text-sm text-red-700">{leaveError}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            autoFocus
            disabled={leaving}
            onClick={() => dialog.current?.close()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={leaving}
            onClick={confirmLeave}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-wait disabled:opacity-50"
          >
            {leaving ? 'Desvinculando…' : 'Sí, desvincularme'}
          </button>
        </div>
      </dialog>
    </NavidadShell>
  )
}
