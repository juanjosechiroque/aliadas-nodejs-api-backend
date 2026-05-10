-- =============================================================================
-- ESQUEMA COMPLETO Aliadas (Supabase / Postgres) — archivo único en el repo.
-- Incluye: Storage bucket noticias, public.news, users, customers (vacía hasta uso por API), CMS.
-- Copiá y pegá todo este archivo en Supabase → SQL Editor.
-- =============================================================================


-- ----------------------------------------------------------------------------- --
-- supabase_storage_news_bucket.sql
-- ----------------------------------------------------------------------------- --
-- Bucket Storage para imágenes de noticias (nombre = SUPABASE_NEWS_BUCKET por defecto `aliadas-news`).
-- Va antes de la sección public.news en este archivo.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('aliadas-news', 'aliadas-news', true, 52428800, null)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "aliadas_news_storage_select_anon" on storage.objects;
create policy "aliadas_news_storage_select_anon"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'aliadas-news');

-- Si el upload falla por RLS, descomenta:
-- drop policy if exists "aliadas_news_storage_all_service" on storage.objects;
-- create policy "aliadas_news_storage_all_service"
--   on storage.objects
--   for all
--   to service_role
--   using (bucket_id = 'aliadas-news')
--   with check (bucket_id = 'aliadas-news');


-- ----------------------------------------------------------------------------- --
-- supabase_news.sql
-- ----------------------------------------------------------------------------- --
-- Tabla public.news + RLS (lectura pública).
-- Va después del bucket de noticias en este archivo.
-- Noticias: node scripts/supabase-news-import.js (raíz del backend)

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  "date" date,
  url text,
  "imageUrl" text,
  created_at timestamptz default now()
);

alter table public.news enable row level security;

drop policy if exists "news_select_public" on public.news;
create policy "news_select_public"
  on public.news for select
  using (true);

-- Opcional: si los INSERT desde script fallan por RLS, descomenta temporalmente:
-- drop policy if exists "news_insert_service" on public.news;
-- create policy "news_insert_service"
--   on public.news for insert
--   with check (true);


-- ----------------------------------------------------------------------------- --
-- supabase_users.sql
-- ----------------------------------------------------------------------------- --
-- Ejecutar en Supabase SQL editor
-- Tabla de usuarios de la aplicación en public.users (no es auth.users de Supabase Auth).
-- Solo service_role accede vía PostgREST desde Node; sin grants a anon/authenticated.

create table if not exists public.users (
  id serial primary key,
  name text,
  last_name text,
  username text unique not null,
  password text not null,
  rol_type text not null default 'user',
  is_deleted boolean not null default false
);

create unique index if not exists users_username_lower_idx on public.users (lower(username));

alter table public.users enable row level security;

revoke all on public.users from public;
grant all on public.users to service_role;

-- Opcional: insert manual (mejor `node scripts/supabase-seed.js` con scripts/seed/users_seed.json):
-- insert into public.users (name, last_name, username, password, rol_type, is_deleted)
-- values ('Admin', 'Sistema', 'admin', '<hash bcrypt>', 'admin', false);


-- ----------------------------------------------------------------------------- --
-- supabase_customers.sql
-- ----------------------------------------------------------------------------- --
-- Ejecutar en Supabase SQL editor

create table if not exists public.customers (
  id integer primary key,
  type text,
  is_deleted boolean not null default false,
  "date" date
);

alter table public.customers enable row level security;

drop policy if exists "customers_select_anon" on public.customers;
create policy "customers_select_anon"
  on public.customers
  for select
  to anon, authenticated
  using (true);

grant select on public.customers to anon, authenticated;
grant all on public.customers to service_role;


