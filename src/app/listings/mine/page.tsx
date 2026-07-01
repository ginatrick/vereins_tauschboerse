import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { deleteListing, toggleReserved } from './actions'
import { DeleteButton } from './DeleteButton'

type MyListingRow = {
  id: number
  title: string
  type: 'angebot' | 'gesuch'
  status: 'pending' | 'approved' | 'rejected'
  is_reserved: boolean
  price: string | null
  categories: { name: string } | null
  listing_images: { storage_path: string; sort_order: number }[]
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Wartet auf Freischaltung',
  approved: 'Freigeschaltet',
  rejected: 'Abgelehnt',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  approved: 'bg-green-600',
  rejected: 'bg-red-600',
}

export default async function MyListingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: listings, error } = await supabase
    .from('listings')
    .select(
      'id, title, type, status, is_reserved, price, categories ( name ), listing_images ( storage_path, sort_order )'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .returns<MyListingRow[]>()

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Meine Inserate</h1>

      {error ? (
        <p className="text-red-600">
          Inserate konnten nicht geladen werden: {error.message}
        </p>
      ) : !listings || listings.length === 0 ? (
        <p className="text-gray-600">
          Du hast noch keine Inserate erstellt.{' '}
          <Link href="/listings/new" className="underline">
            Jetzt erstellen
          </Link>
        </p>
      ) : (
        <ul className="space-y-4">
          {listings.map((listing) => {
            const [firstImage] = [...listing.listing_images].sort(
              (a, b) => a.sort_order - b.sort_order
            )
            const imageUrl = firstImage
              ? supabase.storage
                  .from('listing-images')
                  .getPublicUrl(firstImage.storage_path).data.publicUrl
              : null

            return (
              <li
                key={listing.id}
                className="flex flex-col items-start gap-4 rounded border border-gray-200 p-4 sm:flex-row sm:items-center"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-gray-100">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`rounded px-2 py-0.5 text-white ${STATUS_COLORS[listing.status]}`}
                    >
                      {STATUS_LABELS[listing.status]}
                    </span>
                    {listing.is_reserved && (
                      <span className="rounded bg-gray-700 px-2 py-0.5 text-white">
                        Reserviert
                      </span>
                    )}
                    {listing.categories?.name && (
                      <span className="text-gray-500">
                        {listing.categories.name}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold">{listing.title}</p>
                  {listing.price && (
                    <p className="text-sm text-gray-600">{listing.price}</p>
                  )}
                </div>
                <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
                  <Link
                    href={`/listings/${listing.id}/edit`}
                    className="rounded border border-gray-300 px-3 py-2 text-center text-sm"
                  >
                    Bearbeiten
                  </Link>
                  <form action={toggleReserved}>
                    <input type="hidden" name="listing_id" value={listing.id} />
                    <input
                      type="hidden"
                      name="current"
                      value={String(listing.is_reserved)}
                    />
                    <button
                      type="submit"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    >
                      {listing.is_reserved
                        ? 'Reservierung aufheben'
                        : 'Als reserviert markieren'}
                    </button>
                  </form>
                  <form action={deleteListing}>
                    <input type="hidden" name="listing_id" value={listing.id} />
                    <DeleteButton />
                  </form>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
