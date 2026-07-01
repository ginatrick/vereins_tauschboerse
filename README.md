# Tauschbörse – FC Steinbach-Hallenberg e.V.

Interne Tauschbörse für Vereinsmitglieder zum Anbieten und Suchen von
gebrauchter Fußball-Ausrüstung (Schuhe, Trikots, Schienbeinschoner, Bälle
etc.). Mitglieder melden sich per Magic Link oder E-Mail/Passwort an,
erstellen Inserate mit Bildern, andere durchsuchen/filtern die Übersicht und
nehmen per E-Mail oder Telefon Kontakt auf. Ein Admin schaltet neue Inserate
frei und verwaltet Nutzer.

Gebaut mit Next.js (App Router) und Supabase (Postgres, Auth, Storage).

- **Setup / lokale Installation:** siehe [SETUP.md](SETUP.md)
- **Feature-Roadmap / Hintergrund:** siehe [PLAN.md](PLAN.md)

## Kategorien ändern

Kategorien (Schuhe, Trikots, Schienbeinschoner, Bälle, Sonstiges) stehen in
der Tabelle `public.categories` und werden **nicht** im Code gepflegt.
Ändern über das Supabase-Dashboard → **SQL Editor**:

```sql
-- Neue Kategorie hinzufügen
insert into public.categories (name, slug) values ('Torwarthandschuhe', 'torwarthandschuhe');

-- Bestehende Kategorie umbenennen
update public.categories set name = 'Bälle' where slug = 'baelle';

-- Kategorie löschen (schlägt fehl, wenn noch Inserate darauf verweisen)
delete from public.categories where slug = 'torwarthandschuhe';
```

Änderungen sind sofort live, kein Redeploy nötig – die Übersichts-, Formular-
und Filter-Dropdowns laden die Kategorien bei jedem Seitenaufruf frisch aus
der Datenbank.

**Wichtig:** Die Größenauswahl im Inserat-Formular (siehe unten) hängt an der
`slug`-Spalte der Kategorie, nicht am Namen. Wenn eine neue Kategorie auch
Schuh- oder Kleidergrößen anbieten soll, muss zusätzlich ihr `slug` in
`src/lib/listings/validation.ts` eingetragen werden (siehe nächster
Abschnitt).

## Größen ändern

Die verfügbaren Größen sind **fest im Code** hinterlegt, in
[`src/lib/listings/validation.ts`](src/lib/listings/validation.ts). Sie
werden abhängig von der gewählten Kategorie im Inserat-Formular
(Erstellen/Bearbeiten) sowie im Größen-Filter auf der Startseite angezeigt.

```ts
// Schuhgrößen – aktuell 29 bis 48
export const SHOE_SIZES = Array.from({ length: 48 - 29 + 1 }, (_, i) =>
  String(29 + i)
)

// Kleidergrößen (Kinder-Konfektionsgrößen + Erwachsenengrößen)
export const CLOTHING_SIZES = [
  '50/56', '62/68', '74/80', '86/92', '98/104',
  '110/116', '122/128', '134/140', '146/152',
  'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
]

// Welche Kategorie (per slug) welche Größenliste bekommt
const CLOTHING_SIZE_CATEGORY_SLUGS = ['trikots', 'sonstiges']

export function getSizeOptionsForSlug(slug: string | null | undefined): string[] {
  if (slug === 'schuhe') return SHOE_SIZES
  if (slug && CLOTHING_SIZE_CATEGORY_SLUGS.includes(slug)) return CLOTHING_SIZES
  return [] // Kategorien ohne Eintrag hier: Größenfeld bleibt ausgegraut
}
```

**Beispiele:**

- Schuhgröße 49 ergänzen: `48 - 29 + 1` → `49 - 29 + 1` in `SHOE_SIZES` ändern.
- Eine Kleidergröße hinzufügen/entfernen: einfach die `CLOTHING_SIZES`-Liste
  anpassen.
- „Schienbeinschoner" soll auch Größen bekommen: deren `slug`
  (`schienbeinschoner`) zu `CLOTHING_SIZE_CATEGORY_SLUGS` hinzufügen (oder,
  falls es eher Schuhgrößen-artige Zahlen braucht, eine eigene Liste plus
  eigene Bedingung in `getSizeOptionsForSlug` ergänzen).

Diese Datei wird sowohl beim Erstellen als auch beim Bearbeiten eines
Inserats verwendet (Formular-Anzeige **und** serverseitige Validierung), eine
Änderung greift also überall gleichzeitig. Da es sich um Code handelt, ist
nach einer Änderung ein Neustart (`npm run dev`) bzw. ein neuer Deploy
nötig – anders als bei den Kategorien, die direkt aus der Datenbank kommen.