-- ----------------------------------------------------------------------------- --
-- supabase_cms_beneficios.sql
-- ----------------------------------------------------------------------------- --
-- Ejecutar en Supabase SQL editor
create table if not exists public.cms_beneficios (
  id integer primary key,
  description text,
  title_1 text,
  text_1 text,
  title_2 text,
  text_2 text,
  title_3 text,
  text_3 text,
  title_4 text,
  text_4 text,
  title_5 text,
  text_5 text,
  title_6 text,
  text_6 text,
  title_7 text,
  text_7 text,
  title_8 text,
  text_8 text,
  title_9 text,
  text_9 text,
  title_10 text,
  text_10 text,
  title_11 text,
  text_11 text,
  title_12 text,
  text_12 text,
  title_13 text,
  text_13 text,
  title_14 text,
  text_14 text,
  title_15 text,
  text_15 text,
  title_16 text,
  text_16 text,
  title_17 text,
  text_17 text,
  title_18 text,
  text_18 text,
  title_19 text,
  text_19 text,
  title_20 text,
  text_20 text
);

alter table public.cms_beneficios enable row level security;

drop policy if exists "cms_beneficios_select_anon" on public.cms_beneficios;
create policy "cms_beneficios_select_anon"
  on public.cms_beneficios
  for select
  to anon, authenticated
  using (true);

grant select on public.cms_beneficios to anon, authenticated;
grant all on public.cms_beneficios to service_role;


-- ----------------------------------------------------------------------------- --
-- supabase_cms_contratacion.sql
-- ----------------------------------------------------------------------------- --
-- Ejecutar en Supabase SQL editor
create table if not exists public.cms_contratacion (
  id integer primary key,
  description text,
  title_1 text,
  text_1 text,
  title_2 text,
  text_2 text,
  title_3 text,
  text_3 text,
  title_4 text,
  text_4 text,
  title_5 text,
  text_5 text,
  title_6 text,
  text_6 text,
  title_7 text,
  text_7 text,
  title_8 text,
  text_8 text,
  title_9 text,
  text_9 text,
  title_10 text,
  text_10 text
);

alter table public.cms_contratacion enable row level security;

drop policy if exists "cms_contratacion_select_anon" on public.cms_contratacion;
create policy "cms_contratacion_select_anon"
  on public.cms_contratacion
  for select
  to anon, authenticated
  using (true);

grant select on public.cms_contratacion to anon, authenticated;
grant all on public.cms_contratacion to service_role;


-- ----------------------------------------------------------------------------- --
-- supabase_cms_empleador.sql
-- ----------------------------------------------------------------------------- --
-- Ejecutar en Supabase SQL editor

create table if not exists public.cms_empleador (
  id integer primary key,
  description text,
  title_1 text,
  text_1 text,
  title_2 text,
  text_2 text,
  title_3 text,
  text_3 text,
  title_4 text,
  text_4 text,
  title_5 text,
  text_5 text,
  title_6 text,
  text_6 text,
  title_7 text,
  text_7 text,
  title_8 text,
  text_8 text,
  title_9 text,
  text_9 text,
  title_10 text,
  text_10 text
);

alter table public.cms_empleador enable row level security;

drop policy if exists "cms_empleador_select_anon" on public.cms_empleador;
create policy "cms_empleador_select_anon"
  on public.cms_empleador
  for select
  to anon, authenticated
  using (true);

grant select on public.cms_empleador to anon, authenticated;
grant all on public.cms_empleador to service_role;


-- ----------------------------------------------------------------------------- --
-- supabase_cms_enfermedades.sql
-- ----------------------------------------------------------------------------- --
-- Ejecutar en Supabase SQL editor

create table if not exists public.cms_enfermedades (
  id integer primary key,
  description text,
  title_1 text,
  text_1 text,
  title_2 text,
  text_2 text,
  title_3 text,
  text_3 text,
  title_4 text,
  text_4 text,
  title_5 text,
  text_5 text,
  title_6 text,
  text_6 text,
  title_7 text,
  text_7 text,
  title_8 text,
  text_8 text,
  title_9 text,
  text_9 text,
  title_10 text,
  text_10 text,
  title_11 text,
  text_11 text,
  title_12 text,
  text_12 text
);

alter table public.cms_enfermedades enable row level security;

drop policy if exists "cms_enfermedades_select_anon" on public.cms_enfermedades;
create policy "cms_enfermedades_select_anon"
  on public.cms_enfermedades
  for select
  to anon, authenticated
  using (true);

grant select on public.cms_enfermedades to anon, authenticated;
grant all on public.cms_enfermedades to service_role;


