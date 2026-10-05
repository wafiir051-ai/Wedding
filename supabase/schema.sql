-- =====================================================================
--  Undangan Agus & Sinta — skema Supabase
--  Jalankan SEKALI di: Supabase Dashboard → SQL Editor → New query → Run
--  Aman dijalankan ulang (idempotent).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Tabel ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default encode(gen_random_bytes(5), 'hex'),
  name text not null check (char_length(name) between 1 and 80),
  label text not null default '' check (char_length(label) <= 40),
  created_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid unique references public.guests(id) on delete set null,
  name text not null check (char_length(name) between 1 and 60),
  attendance text not null check (attendance in ('hadir','tidak','ragu')),
  pax int not null default 1 check (pax between 0 and 10),
  message text not null default '' check (char_length(message) <= 500),
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rsvps_updated_idx on public.rsvps (updated_at desc);

-- ---------- Helper: apakah pemanggil admin? ----------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- RLS: tabel TERTUTUP untuk publik, hanya admin ----------
alter table public.admins enable row level security;
alter table public.guests enable row level security;
alter table public.rsvps  enable row level security;

drop policy if exists admins_self   on public.admins;
drop policy if exists guests_admin  on public.guests;
drop policy if exists rsvps_admin   on public.rsvps;

create policy admins_self  on public.admins for select to authenticated using (user_id = auth.uid());
create policy guests_admin on public.guests for all    to authenticated using (public.is_admin()) with check (public.is_admin());
create policy rsvps_admin  on public.rsvps  for all    to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Fungsi publik (dipanggil tamu lewat anon key) ----------
-- Ambil nama tamu + RSVP-nya dari kode link personal
create or replace function public.get_guest(p_code text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'name', g.name,
    'rsvp', (select json_build_object('attendance', r.attendance, 'pax', r.pax, 'message', r.message)
             from public.rsvps r where r.guest_id = g.id)
  )
  from public.guests g where g.code = p_code;
$$;

-- Daftar ucapan yang tampil di buku tamu
create or replace function public.list_messages(p_limit int default 10, p_offset int default 0)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'total', (select count(*) from public.rsvps where visible and message <> ''),
    'items', coalesce((
      select json_agg(t) from (
        select id, name, attendance, message, updated_at as created_at
        from public.rsvps
        where visible and message <> ''
        order by updated_at desc
        limit least(greatest(p_limit,1),50) offset greatest(p_offset,0)
      ) t), '[]'::json)
  );
$$;

-- Kirim / perbarui RSVP. Tamu dengan kode → diperbarui (1 tamu = 1 RSVP).
create or replace function public.submit_rsvp(
  p_code text, p_name text, p_attendance text, p_pax int, p_message text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_guest public.guests;
  v_name text := left(btrim(coalesce(p_name,'')), 60);
  v_msg  text := left(btrim(coalesce(p_message,'')), 500);
  v_pax  int;
  v_row  public.rsvps;
begin
  if p_attendance not in ('hadir','tidak','ragu') then
    raise exception 'Pilih konfirmasi kehadiran';
  end if;
  v_pax := case when p_attendance = 'tidak' then 0 else least(greatest(coalesce(p_pax,1),1),10) end;

  if p_code is not null and p_code <> '' then
    select * into v_guest from public.guests where code = p_code;
  end if;
  if v_name = '' and v_guest.id is not null then v_name := v_guest.name; end if;
  if v_name = '' then raise exception 'Nama wajib diisi'; end if;

  if v_guest.id is not null then
    insert into public.rsvps (guest_id, name, attendance, pax, message)
    values (v_guest.id, v_name, p_attendance, v_pax, v_msg)
    on conflict (guest_id) do update
      set name = excluded.name, attendance = excluded.attendance, pax = excluded.pax,
          message = excluded.message, updated_at = now()
    returning * into v_row;
  else
    -- anti-spam: abaikan kiriman identik dalam 2 menit terakhir
    select * into v_row from public.rsvps
      where guest_id is null and name = v_name and message = v_msg and attendance = p_attendance
        and created_at > now() - interval '2 minutes' limit 1;
    if not found then
      insert into public.rsvps (name, attendance, pax, message)
      values (v_name, p_attendance, v_pax, v_msg) returning * into v_row;
    end if;
  end if;

  return json_build_object('id', v_row.id, 'name', v_row.name, 'attendance', v_row.attendance,
                           'message', v_row.message, 'created_at', v_row.updated_at);
end $$;

revoke all on function public.get_guest(text), public.list_messages(int,int),
  public.submit_rsvp(text,text,text,int,text) from public;
grant execute on function public.get_guest(text), public.list_messages(int,int),
  public.submit_rsvp(text,text,text,int,text) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;

-- =====================================================================
--  LANGKAH MANUAL SETELAH MENJALANKAN SQL DI ATAS
--  1) Authentication → Users → Add user → isi email + password admin
--     (centang "Auto Confirm User").
--  2) Authentication → Sign In / Providers → matikan "Allow new users to sign up".
--  3) Jadikan user itu admin (ganti emailnya), jalankan:
--
--     insert into public.admins (user_id)
--     select id from auth.users where email = 'GANTI_EMAIL_ADMIN@contoh.com';
-- =====================================================================
