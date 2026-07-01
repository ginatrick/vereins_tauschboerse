'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
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

  return { supabase, user }
}

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
