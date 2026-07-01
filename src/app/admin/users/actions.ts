'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function toggleUserBlocked(formData: FormData) {
  const { supabase, user } = await requireAdmin()
  const targetId = String(formData.get('user_id'))
  const current = formData.get('current') === 'true'

  if (targetId === user.id) {
    return
  }

  await supabase
    .from('profiles')
    .update({ is_blocked: !current })
    .eq('id', targetId)

  revalidatePath('/admin/users')
}

export async function deleteUser(formData: FormData) {
  const { supabase, user } = await requireAdmin()
  const targetId = String(formData.get('user_id'))

  if (targetId === user.id) {
    return
  }

  const { data: listings } = await supabase
    .from('listings')
    .select('id')
    .eq('user_id', targetId)

  const listingIds = (listings ?? []).map((listing) => listing.id)

  if (listingIds.length > 0) {
    const { data: images } = await supabase
      .from('listing_images')
      .select('storage_path')
      .in('listing_id', listingIds)

    const paths = (images ?? []).map((image) => image.storage_path)
    if (paths.length > 0) {
      await supabase.storage.from('listing-images').remove(paths)
    }
  }

  const adminClient = createAdminClient()
  await adminClient.auth.admin.deleteUser(targetId)

  revalidatePath('/admin/users')
  revalidatePath('/admin')
  revalidatePath('/')
}
