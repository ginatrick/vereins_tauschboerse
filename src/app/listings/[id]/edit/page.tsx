import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditForm } from './EditForm'

type Category = { id: number; name: string; slug: string }

type EditListingRow = {
  id: number
  title: string
  description: string | null
  type: 'angebot' | 'gesuch'
  category_id: number
  condition: string | null
  size: string | null
  price: string | null
  phone: string | null
  user_id: string
  listing_images: { id: number; storage_path: string; sort_order: number }[]
}

export default async function EditListingPage({
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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: listing } = await supabase
    .from('listings')
    .select(
      'id, title, description, type, category_id, condition, size, price, phone, user_id, listing_images ( id, storage_path, sort_order )'
    )
    .eq('id', listingId)
    .single()
    .returns<EditListingRow>()

  if (!listing || listing.user_id !== user.id) {
    notFound()
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')
    .returns<Category[]>()

  const images = [...listing.listing_images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({
      id: image.id,
      url: supabase.storage
        .from('listing-images')
        .getPublicUrl(image.storage_path).data.publicUrl,
    }))

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Inserat bearbeiten</h1>
      <EditForm listing={listing} categories={categories ?? []} images={images} />
    </main>
  )
}
