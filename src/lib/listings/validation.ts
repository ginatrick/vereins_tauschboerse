export const MAX_IMAGES = 5
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // 4 MB
export const VALID_TYPES = ['angebot', 'gesuch']
export const VALID_CONDITIONS = ['neu', 'gut', 'gebraucht']

export const SHOE_SIZES = Array.from({ length: 48 - 29 + 1 }, (_, i) =>
  String(29 + i)
)

export const CLOTHING_SIZES = [
  '50/56',
  '62/68',
  '74/80',
  '86/92',
  '98/104',
  '110/116',
  '122/128',
  '134/140',
  '146/152',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL',
]

const CLOTHING_SIZE_CATEGORY_SLUGS = ['trikots', 'sonstiges']

export function getSizeOptionsForSlug(slug: string | null | undefined): string[] {
  if (slug === 'schuhe') {
    return SHOE_SIZES
  }
  if (slug && CLOTHING_SIZE_CATEGORY_SLUGS.includes(slug)) {
    return CLOTHING_SIZES
  }
  return []
}

export type ListingFields = {
  title: string
  description: string | null
  type: string
  categoryId: number
  condition: string | null
  size: string | null
  price: string | null
  phone: string | null
}

export function parseListingFields(formData: FormData): ListingFields {
  return {
    title: String(formData.get('title') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim() || null,
    type: String(formData.get('type') ?? ''),
    categoryId: Number(formData.get('category_id')),
    condition: String(formData.get('condition') ?? '').trim() || null,
    size: String(formData.get('size') ?? '').trim() || null,
    price: String(formData.get('price') ?? '').trim() || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
  }
}

export function validateListingFields(
  fields: ListingFields,
  categorySlug: string | null
): string | null {
  if (!fields.title || fields.title.length > 120) {
    return 'Bitte einen Titel angeben (max. 120 Zeichen).'
  }
  if (!VALID_TYPES.includes(fields.type)) {
    return 'Bitte „Angebot" oder „Gesuch" auswählen.'
  }
  if (!Number.isInteger(fields.categoryId) || fields.categoryId <= 0 || !categorySlug) {
    return 'Bitte eine Kategorie auswählen.'
  }
  if (fields.condition && !VALID_CONDITIONS.includes(fields.condition)) {
    return 'Ungültiger Zustand.'
  }
  if (
    fields.size &&
    !getSizeOptionsForSlug(categorySlug).includes(fields.size)
  ) {
    return 'Ungültige Größe für diese Kategorie.'
  }
  if (fields.phone && !/^[0-9+\-/() ]{5,30}$/.test(fields.phone)) {
    return 'Bitte eine gültige Handynummer angeben.'
  }
  return null
}

export function validateImages(images: File[]): string | null {
  if (images.length > MAX_IMAGES) {
    return `Bitte höchstens ${MAX_IMAGES} Bilder hochladen.`
  }
  for (const image of images) {
    if (!image.type.startsWith('image/')) {
      return `„${image.name}" ist kein Bild.`
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return `„${image.name}" ist größer als 4 MB.`
    }
  }
  return null
}