-- ----------------------------------------------------------------------------- --
-- supabase_cms_jornada.sql
-- ----------------------------------------------------------------------------- --
-- Ejecutar en Supabase SQL editor

create table if not exists public.cms_jornada (
  id integer primary key,
  description text,
  title_1 text,
  text_1 text,
  title_2 text,
  text_2 text,
  title_3 text,
  text_3 text,
  title_4 text,
  text_4 text,
  title_5 text,
  text_5 text,
  title_6 text,
  text_6 text,
  title_7 text,
  text_7 text,
  title_8 text,
  text_8 text,
  title_9 text,
  text_9 text,
  title_10 text,
  text_10 text
);

alter table public.cms_jornada enable row level security;

drop policy if exists "cms_jornada_select_anon" on public.cms_jornada;
create policy "cms_jornada_select_anon"
  on public.cms_jornada
  for select
  to anon, authenticated
  using (true);

grant select on public.cms_jornada to anon, authenticated;
grant all on public.cms_jornada to service_role;


-- ----------------------------------------------------------------------------- --
-- supabase_cms_licencias.sql
-- ----------------------------------------------------------------------------- --
-- Ejecutar en Supabase SQL editor

create table if not exists public.cms_licencias (
  id integer primary key,
  description text,
  title_1 text,
  text_1 text,
  title_2 text,
  text_2 text,
  title_3 text,
  text_3 text,
  title_4 text,
  text_4 text,
  title_5 text,
  text_5 text,
  title_6 text,
  text_6 text,
  title_7 text,
  text_7 text,
  title_8 text,
  text_8 text,
  title_9 text,
  text_9 text,
  title_10 text,
  text_10 text,
  title_11 text,
  text_11 text,
  title_12 text,
  text_12 text,
  title_13 text,
  text_13 text,
  title_14 text,
  text_14 text,
  title_15 text,
  text_15 text,
  title_16 text,
  text_16 text,
  title_17 text,
  text_17 text,
  title_18 text,
  text_18 text,
  title_19 text,
  text_19 text,
  title_20 text,
  text_20 text,
  title_21 text,
  text_21 text
);

alter table public.cms_licencias enable row level security;

drop policy if exists "cms_licencias_select_anon" on public.cms_licencias;
create policy "cms_licencias_select_anon"
  on public.cms_licencias
  for select
  to anon, authenticated
  using (true);

grant select on public.cms_licencias to anon, authenticated;
grant all on public.cms_licencias to service_role;


-- ----------------------------------------------------------------------------- --
-- supabase_cms_libertad_sindical.sql
-- ----------------------------------------------------------------------------- --
-- Ejecutar en el SQL editor de Supabase (o psql) antes de usar la API.
-- Columnas en inglés snake_case; la API expone el mismo JSON que PostgREST.

create table if not exists public.cms_libertad_sindical (
  id integer primary key,
  description text,
  title_1 text,
  text_1 text,
  title_2 text,
  text_2 text,
  title_3 text,
  text_3 text,
  title_4 text,
  text_4 text,
  title_5 text,
  text_5 text,
  title_6 text,
  text_6 text,
  title_7 text,
  text_7 text,
  title_8 text,
  text_8 text,
  title_9 text,
  text_9 text,
  title_10 text,
  text_10 text
);

alter table public.cms_libertad_sindical enable row level security;

drop policy if exists "cms_libertad_sindical_select_anon" on public.cms_libertad_sindical;
create policy "cms_libertad_sindical_select_anon"
  on public.cms_libertad_sindical
  for select
  to anon, authenticated
  using (true);

grant select on public.cms_libertad_sindical to anon, authenticated;
grant all on public.cms_libertad_sindical to service_role;


-- ----------------------------------------------------------------------------- --
-- supabase_cms_salario.sql
-- ----------------------------------------------------------------------------- --
-- Ejecutar en Supabase SQL editor

create table if not exists public.cms_salario (
  id integer primary key,
  description text,
  title_1 text,
  text_1 text,
  title_2 text,
  text_2 text,
  title_3 text,
  text_3 text,
  title_4 text,
  text_4 text,
  title_5 text,
  text_5 text,
  title_6 text,
  text_6 text,
  title_7 text,
  text_7 text,
  title_8 text,
  text_8 text,
  title_9 text,
  text_9 text,
  title_10 text,
  text_10 text
);

