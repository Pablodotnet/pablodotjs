import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import { Bienvenida, Cargando, ConfigFaltante } from './screens'
import Dashboard from './Dashboard'
import ProductoDetalle from './ProductoDetalle'

// Punto de entrada de Price Tracker. Se carga de forma diferida (lazy) para que
// Firebase no pese en la página principal del portafolio.
export default function PriceTrackerRoot() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}

// Controla el acceso: Firebase listo → sesión → app.
function Gate() {
  const { user, cargando, firebaseReady, entrarConGoogle } = useAuth()

  if (!firebaseReady) return <ConfigFaltante />
  if (cargando) return <Cargando />
  if (!user) return <Bienvenida onEntrar={entrarConGoogle} />

  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="producto/:id" element={<ProductoDetalle />} />
    </Routes>
  )
}
