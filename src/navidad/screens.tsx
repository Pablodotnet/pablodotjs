import { useState } from 'react'
import { Boton, NavidadShell } from './components'

export function Cargando() {
  return (
    <NavidadShell>
      <p className="py-16 text-center text-sm text-gray-500">Cargando…</p>
    </NavidadShell>
  )
}

export function ConfigFaltante() {
  return (
    <NavidadShell>
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mb-4 text-4xl">⚙️</div>
        <h1 className="mb-2 text-xl font-semibold">Falta configurar Firebase</h1>
        <p className="text-sm text-gray-600">
          Crea un archivo <code className="text-cyan-700">.env.local</code> con las
          credenciales de tu proyecto de Firebase (usa{' '}
          <code className="text-cyan-700">.env.example</code> como plantilla) y reinicia el
          servidor.
        </p>
      </div>
    </NavidadShell>
  )
}

export function Bienvenida({ onEntrar }: { onEntrar: () => Promise<void> }) {
  const [error, setError] = useState('')
  async function entrar() {
    try {
      await onEntrar()
    } catch (e) {
      console.error(e)
      setError('No se pudo iniciar sesión. Intenta de nuevo.')
    }
  }
  return (
    <NavidadShell>
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mb-4 text-5xl">🎄</div>
        <h1 className="mb-2 text-2xl font-semibold">Lista de Deseos Familiar</h1>
        <p className="mb-8 text-sm text-gray-600">
          Entra con tu cuenta de Google, arma tu lista de deseos con links de Amazon o
          Mercado Libre, y comparte el enlace con la familia para esta Navidad. 🎁
        </p>
        <Boton onClick={entrar} className="px-6 py-3">
          Entrar con Google
        </Boton>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </NavidadShell>
  )
}

export function CodigoFamiliar({
  onGuardar,
  onSalir,
}: {
  onGuardar: (code: string) => Promise<void>
  onSalir: () => Promise<void>
}) {
  const [codigo, setCodigo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    if (!codigo.trim()) return
    setGuardando(true)
    setError('')
    try {
      await onGuardar(codigo)
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar el código. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <NavidadShell>
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mb-4 text-5xl">🔑</div>
        <h1 className="mb-2 text-2xl font-semibold">Código familiar</h1>
        <p className="mb-6 text-sm text-gray-600">
          Escribe el código que acordaron en tu familia (ej.{' '}
          <code className="text-cyan-700">lopez-navidad</code>). Solo quienes usen el
          mismo código verán sus listas entre sí.
        </p>
        <form onSubmit={guardar} className="space-y-3 text-left">
          <input
            type="text"
            required
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Código de tu familia"
            autoFocus
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm outline-none focus:border-cyan-500"
          />
          <Boton type="submit" disabled={guardando} className="w-full px-6 py-3">
            {guardando ? 'Guardando…' : 'Entrar a mi familia'}
          </Boton>
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
        </form>
        <button
          onClick={() => onSalir().catch(console.error)}
          className="mt-6 font-mono text-xs text-gray-500 transition-colors hover:text-gray-900"
        >
          Salir
        </button>
      </div>
    </NavidadShell>
  )
}