alter table public.cms_salario enable row level security;

drop policy if exists "cms_salario_select_anon" on public.cms_salario;
create policy "cms_salario_select_anon"
  on public.cms_salario
  for select
  to anon, authenticated
  using (true);

grant select on public.cms_salario to anon, authenticated;
grant all on public.cms_salario to service_role;


-- ----------------------------------------------------------------------------- --
-- supabase_cms_seguridad_social.sql
-- ----------------------------------------------------------------------------- --
-- Ejecutar en Supabase SQL editor

create table if not exists public.cms_seguridad_social (
  id integer primary key,
  description text,
  title_1 text,
  text_1 text,
  title_2 text,
  text_2 text,
  title_3 text,
  text_3 text,
  title_4 text,
  text_4 text,
  title_5 text,
  text_5 text,
  title_6 text,
  text_6 text,
  title_7 text,
  text_7 text,
  title_8 text,
  text_8 text,
  title_9 text,
  text_9 text,
  title_10 text,
  text_10 text,
  title_11 text,
  text_11 text,
  title_12 text,
  text_12 text,
  title_13 text,
  text_13 text,
  title_14 text,
  text_14 text,
  title_15 text,
  text_15 text,
  title_16 text,
  text_16 text,
  title_17 text,
  text_17 text
);

alter table public.cms_seguridad_social enable row level security;

drop policy if exists "cms_seguridad_social_select_anon" on public.cms_seguridad_social;
create policy "cms_seguridad_social_select_anon"
  on public.cms_seguridad_social
  for select
  to anon, authenticated
  using (true);

grant select on public.cms_seguridad_social to anon, authenticated;
grant all on public.cms_seguridad_social to service_role;


-- ----------------------------------------------------------------------------- --
-- supabase_cms_trabajo_domestico.sql
-- ----------------------------------------------------------------------------- --
-- Ejecutar en Supabase SQL editor

create table if not exists public.cms_trabajo_domestico (
  id integer primary key,
  description text,
  title_1 text,
  text_1 text,
  title_2 text,
  text_2 text,
  title_3 text,
  text_3 text,
  title_4 text,
  text_4 text,
  title_5 text,
  text_5 text,
  title_6 text,
  text_6 text,
  title_7 text,
  text_7 text,
  title_8 text,
  text_8 text,
  title_9 text,
  text_9 text,
  title_10 text,
  text_10 text
);

alter table public.cms_trabajo_domestico enable row level security;

drop policy if exists "cms_trabajo_domestico_select_anon" on public.cms_trabajo_domestico;
create policy "cms_trabajo_domestico_select_anon"
  on public.cms_trabajo_domestico
  for select
  to anon, authenticated
  using (true);

grant select on public.cms_trabajo_domestico to anon, authenticated;
grant all on public.cms_trabajo_domestico to service_role;


-- ----------------------------------------------------------------------------- --
-- supabase_cms_violencia_acoso.sql
-- ----------------------------------------------------------------------------- --
-- Ejecutar en Supabase SQL editor
create table if not exists public.cms_violencia_acoso (
  id integer primary key,
  description text,
  title_1 text,
  text_1 text,
  title_2 text,
  text_2 text,
  title_3 text,
  text_3 text,
  title_4 text,
  text_4 text,
  title_5 text,
  text_5 text,
  title_6 text,
  text_6 text,
  title_7 text,
  text_7 text,
  title_8 text,
  text_8 text,
  title_9 text,
  text_9 text,
  title_10 text,
  text_10 text
);

alter table public.cms_violencia_acoso enable row level security;

drop policy if exists "cms_violencia_acoso_select_anon" on public.cms_violencia_acoso;
create policy "cms_violencia_acoso_select_anon"
  on public.cms_violencia_acoso
  for select
  to anon, authenticated
  using (true);

grant select on public.cms_violencia_acoso to anon, authenticated;
grant all on public.cms_violencia_acoso to service_role;

