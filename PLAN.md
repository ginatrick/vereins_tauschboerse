# PLAN.md – Vereins-Tauschbörse Fußball

Interne Tauschbörse für Vereinsmitglieder zum Anbieten und Suchen von
gebrauchter Fußball-Ausrüstung (Schuhe, Trikots, Schienbeinschoner, Bälle etc.).

---

## 1. Zielsetzung

Mitglieder können Inserate (Angebote und Gesuche) für gebrauchte Fußball-Artikel
erstellen. Andere Mitglieder durchsuchen und filtern die Inserate und nehmen bei
Interesse direkt per E-Mail Kontakt auf. Ein Admin schaltet neue Inserate frei
und verwaltet die Nutzer.

## 2. Anforderungen

**Zielgruppe:** Vereinsmitglieder.

**Anmeldung:** Per E-Mail-Adresse ohne klassisches Passwort (Magic Link).
Kein aufwendiges Auth-System.

**Spam-Schutz:** CAPTCHA (hCaptcha / Cloudflare Turnstile) beim Erstellen von
Inseraten.

**Kernfunktionen:**
- Inserate erstellen (mit Bild-Upload)
- Inserate durchsuchen und filtern
- Kontaktaufnahme (direkt per E-Mail, kein internes Nachrichtensystem)
- Verschiedene Kategorien
- Freischaltung der Inserate durch Admin (mit E-Mail-Benachrichtigung + Freischalten-Button)
- Nutzerverwaltung für Admin (sehen wer wie viel anbietet, Nutzer/Inserate löschen)

**Nicht im Scope (vorerst):** Internes Nachrichtensystem, Bewertungen, Bezahlfunktion.

## 3. Tech-Stack

| Bereich          | Technologie                          | Grund                                        |
|------------------|--------------------------------------|----------------------------------------------|
| Frontend/Backend | Next.js (React)                      | Frontend + API-Routes in einem               |
| Datenbank        | Supabase (PostgreSQL)                | Kein eigener Server nötig                     |
| Datei-Storage    | Supabase Storage                     | Bild-Upload integriert                        |
| Anmeldung        | Supabase Auth – Magic Link           | Login per E-Mail, ohne Passwort              |
| CAPTCHA          | hCaptcha oder Cloudflare Turnstile   | Kostenlos, DSGVO-freundlich                   |
| E-Mail-Versand   | Resend oder Supabase SMTP            | Admin-Benachrichtigung bei neuem Inserat     |
| Hosting          | Vercel (Frontend) + Supabase (DB)    | Großzügige Free-Tarife, für Verein ausreichend |

**Einfachere Alternative:** Astro oder Laravel (PHP), falls Next.js zu viel ist –
für die genannten Features ist Next.js + Supabase aber der bequemste Weg.

## 4. Datenmodell

### users
(größtenteils von Supabase Auth verwaltet)
- `id`
- `email`
- `name`
- `role` (member / admin)
- `is_blocked` (boolean)
- `created_at`

### categories
- `id`
- `name` (Schuhe, Trikots, Schienbeinschoner, Bälle, Sonstiges)
- `slug`

### listings
- `id`
- `user_id` → users
- `category_id` → categories
- `title`
- `description`
- `type` (Angebot / Gesuch)
- `condition` (neu / gut / gebraucht)
- `size`
- `price` (optional – z.B. „VB", „gegen Spende")
- `status` (pending / approved / rejected)
- `created_at`
- `approved_at`
- `approved_by` → users

### listing_images
- `id`
- `listing_id` → listings
- `storage_path`
- `sort_order`

**Kontaktaufnahme:** Auf der Detailseite Button „Kontakt aufnehmen" → zeigt
E-Mail des Inserenten oder öffnet `mailto:`-Link. Kein Nachrichtensystem nötig.

## 5. Feature-Roadmap

### Phase 1 – MVP (Grundgerüst)
- Datenmodell aufsetzen
- E-Mail-Anmeldung (Magic Link)
- Inserate erstellen: Formular + Bild-Upload + CAPTCHA
- Inserate-Übersicht anzeigen
- Neue Inserate → Status „pending"

### Phase 2 – Admin & Freischaltung
- Admin-Bereich mit Liste offener Inserate
- „Freischalten" / „Ablehnen"-Buttons
- E-Mail-Benachrichtigung an Admin bei neuem Inserat
- Nur freigeschaltete Inserate öffentlich sichtbar

### Phase 3 – Suche & Filter
- Volltextsuche (Titel / Beschreibung)
- Filter nach Kategorie, Typ (Angebot/Gesuch), Größe, Zustand

### Phase 4 – Nutzerverwaltung
- Admin sieht alle Nutzer + Anzahl ihrer Inserate
- Nutzer sperren (is_blocked)
- Inserate von Nutzern löschen

### Phase 5 – Feinschliff
- Responsives Design (Handy)
- Bildkomprimierung beim Upload
- Optional: Ablaufdatum für Inserate
- Vereinslogo / Branding

## 6. Entwicklungsansatz: erst lokal, dann Web

Das Projekt wird zunächst vollständig lokal auf dem eigenen Rechner gebaut und
getestet. Erst wenn es fertig ist, wird es in die Web-Umgebung deployed.

### Lokaler Ablauf
1. Next.js läuft auf `localhost:3000`
2. Datenbank: Supabase lokal (per CLI in Docker) **oder** kostenloses
   Supabase-Cloud-Projekt als DB, gegen das lokal entwickelt wird
   (geringerer Aufwand für den Start)
3. Zugangsdaten in `.env.local` – bleibt lokal, kommt **nicht** ins Git
   (in `.gitignore` eintragen)
4. Komplette Entwicklung + Tests lokal, Phase 1 bis 5
5. Deployment erst am Ende: Frontend auf Vercel, Schema in Cloud-Supabase migrieren

### E-Mail lokal testen
Magic-Link-Anmeldung und Admin-Benachrichtigung senden lokal keine echten
E-Mails. Stattdessen mit **Mailpit** oder **Inbucket** abfangen und im Browser
ansehen. Echter Versand (Resend / SMTP) wird erst beim Deployment konfiguriert.

## 7. Nächste Schritte

1. Next.js-Projekt lokal aufsetzen (`npx create-next-app`)
2. Supabase lokal (Docker) oder kostenloses Cloud-Projekt als DB anlegen
3. Tabellen aus Abschnitt 4 per SQL-Skript erstellen
4. `.env.local` mit Zugangsdaten anlegen, `.gitignore` prüfen
5. Mit Phase 1 beginnen: Anmeldung + Inserat-Formular
6. Diesen Plan in Claude Code laden und iterativ Phase für Phase umsetzen
