// Cloud Functions de la app de Lista de Deseos.
//
// obtenerImagenProducto(url): lee la página del producto del lado servidor
// (el navegador no puede por CORS) y devuelve la imagen principal (og:image).
// Es "best-effort": si no encuentra imagen o la tienda bloquea la lectura
// (Amazon suele hacerlo), devuelve { imagen: null } sin error.

const { onCall, HttpsError } = require('firebase-functions/v2/https')

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

// Rechaza destinos internos/privados (anti-SSRF): sólo dejamos hosts públicos.
function hostPublico(hostname) {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local')) return false
  if (!h.includes('.')) return false // nombres sin punto (internos)
  // IPs privadas / loopback / link-local más comunes.
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h)) return false
  if (/^169\.254\./.test(h)) return false // link-local (incluye metadata 169.254.169.254)
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false
  if (h === '0.0.0.0' || h === '::1' || h === '[::1]') return false
  return true
}

function extraerImagen(html, base) {
  const patrones = [
    /<meta[^>]+property=["']og:image(?::secure_url|:url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
  ]
  for (const re of patrones) {
    const m = html.match(re)
    if (m && m[1]) {
      const bruto = m[1].replace(/&amp;/g, '&').trim()
      try {
        return new URL(bruto, base).toString()
      } catch {
        return bruto
      }
    }
  }
  return null
}

exports.obtenerImagenProducto = onCall(
  { cors: true, maxInstances: 10, timeoutSeconds: 20, memory: '256MiB' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Debes iniciar sesión.')
    }
    const url = String(request.data?.url ?? '').trim()

    let parsed
    try {
      parsed = new URL(url)
    } catch {
      throw new HttpsError('invalid-argument', 'URL inválida.')
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new HttpsError('invalid-argument', 'URL inválida.')
    }
    if (!hostPublico(parsed.hostname)) {
      throw new HttpsError('invalid-argument', 'Host no permitido.')
    }

    try {
      const controlador = new AbortController()
      const t = setTimeout(() => controlador.abort(), 12000)
      const res = await fetch(parsed.toString(), {
        headers: {
          'User-Agent': UA,
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
        },
        redirect: 'follow',
        signal: controlador.signal,
      })
      clearTimeout(t)
      if (!res.ok) return { imagen: null }
      const tipo = res.headers.get('content-type') ?? ''
      if (!tipo.includes('html')) return { imagen: null }
      // Leemos sólo el principio: las metaetiquetas viven en el <head>.
      const html = (await res.text()).slice(0, 500000)
      return { imagen: extraerImagen(html, parsed.toString()) }
    } catch {
      return { imagen: null }
    }
  },
)
