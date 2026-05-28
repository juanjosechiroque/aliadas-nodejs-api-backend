-- Añade youtube_url a tablas CMS (ejecutar en Supabase SQL Editor si la BD ya existía).

alter table public.cms_beneficios add column if not exists youtube_url text;
alter table public.cms_contratacion add column if not exists youtube_url text;
alter table public.cms_empleador add column if not exists youtube_url text;
alter table public.cms_enfermedades add column if not exists youtube_url text;
alter table public.cms_jornada add column if not exists youtube_url text;
alter table public.cms_licencias add column if not exists youtube_url text;
alter table public.cms_libertad_sindical add column if not exists youtube_url text;
alter table public.cms_salario add column if not exists youtube_url text;
alter table public.cms_seguridad_social add column if not exists youtube_url text;
alter table public.cms_trabajo_domestico add column if not exists youtube_url text;
alter table public.cms_violencia_acoso add column if not exists youtube_url text;

-- Valores iniciales (mismos videos que tenía el front hardcodeado).
update public.cms_violencia_acoso set youtube_url = 'https://www.youtube.com/embed/j0EK_2IUAJ0' where id = 1 and (youtube_url is null or youtube_url = '');
update public.cms_trabajo_domestico set youtube_url = 'https://www.youtube.com/embed/2jFMUTv-ApA' where id = 1 and (youtube_url is null or youtube_url = '');
update public.cms_seguridad_social set youtube_url = 'https://www.youtube.com/embed/uGjC8wT3yHw' where id = 1 and (youtube_url is null or youtube_url = '');
update public.cms_salario set youtube_url = 'https://www.youtube.com/embed/uGjC8wT3yHw' where id = 1 and (youtube_url is null or youtube_url = '');
update public.cms_licencias set youtube_url = 'https://www.youtube.com/embed/Q7KnDpmLShQ' where id = 1 and (youtube_url is null or youtube_url = '');
update public.cms_libertad_sindical set youtube_url = 'https://www.youtube.com/embed/YAvkx9UqVaU' where id = 1 and (youtube_url is null or youtube_url = '');
update public.cms_jornada set youtube_url = 'https://www.youtube.com/embed/toe930gCdvY' where id = 1 and (youtube_url is null or youtube_url = '');
update public.cms_enfermedades set youtube_url = 'https://www.youtube.com/embed/3g2fTM6Sryg' where id = 1 and (youtube_url is null or youtube_url = '');
update public.cms_contratacion set youtube_url = 'https://www.youtube.com/embed/WXRP2wGP4Bw' where id = 1 and (youtube_url is null or youtube_url = '');
update public.cms_beneficios set youtube_url = 'https://www.youtube.com/embed/g8aPIUgA-aA' where id = 1 and (youtube_url is null or youtube_url = '');
