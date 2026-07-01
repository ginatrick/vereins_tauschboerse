-- ============================================================
-- Vereins-Tauschbörse – Kontakt-E-Mail sichtbar machen
-- Im Supabase-Dashboard unter "SQL Editor" ausführen,
-- NACH schema.sql (benötigt die Tabellen profiles/listings).
--
-- Ohne diese Policy kann niemand außer dem Ersteller selbst und
-- Admins die E-Mail-Adresse in profiles lesen – der "Kontakt
-- aufnehmen"-Button auf der Übersichtsseite könnte sie sonst
-- nicht anzeigen.
-- ============================================================

create policy "E-Mail sichtbar bei eigenen freigegebenen Inseraten"
  on public.profiles for select
  using (
    exists (
      select 1 from public.listings l
      where l.user_id = profiles.id and l.status = 'approved'
    )
  );
