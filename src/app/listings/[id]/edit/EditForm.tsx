'use client'

import { useActionState, useState, type ChangeEvent } from 'react'
import { useFormStatus } from 'react-dom'
import { updateListing, type ListingFormState } from './actions'
import { getSizeOptionsForSlug } from '@/lib/listings/validation'

const initialState: ListingFormState = {}

type Category = { id: number; name: string; slug: string }
type ExistingImage = { id: number; url: string | null }

type Listing = {
  id: number
  title: string
  description: string | null
  type: 'angebot' | 'gesuch'
  category_id: number
  condition: string | null
  size: string | null
  price: string | null
  phone: string | null
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-50"
    >
      {pending ? 'Wird gespeichert…' : 'Änderungen speichern'}
    </button>
  )
}

export function EditForm({
  listing,
  categories,
  images,
}: {
  listing: Listing
  categories: Category[]
  images: ExistingImage[]
}) {
  const updateListingWithId = updateListing.bind(null, listing.id)
  const [state, formAction] = useActionState(updateListingWithId, initialState)
  const [removedIds, setRemovedIds] = useState<number[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [categoryId, setCategoryId] = useState(String(listing.category_id))

  function toggleRemove(id: number) {
    setRemovedIds((prev) =>
      prev.includes(id) ? prev.filter((existingId) => existingId !== id) : [...prev, id]
    )
  }

  function handleFilesChange(e: ChangeEvent<HTMLInputElement>) {
    previews.forEach((url) => URL.revokeObjectURL(url))
    const files = Array.from(e.target.files ?? [])
    setPreviews(files.map((file) => URL.createObjectURL(file)))
  }

  const selectedCategory = categories.find(
    (category) => String(category.id) === categoryId
  )
  const sizeOptions = getSizeOptionsForSlug(selectedCategory?.slug)
  const sizeDefault =
    categoryId === String(listing.category_id) ? listing.size ?? '' : ''

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Titel *
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={120}
          defaultValue={listing.title}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium">
          Art *
        </label>
        <select
          id="type"
          name="type"
          required
          defaultValue={listing.type}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="angebot">Angebot</option>
          <option value="gesuch">Gesuch</option>
        </select>
      </div>

      <div>
        <label htmlFor="category_id" className="block text-sm font-medium">
          Kategorie *
        </label>
        <select
          id="category_id"
          name="category_id"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Beschreibung
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={listing.description ?? ''}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="condition" className="block text-sm font-medium">
            Zustand
          </label>
          <select
            id="condition"
            name="condition"
            defaultValue={listing.condition ?? ''}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="">–</option>
            <option value="neu">Neu</option>
            <option value="gut">Gut</option>
            <option value="gebraucht">Gebraucht</option>
          </select>
        </div>
        <div>
          <label htmlFor="size" className="block text-sm font-medium">
            Größe
          </label>
          <select
            key={categoryId}
            id="size"
            name="size"
            disabled={sizeOptions.length === 0}
            defaultValue={sizeDefault}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">–</option>
            {sizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium">
          Preis
        </label>
        <input
          id="price"
          name="price"
          defaultValue={listing.price ?? ''}
          placeholder="z.B. 10 EUR, VB, gegen Spende"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium">
          Handynummer (optional)
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={listing.phone ?? ''}
          placeholder="z.B. 0151 23456789"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      {images.length > 0 && (
        <div>
          <p className="block text-sm font-medium">Vorhandene Bilder</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {images.map((image) => (
              <label key={image.id} className="relative cursor-pointer">
                <input
                  type="checkbox"
                  name="remove_images"
                  value={image.id}
                  checked={removedIds.includes(image.id)}
                  onChange={() => toggleRemove(image.id)}
                  className="absolute right-1 top-1 z-10 h-4 w-4"
                />
                {image.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.url}
                    alt=""
                    className={`h-20 w-20 rounded object-cover ${
                      removedIds.includes(image.id) ? 'opacity-30' : ''
                    }`}
                  />
                )}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Zum Löschen ankreuzen
          </p>
        </div>
      )}

      <div>
        <label htmlFor="images" className="block text-sm font-medium">
          Neue Bilder hinzufügen (insgesamt max. 5, je max. 4 MB)
        </label>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesChange}
          className="mt-1 w-full text-sm"
        />
        {previews.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {previews.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt=""
                className="h-20 w-20 rounded object-cover"
              />
            ))}
          </div>
        )}
      </div>

      {state.error && <p className="text-red-600">{state.error}</p>}

      <SubmitButton />
    </form>
  )
}
