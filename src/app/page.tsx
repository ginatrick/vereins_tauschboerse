import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SHOE_SIZES, CLOTHING_SIZES } from '@/lib/listings/validation'
import { daysRemainingLabel } from '@/lib/listings/expiry'

type ListingRow = {
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

type Category = { id: number; name: string }

const TYPE_LABELS: Record<string, string> = {
  angebot: 'Angebot',
  gesuch: 'Gesuch',
}

const CONDITION_LABELS: Record<string, string> = {
  neu: 'Neu',
  gut: 'Gut',
  gebraucht: 'Gebraucht',
}

type HomeProps = {
  searchParams: Promise<{
    type?: string
    category?: string
    condition?: string
    size?: string
    q?: string
  }>
}

export default async function Home({ searchParams }: HomeProps) {
  const { type, category, condition, size, q } = await searchParams
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')
    .returns<Category[]>()

  let query = supabase
    .from('listings')
    .select(
      'id, title, description, type, condition, size, price, phone, is_reserved, created_at, categories ( name ), profiles!listings_user_id_fkey ( email ), listing_images ( storage_path, sort_order )'
    )
    .eq('status', 'approved')

  if (type) query = query.eq('type', type)
  if (category) query = query.eq('category_id', Number(category))
  if (condition) query = query.eq('condition', condition)
  if (size) query = query.eq('size', size)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: listings, error } = await query
    .order('created_at', { ascending: false })
    .returns<ListingRow[]>()

  const hasActiveFilter = Boolean(type || category || condition || size || q)

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Aktuelle Inserate</h1>

      <form className="mb-8 flex flex-wrap items-end gap-3 rounded border border-gray-200 p-4">
        <div>
          <label htmlFor="q" className="block text-xs font-medium text-gray-600">
            Suche
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Titel"
            className="mt-1 rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-xs font-medium text-gray-600">
            Art
          </label>
          <select
            id="type"
            name="type"
            defaultValue={type ?? ''}
            className="mt-1 rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="">Alle</option>
            <option value="angebot">Angebot</option>
            <option value="gesuch">Gesuch</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-xs font-medium text-gray-600"
          >
            Kategorie
          </label>
          <select
            id="category"
            name="category"
            defaultValue={category ?? ''}
            className="mt-1 rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="">Alle</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="condition"
            className="block text-xs font-medium text-gray-600"
          >
            Zustand
          </label>
          <select
            id="condition"
            name="condition"
            defaultValue={condition ?? ''}
            className="mt-1 rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="">Alle</option>
            <option value="neu">Neu</option>
            <option value="gut">Gut</option>
            <option value="gebraucht">Gebraucht</option>
          </select>
        </div>
        <div>
          <label htmlFor="size" className="block text-xs font-medium text-gray-600">
            Größe
          </label>
          <select
            id="size"
            name="size"
            defaultValue={size ?? ''}
            className="mt-1 rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="">Alle</option>
            <optgroup label="Schuhgrößen">
              {SHOE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </optgroup>
            <optgroup label="Kleidergrößen">
              {CLOTHING_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <button
          type="submit"
          className="rounded bg-black px-4 py-1.5 text-sm text-white"
        >
          Filtern
        </button>
        {hasActiveFilter && (
          <Link href="/" className="text-sm underline">
            Zurücksetzen
          </Link>
        )}
      </form>

      {error ? (
        <p className="text-red-600">
          Inserate konnten nicht geladen werden: {error.message}
        </p>
      ) : !listings || listings.length === 0 ? (
        <p className="text-gray-600">
          Keine Inserate gefunden.
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
                className={`flex flex-col overflow-hidden rounded border border-gray-200 ${
                  listing.is_reserved ? 'opacity-60' : ''
                }`}
              >
                <Link href={`/listings/${listing.id}`} className="flex flex-1 flex-col">
                  <div className="relative aspect-square bg-gray-100">
                    {listing.is_reserved && (
                      <span className="absolute left-2 top-2 z-10 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                        Reserviert
                      </span>
                    )}
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
                  <div className="flex flex-1 flex-col gap-2 p-4 pb-0">
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
                      <p className="line-clamp-2 text-sm text-gray-600">
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
                      {listing.phone && (
                        <p className="text-gray-500">Telefonnummer verfügbar</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {daysRemainingLabel(listing.created_at)}
                      </p>
                    </div>
                  </div>
                </Link>
                {email && (
                  <div className="p-4 pt-2">
                    <a
                      href={`mailto:${email}?subject=${encodeURIComponent(
                        `Tauschbörse: ${listing.title}`
                      )}`}
                      className="block rounded border border-black px-3 py-2 text-center text-sm"
                    >
                      E-Mail
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
