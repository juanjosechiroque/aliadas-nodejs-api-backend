# Aliadas API (Node.js)

API Express para la app Aliadas: contenido CMS (mis derechos, empleador, actualidad), usuarios y login con JWT (cookie HttpOnly según entorno).

## Requisitos

- **Node.js 24+** (`engines` en `package.json`). Con [nvm](https://github.com/nvm-sh/nvm): `nvm use` en la raíz del backend (archivo **`.nvmrc`**).
- Proyecto **Supabase** con tablas expuestas por REST según los modelos en `src/api/`.

## Arranque rápido

```bash
cp .env.example .env
# Editar .env: JWT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (y opcionalmente anon).

npm install
npm run dev
```

Por defecto el servidor escucha en `PORT` del entorno o el valor por defecto definido en la config (`server.js` / `src/config`).

## Scripts

| Script                            | Descripción                                               |
| --------------------------------- | --------------------------------------------------------- |
| `npm run dev`                     | Desarrollo con nodemon.                                   |
| `npm start`                       | Producción (`node server.js`).                            |
| `npm run lint`                    | ESLint sin warnings.                                      |
| `npm run lint:fix`                | ESLint con autofix.                                       |
| `npm run format` / `format:check` | Prettier.                                                 |
| `npm run validate`                | `lint` + `format:check`.                                  |
| `npm run test:smoke`              | Smoke contra API levantada (ver `scripts/smoke-test.js`). |

## Variables de entorno

Documentadas en **`.env.example`**. Las imprescindibles para arrancar suelen ser:

- **`JWT_SECRET`** y **`JWT_EXPIRES_IN`**
- **`SUPABASE_URL`** y **`SUPABASE_SERVICE_ROLE_KEY`**
- **`NODE_ENV`**: en `production` los errores no exponen detalles internos al cliente (misma regla en `sendServerError` y en el middleware global de Express).

## Seguridad (resumen)

- **Errores 500**: respuesta genérica al cliente en producción; detalle en logs del servidor (`sendServerError`, middleware global en `src/app.js`).
- **HTML / XSS**: contenido enriquecido (actualidad y bloques CMS `description` / `title_*` / `text_*`) se sanea con **`sanitize-html`** al guardar y al servir por GET.
- **Imágenes de noticias**: al crear noticia, la imagen se reencodea con **sharp** (tamaño máximo ~1920 px en el lado largo, JPEG con calidad ~82 o PNG comprimido si lleva transparencia).

## Generador CMS

Para regenerar capas service/controller/router de módulos CMS alineados con el modelo:

```bash
node scripts/generate-content-layers.js
```

Ver `scripts/README.md` si hay notas adicionales.

## Estructura

- `server.js` — entrada.
- `src/app.js` — Express, middleware, rutas.
- `src/api/` — routers, controladores, servicios y modelos por recurso.
- `src/utils/` — utilidades (`api-errors`, saneado HTML, etc.).
- `src/middleware/` — auth, rate limit, etc.
