import Link from 'next/link'

export default function ListingCreatedPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-center">
      <h1 className="mb-4 text-2xl font-semibold">Danke!</h1>
      <p className="mb-6">
        Dein Inserat wurde eingereicht und wird nach Prüfung durch einen Admin
        sichtbar.
      </p>
      <Link href="/listings/new" className="underline">
        Weiteres Inserat erstellen
      </Link>
    </main>
  )
}
