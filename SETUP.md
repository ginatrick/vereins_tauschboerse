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

Danach noch `supabase/phone_reserved.sql` ausführen (fügt die optionale
Handynummer und den "Reserviert"-Status zu Inseraten hinzu – **ohne diesen
Schritt zeigt die Startseite einen Fehler**, weil die Spalten fehlen).

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

## 7. E-Mail-Versand über Resend einrichten (behebt „email rate limit exceeded")

Solange kein eigener SMTP-Anbieter hinterlegt ist, verschickt Supabase
Anmelde-Links über einen gemeinsam genutzten Dienst mit sehr niedrigem
Limit (wenige E-Mails pro Stunde) – nur für erste Tests gedacht. Für den
echten Betrieb im Verein: eigenen SMTP-Anbieter (Resend) hinterlegen.

**Voraussetzung:** Zugriff auf die DNS-Einstellungen einer Domain (z.B. die
Vereins-Domain). Am saubersten ist eine eigene Subdomain nur fürs Mailen,
z.B. `mail.eure-vereins-domain.de` – dann fasst ihr die bestehenden
DNS-Einträge der Haupt-Website nicht an.

1. Bei [resend.com](https://resend.com) registrieren (kostenloses Kontingent
   reicht für einen Verein locker aus).
2. Im Resend-Dashboard unter **Domains** → „Add Domain" die Subdomain
   eintragen (z.B. `mail.eure-vereins-domain.de`).
3. Resend zeigt dir daraufhin 2-3 DNS-Einträge an (TXT-Records für SPF und
   DKIM, ggf. ein MX-Record). Diese müssen bei dem/der DNS-Verwalter(in)
   eurer Domain eingetragen werden – dauert dort meist nur wenige Minuten.
4. Zurück im Resend-Dashboard warten, bis die Domain als „Verified" markiert
   ist (DNS-Ausbreitung kann bis zu ein paar Stunden dauern).
5. Unter **API Keys** einen neuen Key erstellen und sicher notieren.
6. Im Supabase-Dashboard → **Authentication → Emails → SMTP Settings**:
   - Absender-E-Mail: z.B. `noreply@mail.eure-vereins-domain.de`
   - Absender-Name: z.B. „Tauschbörse FC Steinbach-Hallenberg"
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Passwort: der eben erstellte Resend-API-Key
   - Speichern.
7. Testen: auf `/login` erneut einen Anmelde-Link anfordern – jetzt läuft er
   über Resend statt über das strenge Supabase-Standardlimit.

Bis dahin gilt als Workaround: Passwort-Login auf `/login` nutzen (Reiter
„Passwort") – der ist vom E-Mail-Limit nicht betroffen, da dabei keine
E-Mail verschickt wird.

## Was ist schon fertig?

- Supabase-Client (Browser + Server) – `src/lib/supabase/`
- Proxy/Session-Refresh – `src/proxy.ts`
- Anmeldeseite (Magic Link **und** E-Mail/Passwort) – `src/app/login/page.tsx`
- Konto-Seite zum Passwort festlegen/ändern – `src/app/account/`
- Abmelden (Header, auf jeder Seite inkl. Startseite) – `src/app/auth/actions.ts`
- Callback-Route für den Magic-Link-Klick – `src/app/auth/callback/route.ts`
- Datenbankschema mit allen Tabellen & Zugriffsregeln – `supabase/schema.sql`
- Storage-Bucket für Bilder – `supabase/storage.sql`
- Inserat-Formular mit Bild-Upload, Handynummer (optional) – `src/app/listings/new/`
- Übersichtsseite mit Filter (Art/Kategorie/Zustand/Größe/Suche),
  Reserviert-Badge – `src/app/page.tsx`
- Detailseite je Inserat: volle Beschreibung, Bildergalerie, E-Mail-Kontakt,
  Telefonnummer erst nach Klick sichtbar (Spam-Schutz) –
  `src/app/listings/[id]/`
- Admin-Bereich: alle Inserate (Filter nach Status), Freischalten/Ablehnen/
  Sperren – `src/app/admin/`
- Admin-Nutzerverwaltung: Nutzer sperren/entsperren/löschen (inkl. Account
  und Storage-Aufräumen) – `src/app/admin/users/`
- „Meine Inserate"-Bereich: eigene Inserate bearbeiten, löschen, als
  reserviert markieren – `src/app/listings/mine/`, `src/app/listings/[id]/edit/`
- Vereinslogo im Header – `public/logo.png`, `src/components/Header.tsx`

## Was fehlt noch (nächste Schritte)

- Volltextsuche über Titel/Beschreibung (aktuell nur Titel-Suche)
- E-Mail-Benachrichtigung an Admin bei neuem Inserat

Siehe `PLAN.md` (separat) für die vollständige Roadmap.
