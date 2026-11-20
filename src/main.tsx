import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// La app de Navidad (y Firebase) se cargan sólo cuando se visita /navidad.
const NavidadRoot = lazy(() => import('./navidad/NavidadRoot.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/navidad/*"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen bg-gray-50" />
              }
            >
              <NavidadRoot />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
