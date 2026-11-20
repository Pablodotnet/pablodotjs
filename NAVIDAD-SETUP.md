# 🎄 Lista de Deseos Familiar — Configuración

Mini-app en `/navidad` para que la familia arme su lista de deseos de Navidad
(links de Amazon / Mercado Libre) y la comparta. Login con Google (Firebase).

## 1. Crear el proyecto de Firebase

1. Entra a <https://console.firebase.google.com> y crea un proyecto nuevo
   (puedes desactivar Google Analytics, no hace falta).
2. Dentro del proyecto, haz clic en el ícono **web** (`</>`) para registrar una
   app web. Ponle un apodo (ej. `lista-navidad`) y registra.
3. Firebase te mostrará un objeto `firebaseConfig` con `apiKey`, `authDomain`,
   etc. **No cierres esa pantalla**, los valores van al paso 4.

## 2. Activar el login con Google

1. Menú izquierdo → **Build → Authentication → Get started**.
2. Pestaña **Sign-in method** → habilita **Google** → guarda.

## 3. Crear la base de datos (Firestore)

1. Menú izquierdo → **Build → Firestore Database → Create database**.
2. Elige una región cercana y crea en **modo producción**.
3. Pestaña **Rules** → pega el contenido de [`firestore.rules`](firestore.rules)
   de este repo → **Publish**.

## 4. Conectar las credenciales

1. Copia la plantilla de variables de entorno:
   ```bash
   cp .env.example .env.local
   ```
2. Rellena `.env.local` con los valores del `firebaseConfig` del paso 1:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
3. Reinicia el dev server (`pnpm dev`) y abre <http://localhost:5173/navidad>.

> `.env.local` está en `.gitignore` (`*.local`), así que las credenciales nunca
> se suben al repo.

## 5. Dominios autorizados (para producción)

En **Authentication → Settings → Authorized domains**, agrega tu dominio de
Amplify (ej. `pablodotjs.com` y el `*.amplifyapp.com`). `localhost` ya viene
autorizado para desarrollo.

## 6. Rewrite SPA en AWS Amplify

Como ahora hay rutas (`/navidad`, `/navidad/lista/:uid`), Amplify debe redirigir
todo a `index.html` para que los links directos no den 404 al recargar:

1. Consola de Amplify → tu app → **Hosting → Rewrites and redirects**.
2. Agrega una regla:
   - **Source address:** `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff2?|ttf|map|json|webmanifest)$)([^.]+$)/>`
   - **Target address:** `/index.html`
   - **Type:** `200 (Rewrite)`

   (O la regla simple `</^((?!\.).)*$/` → `/index.html` → `200` si prefieres.)

## Las variables de entorno también en Amplify

En Amplify → **Hosting → Environment variables**, agrega las mismas 6 variables
`VITE_FIREBASE_*` con sus valores, para que el build de producción las tenga.

---

## Cómo funciona

- **`/navidad`** — pantalla de entrada con Google. Ya logueado: tu lista (pegar
  link + título + precio/nota) y las tarjetas de los demás familiares.
- **`/navidad/lista/:uid`** — vista de solo lectura de la lista de un familiar.
  Es el link que se comparte (botón **Copiar link**). Requiere iniciar sesión.
- **Seguridad:** cualquier familiar logueado puede *ver* todas las listas; cada
  quien sólo puede *editar/borrar* la suya (ver `firestore.rules`).

## Pendiente opcional (v2)

Vista previa automática con imagen/precio del producto desde el link. Requiere
una Cloud Function que lea las etiquetas Open Graph (Amazon/ML bloquean eso
desde el navegador por CORS). Se puede añadir después.
