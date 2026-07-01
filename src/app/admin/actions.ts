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
