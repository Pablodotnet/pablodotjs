import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from './auth'
import { cancelPurchase, watchPurchasesOf, watchWishesOf, markWishPurchased, getFamilyMember } from './db'
import { familiesOf, type FamilyUser, type Wish } from './types'
import { NavidadShell, WishCard } from './components'

export default function FamilyList() {
  const { uid } = useParams<{ uid: string }>()
  const { profile } = useAuth()
  const [member, setMember] = useState<FamilyUser | null>(null)
  const [wishes, setWishes] = useState<Wish[]>([])
  const [purchased, setPurchased] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)

  const myFamilies = familiesOf(profile)
  const codesKey = myFamilies.join(',')
  // Si es mi propio link, es mi lista: nunca debo ver qué me compraron.
  const isMyList = !!profile?.uid && profile.uid === uid

  useEffect(() => {
    if (!uid || myFamilies.length === 0) return
    let active = true
    setLoading(true)
    setDenied(false)

    getFamilyMember(uid)
      .then((f) => {
        if (!active) return
        setMember(f)
        // Solo se puede ver si comparte al menos una familia conmigo.
        if (!f || !familiesOf(f).some((c) => myFamilies.includes(c))) {
          setDenied(true)
          setLoading(false)
        }
      })
      .catch((e) => {
        console.error(e)
        if (active) {
          setDenied(true)
          setLoading(false)
        }
      })

    const unsub = watchWishesOf(
      uid,
      (d) => {
        if (!active) return
        setWishes(d)
        setLoading(false)
      },
      (e) => {
        console.error(e)
        if (active) {
          setDenied(true)
          setLoading(false)
        }
      },
    )
    return () => {
      active = false
      unsub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, codesKey])

  // Qué deseos ya fueron comprados (solo si NO es mi propia lista).
  useEffect(() => {
    setPurchased(new Set())
    if (!uid || myFamilies.length === 0 || isMyList) return
    return watchPurchasesOf(uid, setPurchased, (e) => console.error(e))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, codesKey, isMyList])

  if (denied) {
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

  const name = member?.name ?? 'Familiar'

  return (
    <NavidadShell>
      <Link
        to="/navidad"
        className="mb-4 inline-flex items-center gap-1 font-mono text-sm text-cyan-700 hover:underline"
      >
        ← Volver a mi familia
      </Link>
      <div className="mb-6 flex items-center gap-3">
        {member?.photo ? (
          <img
            src={member.photo}
            alt=""
            referrerPolicy="no-referrer"
            className="h-11 w-11 rounded-full"
          />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-lg text-gray-700">
            {name.charAt(0)}
          </span>
        )}
        <div>
          <h1 className="text-lg font-semibold">Lista de {name}</h1>
          <p className="text-xs text-gray-500">Deseos de Navidad 🎄</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando lista…</p>
      ) : wishes.length === 0 ? (
        <p className="text-sm text-gray-500">
          {name} todavía no ha agregado nada a su lista.
        </p>
      ) : (
        <ul className="space-y-3">
          {wishes.map((w) => (
            <WishCard
              key={w.id}
              wish={w}
              purchased={isMyList ? false : purchased.has(w.id)}
              onPurchase={
                isMyList || myFamilies.length === 0
                  ? undefined
                  : (id) => markWishPurchased(id, w.ownerUid)
              }
              onCancel={
                isMyList || myFamilies.length === 0
                  ? undefined
                  : (id) => cancelPurchase(id)
              }
            />
          ))}
        </ul>
      )}
    </NavidadShell>
  )
}
