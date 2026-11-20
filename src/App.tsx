import { useState, useCallback, useEffect } from 'react'
import tibiatoolsImg from './assets/projects/tibiatools.jpg'
import chingatealvecinoImg from './assets/projects/chingatealvecino.jpg'
import gangrenaotImg from './assets/projects/gangrenaot.jpg'
import snacksImg from './assets/projects/snacks-adventures.jpg'

const SECTIONS = [
  { id: 'intro', label: 'Inicio' },
  { id: 'resume', label: 'Resumen' },
  { id: 'tibiatools', label: 'TibiaTools' },
  { id: 'snacks', label: "Snack's Adventures" },
  { id: 'chingate', label: 'Chíngate al Vecino' },
  { id: 'gangrena', label: 'Gangrena OT' },
  { id: 'contacto', label: 'Contacto' },
]

function SectionNav({ active, onNavigate }: { active: number; onNavigate: (i: number) => void }) {
  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {SECTIONS.map((s, i) => (
        <button
          key={s.id}
          onClick={() => onNavigate(i)}
          className="group relative flex items-center justify-center w-4 h-4"
          aria-label={s.label}
        >
          <span
            className={`block rounded-full transition-all duration-300 ${
              i === active
                ? 'w-3 h-3 bg-accent'
                : 'w-2 h-2 bg-gray-600 group-hover:bg-gray-400'
            }`}
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-mono">
            {s.label}
          </span>
        </button>
      ))}
    </nav>
  )
}

