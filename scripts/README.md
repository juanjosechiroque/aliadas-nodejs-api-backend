# Guía: tablas, datos iniciales y noticias

1. Crear las tablas del proyecto en Supabase  
2. Cargar los datos iniciales (CMS + usuario)  
3. Cargar noticias (imágenes + filas en `news`)

---

## 1. Crear las tablas

1. Abrí **[`supabase-schema.sql`](supabase-schema.sql)**.
2. En Supabase → **SQL Editor** → pegá **todo** el archivo → **Run**.

### Tablas que incluye

| Tabla | Uso |
|-------|-----|
| `news` | Noticias de actualidad |
| `users` | Usuarios de la app |
| `customers` | Clientes |
| `cms_libertad_sindical` | CMS libertad sindical |
| `cms_violencia_acoso` | CMS violencia / acoso |
| `cms_beneficios` | CMS beneficios |
| `cms_contratacion` | CMS contratación |
| `cms_trabajo_domestico` | CMS trabajo doméstico |
| `cms_jornada` | CMS jornada |
| `cms_salario` | CMS salario |
| `cms_seguridad_social` | CMS seguridad social |
| `cms_enfermedades` | CMS enfermedades |
| `cms_licencias` | CMS licencias |
| `cms_empleador` | CMS empleador |

También crea el bucket de Storage **`aliadas-news`**.

---

## 2. Cargar datos iniciales

En **`seed/users_seed.json`** poné la contraseña **en texto plano** en el campo **`password_plain`**.

Al ejecutar el seed, el script convierte **`password_plain`** en **bcrypt** y envía a Supabase solo el campo **`password`**: en la base **no queda la contraseña en texto plano** (queda un hash; es la forma habitual de “guardarla encriptada” para login).

Ejemplo:

```json
{
  "name": "Admin",
  "last_name": "Sistema",
  "username": "admin",
  "password_plain": "changeme",
  "rol_type": "admin",
  "is_deleted": false
}
```

Luego, desde la raíz del backend:

```bash
node scripts/supabase-seed.js
```

Esto sube todos los **`seed/cms_*_seed.json`** y el usuario definido en **`seed/users_seed.json`**.

---

## 3. Cargar noticias

```bash
node scripts/supabase-news-import.js
```

Usa **`seed/news_seed.json`** e imágenes en **`../aliadas-front/src/assets`**.
