'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function deleteListing(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const listingId = Number(formData.get('listing_id'))

  const { data: images } = await supabase
    .from('listing_images')
    .select('storage_path')
    .eq('listing_id', listingId)

  const paths = (images ?? []).map((image) => image.storage_path)
  if (paths.length > 0) {
    await supabase.storage.from('listing-images').remove(paths)
  }

  await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('user_id', user.id)

  revalidatePath('/listings/mine')
  revalidatePath('/')
}

export async function toggleReserved(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const listingId = Number(formData.get('listing_id'))
  const current = formData.get('current') === 'true'

  await supabase
    .from('listings')
    .update({ is_reserved: !current })
    .eq('id', listingId)
    .eq('user_id', user.id)

  revalidatePath('/listings/mine')
  revalidatePath('/')
}
