'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const MAX_IMAGES = 5
const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // 4 MB
const VALID_TYPES = ['angebot', 'gesuch']
const VALID_CONDITIONS = ['neu', 'gut', 'gebraucht']

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

  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const type = String(formData.get('type') ?? '')
  const categoryId = Number(formData.get('category_id'))
  const condition = String(formData.get('condition') ?? '').trim() || null
  const size = String(formData.get('size') ?? '').trim() || null
  const price = String(formData.get('price') ?? '').trim() || null

  if (!title || title.length > 120) {
    return { error: 'Bitte einen Titel angeben (max. 120 Zeichen).' }
  }
  if (!VALID_TYPES.includes(type)) {
    return { error: 'Bitte „Angebot" oder „Gesuch" auswählen.' }
  }
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { error: 'Bitte eine Kategorie auswählen.' }
  }
  if (condition && !VALID_CONDITIONS.includes(condition)) {
    return { error: 'Ungültiger Zustand.' }
  }

  const images = formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)

  if (images.length > MAX_IMAGES) {
    return { error: `Bitte höchstens ${MAX_IMAGES} Bilder hochladen.` }
  }
  for (const image of images) {
    if (!image.type.startsWith('image/')) {
      return { error: `„${image.name}" ist kein Bild.` }
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return { error: `„${image.name}" ist größer als 4 MB.` }
    }
  }

  const { data: listing, error: insertError } = await supabase
    .from('listings')
    .insert({
      user_id: user.id,
      category_id: categoryId,
      title,
      description: description || null,
      type,
      condition,
      size,
      price,
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
