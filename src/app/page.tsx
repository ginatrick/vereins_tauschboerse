import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type ListingRow = {
  id: number
  title: string
  description: string | null
  type: 'angebot' | 'gesuch'
  condition: string | null
  size: string | null
  price: string | null
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

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  const { data: listings, error } = await supabase
    .from('listings')
    .select(
      'id, title, description, type, condition, size, price, categories ( name ), profiles!listings_user_id_fkey ( email ), listing_images ( storage_path, sort_order )'
    )
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .returns<ListingRow[]>()

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tauschbörse</h1>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link href="/admin" className="text-sm underline">
              Admin
            </Link>
          )}
          <Link
            href="/listings/new"
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            + Neues Inserat
          </Link>
        </div>
      </div>

      {error ? (
        <p className="text-red-600">
          Inserate konnten nicht geladen werden: {error.message}
        </p>
      ) : !listings || listings.length === 0 ? (
        <p className="text-gray-600">
          Noch keine freigeschalteten Inserate vorhanden.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => {
            const [firstImage] = [...listing.listing_images].sort(
              (a, b) => a.sort_order - b.sort_order
            )
            const imageUrl = firstImage
              ? supabase.storage
                  .from('listing-images')
                  .getPublicUrl(firstImage.storage_path).data.publicUrl
              : null
            const email = listing.profiles?.email

            return (
              <div
                key={listing.id}
                className="flex flex-col overflow-hidden rounded border border-gray-200"
              >
                <div className="aspect-square bg-gray-100">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      Kein Bild
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded bg-gray-900 px-2 py-0.5 text-white">
                      {TYPE_LABELS[listing.type] ?? listing.type}
                    </span>
                    {listing.categories?.name && (
                      <span className="text-gray-500">
                        {listing.categories.name}
                      </span>
                    )}
                  </div>
                  <h2 className="font-semibold">{listing.title}</h2>
                  {listing.description && (
                    <p className="line-clamp-3 text-sm text-gray-600">
                      {listing.description}
                    </p>
                  )}
                  <div className="mt-auto space-y-1 text-sm text-gray-600">
                    {(listing.condition || listing.size) && (
                      <p>
                        {listing.condition &&
                          CONDITION_LABELS[listing.condition]}
                        {listing.condition && listing.size && ' · '}
                        {listing.size && `Größe ${listing.size}`}
                      </p>
                    )}
                    {listing.price && <p className="font-medium">{listing.price}</p>}
                  </div>
                  {email && (
                    <a
                      href={`mailto:${email}?subject=${encodeURIComponent(
                        `Tauschbörse: ${listing.title}`
                      )}`}
                      className="mt-2 rounded border border-black px-3 py-2 text-center text-sm"
                    >
                      Kontakt aufnehmen
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
