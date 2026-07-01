-- ============================================================
-- Vereins-Tauschbörse – Storage-Bucket für Inserat-Bilder
-- Im Supabase-Dashboard unter "SQL Editor" ausführen,
-- NACH schema.sql (benötigt public.is_admin()).
-- ============================================================

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

-- Bilder sind öffentlich lesbar (Inserate sollen ohne Login sichtbar sein)
create policy "Bilder oeffentlich lesbar"
  on storage.objects for select
  using (bucket_id = 'listing-images');

-- Angemeldete Nutzer duerfen nur in ihren eigenen Ordner hochladen
-- (Pfad-Konvention: <user_id>/<listing_id>/<dateiname>)
create policy "Eigene Bilder hochladen"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Ersteller darf eigene Bilder loeschen; Admin alle
create policy "Eigene Bilder loeschen oder Admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-images'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
