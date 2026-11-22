# Price Tracker — Setup y tarea programada

Mini app en `/price-tracker`: entras con Google, pegas el link de un producto y
una **tarea programada de Claude** rastrea su precio, busca alternativas en otras
tiendas y guarda el historial. Mismo proyecto de Firebase que la app de Navidad.

## 1. Front (ya incluido)

- Ruta: `/price-tracker` (lazy, igual que `/navidad`).
- Login con Google reutilizando `src/lib/firebase.ts`.
- Dashboard con listado + formulario para pegar el link.
- Detalle por producto con precio base, mejor opción, opciones e historial (sparkline SVG).

No requiere credenciales nuevas en el front: usa las mismas `VITE_FIREBASE_*` de `.env.local`.

## 2. Modelo de datos (Firestore)

```
products/{productId}
  ownerUid, ownerName        // dueño (filtro de las reglas)
  titulo, url, tiendaBase    // lo que pega el usuario (tiendaBase se detecta sola)
  precioBase: number|null    // precio en la tienda base   ← lo llena el task
  moneda: "MXN"
  mejorOpcion: Opcion | null // mejor PRECIO de lista       ← lo llena el task
  mejorOferta: Opcion | null // mejor COSTO REAL (promo + MSI) ← lo llena el task
  opciones: Opcion[]         // todas las alternativas de la última corrida ← task
  estado: "pendiente"|"rastreando"|"ok"|"sin_precio"|"error"
  intentos, ultimoMotivo   // sin_precio: corridas fallidas seguidas + por qué
  createdAt, actualizadoEn

Opcion = {
  tienda, titulo, url, precio, moneda,
  precioEfectivo?: number,   // precio pagando con la mejor promo bancaria/cupón
  msi?: number,              // meses sin intereses disponibles
  promos?: string[]          // ["10% con HSBC", "18 MSI", "Cupón BINES"]
}

products/{productId}/historial/{entryId}       ← SOLO lo escribe el task (admin)
  fecha, precioBase, mejorPrecio, mejorOferta, mejorTienda, moneda
```

- **mejorOpcion** = opción con el menor `precio` de lista.
- **mejorOferta** = opción con el menor **costo real** = `precioEfectivo` (si hay
  promo) o `precio`. Cubre descuento de tienda + promo bancaria + MSI + cupón.
  El script calcula ambas; Claude sólo aporta los datos por tienda.

**Reglas** (`firestore.rules`, ya actualizadas): el cliente lee/administra sólo
sus `products` y lee su `historial`; **nadie escribe `historial` desde el
cliente**. El task escribe con el Admin SDK, que ignora las reglas.

Publica las reglas:

```bash
firebase deploy --only firestore:rules
```

## 3. Service account (una vez)

El task necesita credenciales de administrador (el front NO las lleva).

1. Firebase Console → ⚙️ **Configuración del proyecto** → **Cuentas de servicio** →
   **Generar nueva clave privada**. Descarga el JSON.
2. Guárdalo **fuera del repo** (p. ej. `~/.secrets/price-tracker-sa.json`).
   Ya está cubierto por `.gitignore` si lo dejas fuera; nunca lo subas.
3. Instala el Admin SDK (solo para el script del task):

```bash
pnpm add -D firebase-admin
```

## 4. El helper (`scripts/price-tracker-task.mjs`)

Dos comandos:

```bash
# 1) Qué productos revisar (pendientes o con +12 h sin actualizar). Los marca "rastreando".
node scripts/price-tracker-task.mjs list

# 2) Guardar resultados (precio base, opciones, mejor opción, historial)
node scripts/price-tracker-task.mjs save resultados.json
```

