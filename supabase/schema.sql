-- ============================================================
-- Vereins-Tauschbörse – Datenbankschema für Supabase
-- Im Supabase-Dashboard unter "SQL Editor" ausführen.
-- ============================================================

-- ----------------------------------------------------------------
-- profiles
-- Ergänzt die von Supabase Auth verwaltete Tabelle auth.users.
-- Für jeden angemeldeten Nutzer wird automatisch ein Profil angelegt.
-- ----------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  name        text,
  role        text not null default 'member' check (role in ('member', 'admin')),
  is_blocked  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Automatisch ein Profil anlegen, sobald sich jemand per E-Mail anmeldet
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------
create table public.categories (
  id    bigint generated always as identity primary key,
  name  text not null,
  slug  text not null unique
);

insert into public.categories (name, slug) values
  ('Schuhe',            'schuhe'),
  ('Trikots',           'trikots'),
  ('Schienbeinschoner', 'schienbeinschoner'),
  ('Bälle',             'baelle'),
  ('Sonstiges',         'sonstiges');

-- ----------------------------------------------------------------
-- listings
-- ----------------------------------------------------------------
create table public.listings (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  category_id  bigint not null references public.categories (id),
  title        text not null,
  description  text,
  type         text not null check (type in ('angebot', 'gesuch')),
  condition    text check (condition in ('neu', 'gut', 'gebraucht')),
  size         text,
  price        text,                 -- frei: "10 EUR", "VB", "gegen Spende"
  status       text not null default 'pending'
                 check (status in ('pending', 'approved', 'rejected')),
  created_at   timestamptz not null default now(),
  approved_at  timestamptz,
  approved_by  uuid references public.profiles (id)
);

create index listings_status_idx   on public.listings (status);
create index listings_category_idx on public.listings (category_id);
create index listings_user_idx     on public.listings (user_id);

-- ----------------------------------------------------------------
-- listing_images
-- ----------------------------------------------------------------
create table public.listing_images (
  id           bigint generated always as identity primary key,
  listing_id   bigint not null references public.listings (id) on delete cascade,
  storage_path text not null,
  sort_order   int not null default 0
);

create index listing_images_listing_idx on public.listing_images (listing_id);

-- ============================================================
-- Row Level Security (RLS)
-- Regelt, wer welche Daten sehen/ändern darf.
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.listings       enable row level security;
alter table public.listing_images enable row level security;

-- Hilfsfunktion: ist der aktuelle Nutzer Admin?
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- --- profiles ---
-- Jeder sieht sein eigenes Profil; Admin sieht alle
create policy "Eigenes Profil oder Admin sieht alle"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

-- Nutzer darf eigenes Profil bearbeiten (z.B. Name)
create policy "Eigenes Profil bearbeiten"
  on public.profiles for update
  using (id = auth.uid());

-- --- categories ---
-- Kategorien darf jeder lesen
create policy "Kategorien öffentlich lesbar"
  on public.categories for select
  using (true);

-- --- listings ---
-- Freigeschaltete Inserate sind für alle sichtbar;
-- eigene (auch pending) sieht der Ersteller; Admin sieht alles
create policy "Freigegebene, eigene oder Admin"
  on public.listings for select
  using (
    status = 'approved'
    or user_id = auth.uid()
    or public.is_admin()
  );

-- Angemeldete, nicht gesperrte Nutzer dürfen Inserate anlegen
create policy "Inserat anlegen"
  on public.listings for insert
  with check (
    user_id = auth.uid()
    and not exists (
      select 1 from public.profiles
      where id = auth.uid() and is_blocked = true
    )
  );

-- Ersteller darf eigene Inserate bearbeiten; Admin alle (für Freischaltung)
create policy "Eigene bearbeiten oder Admin"
  on public.listings for update
  using (user_id = auth.uid() or public.is_admin());

-- Ersteller darf eigene löschen; Admin alle
create policy "Eigene löschen oder Admin"
  on public.listings for delete
  using (user_id = auth.uid() or public.is_admin());

-- --- listing_images ---
-- Bilder sichtbar, wenn das zugehörige Inserat sichtbar ist
create policy "Bilder sichtbar wie Inserat"
  on public.listing_images for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.status = 'approved' or l.user_id = auth.uid() or public.is_admin())
    )
  );

-- Bilder anlegen/löschen nur zum eigenen Inserat (oder Admin)
create policy "Bilder verwalten"
  on public.listing_images for all
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.user_id = auth.uid() or public.is_admin())
    )
  );

-- ============================================================
-- HINWEIS Storage:
-- Im Dashboard unter "Storage" einen Bucket "listing-images" anlegen.
-- Zugriffsregeln (Policies) dort separat setzen: Lesen öffentlich,
-- Schreiben nur für angemeldete Nutzer.
--
-- HINWEIS Admin:
-- Ersten Admin manuell setzen, nachdem du dich einmal angemeldet hast:
--   update public.profiles set role = 'admin' where email = 'deine@email.de';
-- ============================================================
