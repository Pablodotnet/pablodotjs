import { Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth'
import { Welcome, Loading, FamilyCodeScreen, MissingConfig } from './screens'
import { familiesOf } from './types'
import NavidadApp from './NavidadApp'
import FamilyList from './FamilyList'
import NavidadAccount from './NavidadAccount'

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
  const { user, profile, loading, firebaseReady, signInWithGoogle, logOut, saveFamilyCode } =
    useAuth()

  if (!firebaseReady) return <MissingConfig />
  if (loading) return <Loading />
  if (!user) return <Welcome onSignIn={signInWithGoogle} />
  if (familiesOf(profile).length === 0)
    return <FamilyCodeScreen onSave={saveFamilyCode} onSignOut={logOut} />

  return (
    <Routes>
      <Route index element={<NavidadApp />} />
      <Route path="lista/:uid" element={<FamilyList />} />
      <Route path="cuenta" element={<NavidadAccount />} />
    </Routes>
  )
}
