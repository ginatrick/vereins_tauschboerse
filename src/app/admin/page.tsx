import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { approveListing, rejectListing } from './actions'

type PendingListingRow = {
  id: number
  title: string
  type: 'angebot' | 'gesuch'
  condition: string | null
  size: string | null
  price: string | null
  categories: { name: string } | null
  profiles: { email: string; name: string | null } | null
}

const TYPE_LABELS: Record<string, string> = {
  angebot: 'Angebot',
  gesuch: 'Gesuch',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  const { data: pending, error } = await supabase
    .from('listings')
    .select(
      'id, title, type, condition, size, price, categories ( name ), profiles!listings_user_id_fkey ( email, name )'
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .returns<PendingListingRow[]>()

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Admin – Offene Inserate</h1>

      {error ? (
        <p className="text-red-600">
          Inserate konnten nicht geladen werden: {error.message}
        </p>
      ) : !pending || pending.length === 0 ? (
        <p className="text-gray-600">Keine offenen Inserate.</p>
      ) : (
        <ul className="space-y-4">
          {pending.map((listing) => (
            <li
              key={listing.id}
              className="flex items-start justify-between gap-4 rounded border border-gray-200 p-4"
            >
              <div>
                <p className="text-xs uppercase text-gray-500">
                  {TYPE_LABELS[listing.type] ?? listing.type}
                  {listing.categories?.name && ` · ${listing.categories.name}`}
                </p>
                <h2 className="font-semibold">{listing.title}</h2>
                <p className="text-sm text-gray-600">
                  von {listing.profiles?.name || listing.profiles?.email}
                </p>
                {(listing.condition || listing.size || listing.price) && (
                  <p className="text-sm text-gray-600">
                    {[
                      listing.condition,
                      listing.size && `Größe ${listing.size}`,
                      listing.price,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <form action={approveListing}>
                  <input type="hidden" name="listing_id" value={listing.id} />
                  <button
                    type="submit"
                    className="rounded bg-black px-3 py-2 text-sm text-white"
                  >
                    Freischalten
                  </button>
                </form>
                <form action={rejectListing}>
                  <input type="hidden" name="listing_id" value={listing.id} />
                  <button
                    type="submit"
                    className="rounded border border-gray-300 px-3 py-2 text-sm"
                  >
                    Ablehnen
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
