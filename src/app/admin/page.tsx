import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/require-admin'
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton'
import { daysRemainingLabel } from '@/lib/listings/expiry'
import { approveListing, rejectListing, adminDeleteListing } from './actions'

type ListingRow = {
  id: number
  title: string
  type: 'angebot' | 'gesuch'
  status: 'pending' | 'approved' | 'rejected'
  condition: string | null
  size: string | null
  price: string | null
  created_at: string
  categories: { name: string } | null
  profiles: { email: string; name: string | null } | null
}

const TYPE_LABELS: Record<string, string> = {
  angebot: 'Angebot',
  gesuch: 'Gesuch',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Wartet auf Freischaltung',
  approved: 'Freigeschaltet',
  rejected: 'Gesperrt/Abgelehnt',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  approved: 'bg-green-600',
  rejected: 'bg-red-600',
}

const TABS = [
  { value: '', label: 'Alle' },
  { value: 'pending', label: 'Offen' },
  { value: 'approved', label: 'Freigeschaltet' },
  { value: 'rejected', label: 'Gesperrt/Abgelehnt' },
]

type AdminPageProps = {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { status } = await searchParams
  const { supabase } = await requireAdmin()

  let query = supabase
    .from('listings')
    .select(
      'id, title, type, status, condition, size, price, created_at, categories ( name ), profiles!listings_user_id_fkey ( email, name )'
    )

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query = query.eq('status', status)
  }

  const { data: listings, error } = await query
    .order('created_at', { ascending: false })
    .returns<ListingRow[]>()

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin – Inserate</h1>
        <Link href="/admin/users" className="text-sm underline">
          Nutzerverwaltung
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin?status=${tab.value}` : '/admin'}
            className={`rounded px-3 py-1.5 ${
              (status ?? '') === tab.value
                ? 'bg-black text-white'
                : 'border border-gray-300'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {error ? (
        <p className="text-red-600">
          Inserate konnten nicht geladen werden: {error.message}
        </p>
      ) : !listings || listings.length === 0 ? (
        <p className="text-gray-600">Keine Inserate gefunden.</p>
      ) : (
        <ul className="space-y-4">
          {listings.map((listing) => (
            <li
              key={listing.id}
              className="flex items-start justify-between gap-4 rounded border border-gray-200 p-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`rounded px-2 py-0.5 text-white ${STATUS_COLORS[listing.status]}`}
                  >
                    {STATUS_LABELS[listing.status]}
                  </span>
                  <span className="uppercase text-gray-500">
                    {TYPE_LABELS[listing.type] ?? listing.type}
                    {listing.categories?.name && ` · ${listing.categories.name}`}
                  </span>
                  <span className="text-gray-500">
                    {daysRemainingLabel(listing.created_at)}
                  </span>
                </div>
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
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                {listing.status !== 'approved' && (
                  <form action={approveListing}>
                    <input type="hidden" name="listing_id" value={listing.id} />
                    <button
                      type="submit"
                      className="w-full rounded bg-black px-3 py-2 text-sm text-white"
                    >
                      Freischalten
                    </button>
                  </form>
                )}
                {listing.status !== 'rejected' && (
                  <form action={rejectListing}>
                    <input type="hidden" name="listing_id" value={listing.id} />
                    <button
                      type="submit"
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    >
                      {listing.status === 'approved' ? 'Sperren' : 'Ablehnen'}
                    </button>
                  </form>
                )}
                <form action={adminDeleteListing}>
                  <input type="hidden" name="listing_id" value={listing.id} />
                  <ConfirmSubmitButton
                    confirmMessage={`Inserat "${listing.title}" wirklich unwiderruflich löschen?`}
                    className="w-full rounded border border-red-600 px-3 py-2 text-sm text-red-600"
                  >
                    Löschen
                  </ConfirmSubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
