'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'

export async function approveListing(formData: FormData) {
  const { supabase, user } = await requireAdmin()
  const listingId = Number(formData.get('listing_id'))

  await supabase
    .from('listings')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    })
    .eq('id', listingId)

  revalidatePath('/admin')
}

export async function rejectListing(formData: FormData) {
  const { supabase, user } = await requireAdmin()
  const listingId = Number(formData.get('listing_id'))

  await supabase
    .from('listings')
    .update({
      status: 'rejected',
      approved_at: new Date().toISOString(),
      approved_by: user.id,
    })
    .eq('id', listingId)

  revalidatePath('/admin')
}

export async function adminDeleteListing(formData: FormData) {
  const { supabase } = await requireAdmin()
  const listingId = Number(formData.get('listing_id'))

  const { data: images } = await supabase
    .from('listing_images')
    .select('storage_path')
    .eq('listing_id', listingId)

  const paths = (images ?? []).map((image) => image.storage_path)
  if (paths.length > 0) {
    await supabase.storage.from('listing-images').remove(paths)
  }

  await supabase.from('listings').delete().eq('id', listingId)

  revalidatePath('/admin')
  revalidatePath('/')
}
