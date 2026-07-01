# Tauschbörse – Setup

Dieses Next.js-Projekt ist fertig vorbereitet mit Supabase-Client,
Session-Middleware und Anmeldung per Magic Link (E-Mail-Login).

## 1. Entpacken

Entpacke diesen Ordner irgendwo auf deinem Rechner, z.B. `Dokumente/`.

## 2. Abhängigkeiten installieren

Im Projektordner (dort wo `package.json` liegt):

```bash
npm install
```

## 3. Supabase-Zugangsdaten eintragen

1. Kopiere `.env.local.example` zu `.env.local`
2. Trage dort deine drei Werte aus dem Supabase-Dashboard ein
   (Project Settings → API): Project URL, anon key, service_role key

```bash
cp .env.local.example .env.local
```

Dann `.env.local` mit einem Editor öffnen und die drei Platzhalter ersetzen.

## 4. Datenbank-Schema einspielen

Im Supabase-Dashboard → **SQL Editor** → „New query" → den Inhalt von
`supabase/schema.sql` reinkopieren → „Run".

Danach den Inhalt von `supabase/storage.sql` genauso ausführen (legt den
Storage-Bucket `listing-images` für Inserat-Bilder samt Zugriffsregeln an).

Danach noch `supabase/contact_policy.sql` ausführen (macht die E-Mail-Adresse
des Inserenten für den "Kontakt aufnehmen"-Button auf der Übersichtsseite
sichtbar, aber nur bei freigeschalteten Inseraten).

## 5. Lokal starten

```bash
npm run dev
```

Im Browser öffnen: http://localhost:3000

Die Anmeldeseite liegt unter: http://localhost:3000/login

## 6. Dich selbst zum Admin machen

Nachdem du dich einmal per Magic Link angemeldet hast, im SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'deine@email.de';
```

## Was ist schon fertig?

- Supabase-Client (Browser + Server) – `src/lib/supabase/`
- Session-Middleware – `src/middleware.ts`
- Anmeldeseite (Magic Link) – `src/app/login/page.tsx`
- Callback-Route für den Magic-Link-Klick – `src/app/auth/callback/route.ts`
- Datenbankschema mit allen Tabellen & Zugriffsregeln – `supabase/schema.sql`
- Storage-Bucket für Bilder – `supabase/storage.sql`
- Inserat-Formular mit Bild-Upload – `src/app/listings/new/`
- Übersichtsseite freigeschalteter Inserate mit Kontakt-Button – `src/app/page.tsx`
- Admin-Bereich zur Freischaltung/Ablehnung – `src/app/admin/`

## Was fehlt noch (nächste Schritte)

- Suche/Filter auf der Übersichtsseite
- E-Mail-Benachrichtigung an Admin bei neuem Inserat
- Admin-Bereich zur Freischaltung
- Nutzerverwaltung für Admin

Siehe `PLAN.md` (separat) für die vollständige Roadmap.
