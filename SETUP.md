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

## Was fehlt noch (nächste Schritte)

- Inserat-Formular mit Bild-Upload
- Übersichtsseite mit Suche/Filter
- Admin-Bereich zur Freischaltung
- Nutzerverwaltung für Admin

Siehe `PLAN.md` (separat) für die vollständige Roadmap.
