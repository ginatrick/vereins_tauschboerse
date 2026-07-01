'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  parseListingFields,
  validateListingFields,
  validateImages,
} from '@/lib/listings/validation'

export type ListingFormState = {
  error?: string
}

export async function createListing(
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

  const images = formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)

  const imageError = validateImages(images)
  if (imageError) {
    return { error: imageError }
  }

  const { data: listing, error: insertError } = await supabase
    .from('listings')
    .insert({
      user_id: user.id,
      category_id: fields.categoryId,
      title: fields.title,
      description: fields.description,
      type: fields.type,
      condition: fields.condition,
      size: fields.size,
      price: fields.price,
      phone: fields.phone,
    })
    .select('id')
    .single()

  if (insertError || !listing) {
    return { error: 'Inserat konnte nicht gespeichert werden. Bitte versuche es erneut.' }
  }

  const uploadedPaths: string[] = []

  for (const [index, image] of images.entries()) {
    const extension = image.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${user.id}/${listing.id}/${index}-${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(path, image, { contentType: image.type })

    if (uploadError) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from('listing-images').remove(uploadedPaths)
      }
      await supabase.from('listings').delete().eq('id', listing.id)
      return { error: 'Bild-Upload fehlgeschlagen. Bitte versuche es erneut.' }
    }

    uploadedPaths.push(path)

    await supabase.from('listing_images').insert({
      listing_id: listing.id,
      storage_path: path,
      sort_order: index,
    })
  }

  redirect('/listings/new/erfolg')
}
