-- ============================================================
-- Vereins-Tauschbörse – Handynummer & Reserviert-Status
-- Im Supabase-Dashboard unter "SQL Editor" ausführen,
-- NACH schema.sql.
-- ============================================================

alter table public.listings
  add column phone text,
  add column is_reserved boolean not null default false;
