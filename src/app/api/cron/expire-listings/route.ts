import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { LISTING_LIFETIME_DAYS } from '@/lib/listings/expiry'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createAdminClient()
  const cutoff = new Date(
    Date.now() - LISTING_LIFETIME_DAYS * 24 * 60 * 60 * 1000
  ).toISOString()

  const { data: expired, error: selectError } = await supabase
    .from('listings')
    .select('id')
    .lt('created_at', cutoff)

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 })
  }

  const listingIds = (expired ?? []).map((listing) => listing.id)

  if (listingIds.length === 0) {
    return NextResponse.json({ deleted: 0 })
  }

  const { data: images } = await supabase
    .from('listing_images')
    .select('storage_path')
    .in('listing_id', listingIds)

  const paths = (images ?? []).map((image) => image.storage_path)
  if (paths.length > 0) {
    await supabase.storage.from('listing-images').remove(paths)
  }

  const { error: deleteError } = await supabase
    .from('listings')
    .delete()
    .in('id', listingIds)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: listingIds.length })
}
