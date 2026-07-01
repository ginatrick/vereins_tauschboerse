import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PhoneReveal } from './PhoneReveal'
import { daysRemainingLabel } from '@/lib/listings/expiry'

type ListingDetailRow = {
  id: number
  title: string
  description: string | null
  type: 'angebot' | 'gesuch'
  condition: string | null
  size: string | null
  price: string | null
  phone: string | null
  is_reserved: boolean
  created_at: string
  categories: { name: string } | null
  profiles: { email: string } | null
  listing_images: { storage_path: string; sort_order: number }[]
}

const TYPE_LABELS: Record<string, string> = {
  angebot: 'Angebot',
  gesuch: 'Gesuch',
}

const CONDITION_LABELS: Record<string, string> = {
  neu: 'Neu',
  gut: 'Gut',
  gebraucht: 'Gebraucht',
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const listingId = Number(id)

  if (!Number.isInteger(listingId)) {
    notFound()
  }

  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select(
      'id, title, description, type, condition, size, price, phone, is_reserved, created_at, categories ( name ), profiles!listings_user_id_fkey ( email ), listing_images ( storage_path, sort_order )'
    )
    .eq('id', listingId)
    .single()
    .returns<ListingDetailRow>()

  if (!listing) {
    notFound()
  }

  const images = [...listing.listing_images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(
      (image) =>
        supabase.storage.from('listing-images').getPublicUrl(image.storage_path)
          .data.publicUrl
    )

  const email = listing.profiles?.email
  const hasPhone = Boolean(listing.phone)

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="mb-6 inline-block text-sm underline">
        ← Zurück zur Übersicht
      </Link>

      {listing.is_reserved && (
        <div className="mb-4">
          <span className="inline-block rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            Reserviert
          </span>
        </div>
      )}

      {images.length > 0 ? (
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map(
            (url, i) =>
              url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`${listing.title} – Bild ${i + 1}`}
                  className="aspect-square w-full rounded object-cover"
                />
              )
          )}
        </div>
      ) : (
        <div className="mb-6 flex aspect-video items-center justify-center rounded bg-gray-100 text-sm text-gray-400">
          Kein Bild
        </div>
      )}

      <div className="mb-2 flex items-center gap-2 text-xs">
        <span className="rounded bg-gray-900 px-2 py-0.5 text-white">
          {TYPE_LABELS[listing.type] ?? listing.type}
        </span>
        {listing.categories?.name && (
          <span className="text-gray-500">{listing.categories.name}</span>
        )}
      </div>

      <h1 className="mb-2 text-2xl font-semibold">{listing.title}</h1>

      {(listing.condition || listing.size || listing.price) && (
        <p className="mb-4 text-sm text-gray-600">
          {[
            listing.condition && CONDITION_LABELS[listing.condition],
            listing.size && `Größe ${listing.size}`,
            listing.price,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}

      {listing.description && (
        <p className="mb-2 whitespace-pre-wrap text-gray-700">
          {listing.description}
        </p>
      )}

      <p className="mb-6 text-xs text-gray-400">
        {daysRemainingLabel(listing.created_at)}
      </p>

      <div className="flex flex-wrap gap-2">
        {email && (
          <a
            href={`mailto:${email}?subject=${encodeURIComponent(
              `Tauschbörse: ${listing.title}`
            )}`}
            className="rounded border border-black px-4 py-2 text-sm"
          >
            E-Mail
          </a>
        )}
        {hasPhone && <PhoneReveal listingId={listing.id} />}
      </div>
    </main>
  )
}
