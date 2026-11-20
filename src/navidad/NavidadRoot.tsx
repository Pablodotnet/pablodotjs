import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import { Bienvenida, Cargando, CodigoFamiliar, ConfigFaltante } from './screens'
import NavidadApp from './NavidadApp'
import ListaFamiliar from './ListaFamiliar'

// Punto de entrada de la app de Navidad. Se carga de forma diferida (lazy)
// para que Firebase no pese en la página principal del portafolio.
export default function NavidadRoot() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}

// Controla el acceso: Firebase listo → sesión → código familiar → app.
function Gate() {
  const { user, perfil, cargando, firebaseReady, entrarConGoogle, salir, guardarCodigoFamiliar } =
    useAuth()

  if (!firebaseReady) return <ConfigFaltante />
  if (cargando) return <Cargando />
  if (!user) return <Bienvenida onEntrar={entrarConGoogle} />
  if (!perfil?.familyCode)
    return <CodigoFamiliar onGuardar={guardarCodigoFamiliar} onSalir={salir} />

  return (
    <Routes>
      <Route index element={<NavidadApp />} />
      <Route path="lista/:uid" element={<ListaFamiliar />} />
    </Routes>
  )
}
