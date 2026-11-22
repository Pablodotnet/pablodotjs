import { useState } from 'react'
import { Boton, TrackerShell } from './components'

export function Cargando() {
  return (
    <TrackerShell>
      <p className="py-16 text-center text-sm text-gray-500">Cargando…</p>
    </TrackerShell>
  )
}

export function ConfigFaltante() {
  return (
    <TrackerShell>
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
    </TrackerShell>
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
    <TrackerShell>
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mb-4 text-5xl">🏷️</div>
        <h1 className="mb-2 text-2xl font-semibold">Price Tracker</h1>
        <p className="mb-8 text-sm text-gray-600">
          Entra con tu cuenta de Google, pega el link de un producto y nosotros rastreamos
          su precio y buscamos mejores opciones en otras tiendas. 📉
        </p>
        <Boton onClick={entrar} className="px-6 py-3">
          Entrar con Google
        </Boton>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </TrackerShell>
  )
}
