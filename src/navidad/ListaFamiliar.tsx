import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from './auth'
import { cancelarCompra, escucharComprasDe, escucharDeseosDe, marcarDeseoComprado, obtenerFamiliar } from './db'
import { familiasDe, type FamilyUser, type Wish } from './types'
import { NavidadShell, WishCard } from './components'

export default function ListaFamiliar() {
  const { uid } = useParams<{ uid: string }>()
  const { perfil } = useAuth()
  const [familiar, setFamiliar] = useState<FamilyUser | null>(null)
  const [deseos, setDeseos] = useState<Wish[]>([])
  const [compradas, setCompradas] = useState<Set<string>>(new Set())
  const [cargando, setCargando] = useState(true)
  const [denegado, setDenegado] = useState(false)

  const misFamilias = familiasDe(perfil)
  const clave = misFamilias.join(',')
  // Si es mi propio link, es mi lista: nunca debo ver qué me compraron.
  const esMiLista = !!perfil?.uid && perfil.uid === uid

  useEffect(() => {
    if (!uid || misFamilias.length === 0) return
    let activo = true
    setCargando(true)
    setDenegado(false)

    obtenerFamiliar(uid)
      .then((f) => {
        if (!activo) return
        setFamiliar(f)
        // Solo se puede ver si comparte al menos una familia conmigo.
        if (!f || !familiasDe(f).some((c) => misFamilias.includes(c))) {
          setDenegado(true)
          setCargando(false)
        }
      })
      .catch((e) => {
        console.error(e)
        if (activo) {
          setDenegado(true)
          setCargando(false)
        }
      })

    const unsub = escucharDeseosDe(
      uid,
      (d) => {
        if (!activo) return
        setDeseos(d)
        setCargando(false)
      },
      (e) => {
        console.error(e)
        if (activo) {
          setDenegado(true)
          setCargando(false)
        }
      },
    )
    return () => {
      activo = false
      unsub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, clave])

  // Qué deseos ya fueron comprados (solo si NO es mi propia lista).
  useEffect(() => {
    setCompradas(new Set())
    if (!uid || misFamilias.length === 0 || esMiLista) return
    return escucharComprasDe(uid, setCompradas, (e) => console.error(e))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, clave, esMiLista])

  if (denegado) {
    return (
      <NavidadShell>
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="mb-4 text-4xl">🚫</div>
          <h1 className="mb-2 text-xl font-semibold">Esta lista no es de tu familia</h1>
          <p className="mb-6 text-sm text-gray-600">
            Solo puedes ver las listas de quienes comparten alguna de tus familias.
          </p>
          <Link to="/navidad" className="font-mono text-sm text-cyan-700 hover:underline">
            ← Volver a mi familia
          </Link>
        </div>
      </NavidadShell>
    )
  }

  const nombre = familiar?.nombre ?? 'Familiar'

  return (
    <NavidadShell>
      <Link
        to="/navidad"
        className="mb-4 inline-flex items-center gap-1 font-mono text-sm text-cyan-700 hover:underline"
      >
        ← Volver a mi familia
      </Link>
      <div className="mb-6 flex items-center gap-3">
        {familiar?.foto ? (
          <img
            src={familiar.foto}
            alt=""
            referrerPolicy="no-referrer"
            className="h-11 w-11 rounded-full"
          />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-lg text-gray-700">
            {nombre.charAt(0)}
          </span>
        )}
        <div>
          <h1 className="text-lg font-semibold">Lista de {nombre}</h1>
          <p className="text-xs text-gray-500">Deseos de Navidad 🎄</p>
        </div>
      </div>

      {cargando ? (
        <p className="text-sm text-gray-500">Cargando lista…</p>
      ) : deseos.length === 0 ? (
        <p className="text-sm text-gray-500">
          {nombre} todavía no ha agregado nada a su lista.
        </p>
      ) : (
        <ul className="space-y-3">
          {deseos.map((w) => (
            <WishCard
              key={w.id}
              wish={w}
              comprado={esMiLista ? false : compradas.has(w.id)}
              onComprar={
                esMiLista || misFamilias.length === 0
                  ? undefined
                  : (id) => marcarDeseoComprado(id, w.ownerUid)
              }
              onCancelar={
                esMiLista || misFamilias.length === 0
                  ? undefined
                  : (id) => cancelarCompra(id)
              }
            />
          ))}
        </ul>
      )}
    </NavidadShell>
  )
}
