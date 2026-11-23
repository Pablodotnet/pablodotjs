import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './auth'
import { familiasDe } from './types'
import { Boton, NavidadShell } from './components'

// Página "Mi cuenta": datos del usuario, las familias a las que pertenece
// (con opción de desvincularse de cada una), unirse a otra y cerrar sesión.
export default function NavidadCuenta() {
  const { user, perfil, salir, desvincularFamilia, guardarCodigoFamiliar } = useAuth()
  const familias = familiasDe(perfil)

  const dialog = useRef<HTMLDialogElement>(null)
  const [objetivo, setObjetivo] = useState<string | null>(null)
  const [quitando, setQuitando] = useState(false)
  const [errorQuitar, setErrorQuitar] = useState('')

  const [nuevo, setNuevo] = useState('')
  const [uniendo, setUniendo] = useState(false)
  const [errorUnir, setErrorUnir] = useState('')

  if (!user) return null

  function pedirDesvincular(code: string) {
    setObjetivo(code)
    setErrorQuitar('')
    dialog.current?.showModal()
  }

  async function confirmarDesvincular() {
    if (!objetivo || quitando) return
    setQuitando(true)
    setErrorQuitar('')
    try {
      await desvincularFamilia(objetivo)
      dialog.current?.close()
      setObjetivo(null)
    } catch {
      setErrorQuitar('No se pudo desvincular. Intenta de nuevo.')
    } finally {
      setQuitando(false)
    }
  }

  async function unirme(e: React.FormEvent) {
    e.preventDefault()
    if (!nuevo.trim() || uniendo) return
    setUniendo(true)
    setErrorUnir('')
    try {
      await guardarCodigoFamiliar(nuevo)
      setNuevo('')
    } catch {
      setErrorUnir('No se pudo unir a esa familia. Revisa el código e intenta de nuevo.')
    } finally {
      setUniendo(false)
    }
  }

  const nombre = user.displayName ?? 'Sin nombre'

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
            {nombre.charAt(0)}
          </span>
        )}
        <div>
          <h1 className="text-xl font-semibold">{nombre}</h1>
          <p className="text-sm text-gray-500">Mi cuenta</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Mis familias</h2>
        {familias.length === 0 ? (
          <p className="text-sm text-gray-500">No perteneces a ninguna familia todavía.</p>
        ) : (
          <ul className="space-y-2">
            {familias.map((code) => (
              <li
                key={code}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
              >
                <span className="truncate font-mono text-sm text-cyan-700">{code}</span>
                <button
                  type="button"
                  onClick={() => pedirDesvincular(code)}
                  className="shrink-0 rounded-md px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-50"
                >
                  Desvincularme
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={unirme} className="mt-4 flex flex-wrap items-start gap-2">
          <input
            type="text"
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            placeholder="Unirme a otra familia (código)"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
          />
          <Boton type="submit" disabled={uniendo || !nuevo.trim()}>
            {uniendo ? 'Uniendo…' : 'Unirme'}
          </Boton>
        </form>
        {errorUnir && <p className="mt-2 text-sm text-red-600">{errorUnir}</p>}
      </section>

      <section className="border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => salir().catch(console.error)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cerrar sesión
        </button>
      </section>

      <dialog
        ref={dialog}
        aria-labelledby="desvincular-titulo"
        aria-describedby="desvincular-descripcion"
        aria-busy={quitando}
        onCancel={(e) => {
          if (quitando) e.preventDefault()
        }}
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-gray-200 bg-white p-6 text-gray-900 shadow-xl backdrop:bg-black/40"
      >
        <h2 id="desvincular-titulo" className="text-lg font-semibold">
          ¿Desvincularte de esta familia?
        </h2>
        <p id="desvincular-descripcion" className="mt-3 text-sm text-gray-600">
          Saldrás de la familia <strong className="break-all">{objetivo}</strong> y dejarán de
          compartir sus listas contigo. Tus deseos se conservarán y podrás volver a unirte con
          el mismo código.
        </p>
        {errorQuitar && <p role="alert" className="mt-3 text-sm text-red-700">{errorQuitar}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            autoFocus
            disabled={quitando}
            onClick={() => dialog.current?.close()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={quitando}
            onClick={confirmarDesvincular}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-wait disabled:opacity-50"
          >
            {quitando ? 'Desvinculando…' : 'Sí, desvincularme'}
          </button>
        </div>
      </dialog>
    </NavidadShell>
  )
}
