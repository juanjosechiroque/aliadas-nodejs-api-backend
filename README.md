# Aliadas API

Express + Supabase. CMS, usuarios, noticias, calculadora.

## Requisitos

- Node.js **24+** (`.nvmrc`: `nvm use`)
- Proyecto Supabase (URL + service role key)

## Entorno nuevo (Supabase vacío)

1. SQL Editor → ejecutar `scripts/supabase-schema.sql`
2. `cp .env.example .env` — completar `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (`PORT=3330` en local)
3. `npm install` → `npm run seed` (opcional: `npm run seed:news`)

Usuarios seed: `admin` y `cms_admin`, contraseña `changeme`.

Si la base ya existía antes de añadir videos CMS: ejecutar también `scripts/migrations/add-cms-youtube-url.sql` en el SQL Editor.

## Desarrollo

```bash
npm install
npm run dev
```

Escucha en `PORT` (`.env`, default 3330).

## Scripts

| Script                      | Uso                                   |
| --------------------------- | ------------------------------------- |
| `npm run dev` / `npm start` | API                                   |
| `npm run seed`              | CMS, usuarios, parámetros calculadora |
| `npm run seed:news`         | Noticias + imágenes (opcional)        |

Variables: `.env.example`.

## Rutas

Prefijo de la API: `/api`. Raíz del servidor: `GET /` (metadatos del servicio).

**Autenticación:** cookie HttpOnly `aliadas_access_token` (`Secure`, `SameSite=None`). El front envía la cookie con `withCredentials: true` en cada petición al API.

| Auth      | Quién                            |
| --------- | -------------------------------- |
| —         | Público                          |
| JWT       | Usuario activo con sesión válida |
| Panel     | Rol `admin` o `cms_admin`        |
| Seguridad | Solo rol `admin`                 |

### Sistema

| Método | Ruta          | Auth | Descripción                          |
| ------ | ------------- | ---- | ------------------------------------ |
| GET    | `/`           | —    | Nombre del servicio y enlaces útiles |
| GET    | `/api/health` | —    | Estado del API (`status: ok`)        |

### Usuarios (`/api/users`)

| Método | Ruta                                | Auth      | Descripción                                         |
| ------ | ----------------------------------- | --------- | --------------------------------------------------- |
| POST   | `/api/users/login`                  | —         | Inicio de sesión; cookie HttpOnly JWT               |
| POST   | `/api/users/logout`                 | —         | Cierra sesión (borra cookie)                        |
| GET    | `/api/users/me`                     | JWT       | Usuario de la sesión actual                         |
| GET    | `/api/users/`                       | Seguridad | Lista usuarios del panel                            |
| GET    | `/api/users/username/:username`     | Seguridad | Usuario por nombre de login                         |
| POST   | `/api/users/create`                 | Seguridad | Alta de usuario                                     |
| GET    | `/api/users/:userId`                | JWT       | Detalle de un usuario                               |
| PATCH  | `/api/users/:userId`                | JWT       | Actualización (perfil propio u operación permitida) |
| PATCH  | `/api/users/:userId/admin`          | Seguridad | Edición admin (rol, activo, etc.)                   |
| PATCH  | `/api/users/:userId/admin/password` | Seguridad | Cambio de contraseña por admin                      |
| DELETE | `/api/users/:userId`                | Seguridad | Baja lógica de usuario                              |

### Actualidad / noticias (`/api/actualidad`)

| Método | Ruta                         | Auth  | Descripción                       |
| ------ | ---------------------------- | ----- | --------------------------------- |
| GET    | `/api/actualidad/`           | —     | Listado público de noticias       |
| GET    | `/api/actualidad/:idContent` | —     | Detalle de una noticia            |
| POST   | `/api/actualidad/create`     | Panel | Crear noticia (multipart, imagen) |
| PATCH  | `/api/actualidad/:id`        | Panel | Editar noticia por id de fila     |
| DELETE | `/api/actualidad/:noticiaId` | Panel | Eliminar noticia                  |

### CMS — Mis derechos y empleador

Mismo patrón en cada prefijo: `GET …/:idContent` (público, bloque por id de contenido), `PATCH …/:id` (Panel, actualiza la fila CMS).

| Prefijo                 | Tema              |
| ----------------------- | ----------------- |
| `/api/libertadsindical` | Libertad sindical |
| `/api/violenciaacoso`   | Violencia y acoso |
| `/api/beneficios`       | Beneficios        |
| `/api/contratacion`     | Contratación      |
| `/api/trabajodomestico` | Trabajo doméstico |
| `/api/jornada`          | Jornada           |
| `/api/salario`          | Salario           |
| `/api/seguridad`        | Seguridad social  |
| `/api/enfermedades`     | Enfermedades      |
| `/api/licencias`        | Licencias         |
| `/api/empleador`        | Empleador         |

Ejemplo: `GET /api/jornada/3`, `PATCH /api/jornada/1`.

### Registros (`/api/customers`)

| Método | Ruta                         | Auth  | Descripción                |
| ------ | ---------------------------- | ----- | -------------------------- |
| GET    | `/api/customers/`            | Panel | Lista registros (clientes) |
| POST   | `/api/customers/create`      | Panel | Crear registro             |
| DELETE | `/api/customers/:idCustomer` | Panel | Eliminar registro          |

### Calculadora (`/api/calculadora`)

| Método | Ruta                                | Auth  | Descripción                                            |
| ------ | ----------------------------------- | ----- | ------------------------------------------------------ |
| GET    | `/api/calculadora/parametros`       | —     | Parámetros legales por año (SMMLV, auxilio transporte) |
| GET    | `/api/calculadora/parametros/:anio` | —     | Parámetros de un año                                   |
| POST   | `/api/calculadora/parametros`       | Panel | Crear año                                              |
| PATCH  | `/api/calculadora/parametros/:anio` | Panel | Actualizar año                                         |
| DELETE | `/api/calculadora/parametros/:anio` | Panel | Baja lógica del año                                    |
