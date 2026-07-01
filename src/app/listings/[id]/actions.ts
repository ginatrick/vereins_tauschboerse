'use server'

import { createClient } from '@/lib/supabase/server'

export async function revealPhone(listingId: number): Promise<string | null> {
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('phone')
    .eq('id', listingId)
    .single()

  return listing?.phone ?? null
}