Variables de entorno que espera:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/.secrets/price-tracker-sa.json
export FIREBASE_PROJECT_ID=dinamicanavidad-1caec   # opcional; el SA ya trae el proyecto
```

Formato de `resultados.json` (lo arma Claude con lo que encuentra en la web):

```json
[
  {
    "id": "<productId que vino de list>",
    "precioBase": 1299.0,
    "moneda": "MXN",
    "opciones": [
      { "tienda": "amazon",  "titulo": "…", "url": "https://…", "precio": 1299, "moneda": "MXN" },
      { "tienda": "walmart", "titulo": "…", "url": "https://…", "precio": 1150, "moneda": "MXN",
        "precioEfectivo": 1035, "msi": 18, "promos": ["10% con HSBC", "18 MSI"] }
    ]
  }
]
```

El script calcula solo la **mejor opción** (menor `precio`) y la **mejor oferta**
(menor costo real = `precioEfectivo` o `precio`). Claude solo aporta los datos.

Para un producto **sin precio confiable**, la entrada se marca y el script lo pone
en estado `sin_precio` (en vez de dejarlo colgado en `rastreando`). El `list`
aplica un **backoff de 24 h** antes de reintentarlo:

```json
{ "id": "<productId>", "sinPrecio": true, "motivo": "Amazon bloqueó la página; sin precio actual" }
```

Tiendas MX que reconoce la detección y busca el task: Amazon, Mercado Libre,
Walmart, Liverpool, Coppel, AliExpress, Costco, Sam's Club, CyberPuerta, DDTech,
PCEL, Sears, Elektra, Palacio de Hierro.

## 5. Crear la tarea programada en Claude

En esta app (Claude Code), la tarea programada corre un prompt tuyo en un horario.
Pídemelo en el chat así, o créala tú desde el gestor de tareas programadas:

> **Prompt de la tarea** (ejemplo, correr cada 12 h):
>
> Eres el rastreador de precios de Price Tracker. Trabaja en el repo
> `pablodotjs`. Con las variables `GOOGLE_APPLICATION_CREDENTIALS` y
> `FIREBASE_PROJECT_ID` ya exportadas:
>
> 1. Ejecuta `node scripts/price-tracker-task.mjs list` y lee el JSON de productos.
> 2. Para **cada** producto, usa búsqueda web (WebSearch):
>    - Encuentra el precio actual en su `tiendaBase` (a partir de `url`/`titulo`).
>    - Busca el **mismo** producto en otras tiendas MX (Amazon, Mercado Libre,
>      Walmart, Liverpool, Coppel, AliExpress) y anota precio + enlace de cada una.
>    - Para cada tienda, revisa también las **ofertas**: descuento de la tienda,
>      **promo bancaria** (p. ej. 10% con cierto banco), **meses sin intereses**
>      (MSI) y cupones. Si una promo baja el costo real, ponlo en `precioEfectivo`,
>      los MSI en `msi` y una lista legible en `promos` (["10% con HSBC", "18 MSI"]).
>    - Descarta coincidencias dudosas (modelo/tamaño distinto). Precios en número, sin "$".
> 3. Arma un `resultados.json` con el formato de la sección 4 (incluye el `id`
>    de cada producto tal cual vino de `list`).
> 4. Ejecuta `node scripts/price-tracker-task.mjs save resultados.json`.
> 5. Responde con un resumen: cuántos productos, mejores ahorros encontrados.
>
> Si un producto no arroja precios confiables, déjalo fuera de `resultados.json`
> (el script no lo marcará como actualizado y se reintentará la próxima vez).

### Cómo se agenda

- **Tarea local de Claude** (lo que elegiste): se agenda en esta app con el gestor
  de tareas programadas (`mcp scheduled-tasks`). Corre en tu máquina, donde está
  el service account y la búsqueda web. Sugerido: **cada 12 h** o **1×/día**.
- La tarea NO necesita el dev server corriendo; sólo Node + el service account.

Para crearla, dime: **"crea la tarea programada de price-tracker cada 12 h con ese
prompt"** y la registro. O ábrela tú y pega el prompt de arriba.

## 6. Probar sin esperar al schedule

```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/.secrets/price-tracker-sa.json
node scripts/price-tracker-task.mjs list                 # ver pendientes
# …arma resultados.json a mano con un producto…
node scripts/price-tracker-task.mjs save resultados.json # escribir
```

Luego abre `/price-tracker`: el producto pasa de **En cola** a **Actualizado**,
con su mejor opción y el primer punto del historial.

## 7. Notas y límites

- La búsqueda web da precios **aproximados**; el usuario confirma en la tienda. Los
  enlaces de la mejor opción abren la oferta real.
- `estado: "rastreando"` se pone al listar y vuelve a `"ok"` al guardar; si una
  corrida falla a medias, el producto se reintenta en la siguiente.
- Para dejar de rastrear algo, el usuario lo borra en el dashboard (borra el doc;
  el historial queda huérfano — opcional: borrar la subcolección en un cleanup).
