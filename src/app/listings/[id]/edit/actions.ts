'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  parseListingFields,
  validateListingFields,
  validateImages,
  MAX_IMAGES,
} from '@/lib/listings/validation'

export type ListingFormState = {
  error?: string
}

type ExistingListing = {
  id: number
  user_id: string
  listing_images: { id: number; storage_path: string; sort_order: number }[]
}

export async function updateListing(
  listingId: number,
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: existing } = await supabase
    .from('listings')
    .select('id, user_id, listing_images ( id, storage_path, sort_order )')
    .eq('id', listingId)
    .single()
    .returns<ExistingListing>()

  if (!existing || existing.user_id !== user.id) {
    return { error: 'Inserat nicht gefunden.' }
  }

  const fields = parseListingFields(formData)

  const { data: category } = await supabase
    .from('categories')
    .select('slug')
    .eq('id', fields.categoryId)
    .single()

  const fieldError = validateListingFields(fields, category?.slug ?? null)
  if (fieldError) {
    return { error: fieldError }
  }

  const removeIds = formData.getAll('remove_images').map((value) => Number(value))
  const keptImages = existing.listing_images.filter(
    (image) => !removeIds.includes(image.id)
  )

  const newImages = formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)

  if (keptImages.length + newImages.length > MAX_IMAGES) {
    return { error: `Insgesamt höchstens ${MAX_IMAGES} Bilder erlaubt.` }
  }

  const imageError = validateImages(newImages)
  if (imageError) {
    return { error: imageError }
  }

  const imagesToRemove = existing.listing_images.filter((image) =>
    removeIds.includes(image.id)
  )
  if (imagesToRemove.length > 0) {
    await supabase.storage
      .from('listing-images')
      .remove(imagesToRemove.map((image) => image.storage_path))
    await supabase
      .from('listing_images')
      .delete()
      .in(
        'id',
        imagesToRemove.map((image) => image.id)
      )
  }

  const { error: updateError } = await supabase
    .from('listings')
    .update({
      category_id: fields.categoryId,
      title: fields.title,
      description: fields.description,
      type: fields.type,
      condition: fields.condition,
      size: fields.size,
      price: fields.price,
      phone: fields.phone,
    })
    .eq('id', listingId)
    .eq('user_id', user.id)

  if (updateError) {
    return { error: 'Inserat konnte nicht aktualisiert werden.' }
  }

  let nextSortOrder =
    keptImages.reduce((max, image) => Math.max(max, image.sort_order), -1) + 1

  for (const image of newImages) {
    const extension = image.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${user.id}/${listingId}/${nextSortOrder}-${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(path, image, { contentType: image.type })

    if (uploadError) {
      continue
    }

    await supabase.from('listing_images').insert({
      listing_id: listingId,
      storage_path: path,
      sort_order: nextSortOrder,
    })

    nextSortOrder += 1
  }

  redirect('/listings/mine')
}