function App() {
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState<'left' | 'right'>('right')

  const navigate = useCallback((i: number) => {
    if (i === active) return
    setDir(i > active ? 'right' : 'left')
    setActive(i)
  }, [active])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (active < SECTIONS.length - 1) navigate(active + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (active > 0) navigate(active - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, navigate])

  return (
    <div className="h-dvh bg-dark-base text-gray-300 font-sans antialiased selection:bg-accent selection:text-dark-base overflow-hidden flex flex-col">
      <nav className="shrink-0 w-full z-50 bg-dark-base/80 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <button onClick={() => navigate(0)} className="text-white font-semibold text-lg tracking-wider hover:text-accent transition-colors cursor-pointer">pablodotjs</button>
          <div className="space-x-6 text-sm">
            <button onClick={() => navigate(1)} className="hover:text-accent transition-colors">Resumen</button>
            <button onClick={() => navigate(2)} className="hover:text-accent transition-colors">Proyectos</button>
            <button onClick={() => navigate(6)} className="hover:text-accent transition-colors">Contacto</button>
          </div>
        </div>
      </nav>

      <SectionNav active={active} onNavigate={navigate} />

      <div className="relative flex-1 overflow-hidden">
        <div
          key={active}
          className="absolute inset-0 flex items-center justify-center px-6"
          style={{
            animation: dir === 'right'
              ? 'slideInRight 0.35s ease-out'
              : 'slideInLeft 0.35s ease-out',
          }}
        >
          {active === 0 && (
            <div className="max-w-3xl mx-auto text-center">
              <p className="font-mono text-sm text-accent mb-4">Hola, soy</p>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                Ingeniero de <span className="text-accent">Software</span>.
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
                Staff Software Engineer con 10 años construyendo aplicaciones web y móviles con React, Python y Rust, e integrando modelos de IA.
              </p>
              <button onClick={() => navigate(1)} className="bg-white text-dark-base px-6 py-3 rounded-md font-medium hover:bg-accent hover:text-dark-base transition-all duration-300">
                Conoce más sobre mí
              </button>
            </div>
          )}

          {active === 1 && (
            <div className="max-w-3xl mx-auto w-full max-h-full overflow-y-auto py-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
                <span className="text-accent">/</span> sobre mí
              </h2>
              <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-5">
                <p className="text-gray-300 leading-relaxed">
                  Soy <span className="text-white font-medium">Staff Software Engineer</span> con 10 años de experiencia
                  construyendo aplicaciones web y móviles. Actualmente diseño y desarrollo nuevas funcionalidades con
                  React, Python y Rust, e integro modelos de IA en el producto de Marketplace.City.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Con trayectoria como Tech Lead en IBM y DigitalOnUs by Tech Mahindra: arquitectura frontend, code
                  reviews, mentoría de equipos y planeación de features junto a product owners y diseñadores. Ingeniero
                  en Computación por la UABC y AWS Certified Cloud Practitioner.
                </p>
                <div>
                  <h3 className="text-white font-semibold mb-3 font-mono text-sm text-accent">stack principal</h3>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Next.js', 'Python', 'Rust', 'Node.js', 'AWS', 'PostgreSQL', 'Docker'].map((tech) => (
                      <span key={tech} className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">{tech}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-3 font-mono text-sm text-accent">experiencia</h3>
                  <div className="space-y-3">
                    <div className="border-l-2 border-dark-border pl-4">
                      <p className="text-white font-medium">Staff Engineer · Marketplace.City</p>
                      <p className="text-sm text-gray-400">Mayo 2025 — Presente</p>
                      <p className="text-sm text-gray-500 mt-1">Nuevas funcionalidades con React, Python y Rust, e integración de modelos de IA en el producto.</p>
                    </div>
                    <div className="border-l-2 border-dark-border pl-4">
                      <p className="text-white font-medium">Tech Lead · DigitalOnUs by Tech Mahindra</p>
                      <p className="text-sm text-gray-400">Noviembre 2023 — Marzo 2025</p>
                      <p className="text-sm text-gray-500 mt-1">Lideré el desarrollo de la app web (React) de un cliente: decisiones técnicas, code reviews y cambios al backend.</p>
                    </div>
                    <div className="border-l-2 border-dark-border pl-4">
                      <p className="text-white font-medium">Senior Software Developer · DigitalOnUs</p>
                      <p className="text-sm text-gray-400">Octubre 2021 — Octubre 2023</p>
                      <p className="text-sm text-gray-500 mt-1">Capacidades internas de analítica y un adaptador para apps Angular/React/Next.js (auth, analytics, logging, feature flags).</p>
                    </div>
                    <div className="border-l-2 border-dark-border pl-4">
                      <p className="text-white font-medium">Lead Frontend · IBM</p>
                      <p className="text-sm text-gray-400">Abril 2019 — Octubre 2021</p>
                      <p className="text-sm text-gray-500 mt-1">Arquitectura frontend, mentoría de desarrolladores y code reviews; apps internas con Angular y React.</p>
                    </div>
                    <div className="border-l-2 border-dark-border pl-4">
                      <p className="text-white font-medium">Co-Founder · Nutriconsultor</p>
                      <p className="text-sm text-gray-400">2016 — 2018</p>
                      <p className="text-sm text-gray-500 mt-1">Cofundé la startup: construí el producto en Web, Desktop, iOS y Android, y lideré el aseguramiento de calidad.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === 2 && (
            <div className="max-w-4xl mx-auto w-full max-h-full overflow-y-auto py-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
                <span className="text-accent">/</span> proyectos
              </h2>
              <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden group hover:-translate-y-1 hover:border-accent/50 transition-all duration-300 flex flex-col max-h-[70vh]">
                <div className="h-[294px] shrink-0 bg-neutral-900 overflow-hidden">
                  <img src={tibiatoolsImg} alt="Captura de TibiaTools" className="w-full h-full object-cover object-top" />
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-accent transition-colors">TibiaTools</h3>
                  <p className="text-gray-400 mb-5">
                    Suite de herramientas para Tibia: calculadora de dinero real/coins, checker de imbuiciones, simulador de forja de exaltación y guía de hunting spots. App completa con autenticación y Firebase.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">React</span>
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">TypeScript</span>
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">Firebase</span>
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">Redux</span>
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">Tailwind</span>
                  </div>
                  <div className="flex gap-4">
                    <a href="https://github.com/Pablodotnet/tibiatools" target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-accent flex items-center gap-1 transition-colors">
                      Código <span className="font-mono">-&gt;</span>
                    </a>
                    <a href="https://www.tibiatools.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-accent flex items-center gap-1 transition-colors">
                      Live Demo <span className="font-mono">-&gt;</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === 3 && (
            <div className="max-w-4xl mx-auto w-full max-h-full overflow-y-auto py-4">
              <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden group hover:-translate-y-1 hover:border-accent/50 transition-all duration-300 flex flex-col max-h-[70vh]">
                <div className="h-[294px] shrink-0 bg-neutral-900 overflow-hidden">
                  <img src={snacksImg} alt="Captura de Snack's Adventures" className="w-full h-full object-cover object-top" />
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-accent transition-colors">Snack's Adventures</h3>
                  <p className="text-gray-400 mb-5">
                    Videojuego de plataformas 2D con estilo 16-bit. Desarrollo completo de mecánicas, animaciones y spritesheets optimizados para el motor Phaser.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">Phaser</span>
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">JavaScript</span>
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">Aseprite</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === 4 && (
            <div className="max-w-4xl mx-auto w-full max-h-full overflow-y-auto py-4">
              <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden group hover:-translate-y-1 hover:border-accent/50 transition-all duration-300 flex flex-col max-h-[70vh]">
                <div className="h-[294px] shrink-0 bg-neutral-900 overflow-hidden">
                  <img src={chingatealvecinoImg} alt="Captura de Chíngate al Vecino" className="w-full h-full object-cover object-top" />
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-accent transition-colors">Chíngate al Vecino</h3>
                  <p className="text-gray-400 mb-5">
                    Juego de cartas por turnos. Cada ronda intercambias carta con el jugador de tu derecha —tu vecino— y pierde quien se queda con la carta menor. Estrategia y faroleo para no quedar al final.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">Flutter</span>
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">Dart</span>
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">Multiplayer</span>
                  </div>
                  <div className="flex gap-4">
                    <a href="https://chingatealvecino.com" target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-accent flex items-center gap-1 transition-colors">
                      Jugar <span className="font-mono">-&gt;</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === 5 && (
            <div className="max-w-4xl mx-auto w-full max-h-full overflow-y-auto py-4">
              <div className="bg-dark-card rounded-xl border border-dark-border overflow-hidden group hover:-translate-y-1 hover:border-accent/50 transition-all duration-300 flex flex-col max-h-[70vh]">
                <div className="h-[294px] shrink-0 bg-neutral-900 overflow-hidden">
                  <img src={gangrenaotImg} alt="Captura de Gangrena OT" className="w-full h-full object-cover object-top" />
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-accent transition-colors">Gangrena OT</h3>
                  <p className="text-gray-400 mb-5">
                    Servidor privado de Tibia con sistema de evolución personalizado, mapas exclusivos, misiones únicas y una comunidad activa. Experiencia RPG optimizada con contenido custom.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">OTServ</span>
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">Lua</span>
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">C++</span>
                    <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded">SQL</span>
                  </div>
                  <div className="flex gap-4">
                    <a href="https://gangrenaot.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-accent flex items-center gap-1 transition-colors">
                      Servidor <span className="font-mono">-&gt;</span>
                    </a>
                    <a href="https://discord.gg/afgMrkuwc" target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:text-accent flex items-center gap-1 transition-colors">
                      Discord <span className="font-mono">-&gt;</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === 6 && (
            <div className="flex flex-col items-center justify-center text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">¿Trabajamos juntos?</h2>
              <p className="text-gray-400 mb-8 max-w-md">
                Estoy abierto a colaborar en proyectos interesantes. No dudes en escribirme.
              </p>
              <a href="https://www.linkedin.com/in/luispablolopez93/" target="_blank" rel="noopener noreferrer" className="text-xl text-gray-400 hover:text-accent transition-colors font-mono">
                linkedin.com/in/luispablolopez93
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
