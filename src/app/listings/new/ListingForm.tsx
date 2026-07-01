'use client'

import { useActionState, useState, type ChangeEvent } from 'react'
import { useFormStatus } from 'react-dom'
import { createListing, type ListingFormState } from './actions'

const initialState: ListingFormState = {}

type Category = { id: number; name: string }

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded bg-black px-3 py-2 text-white disabled:opacity-50"
    >
      {pending ? 'Wird gespeichert…' : 'Inserat einreichen'}
    </button>
  )
}

export function ListingForm({ categories }: { categories: Category[] }) {
  const [state, formAction] = useActionState(createListing, initialState)
  const [previews, setPreviews] = useState<string[]>([])

  function handleFilesChange(e: ChangeEvent<HTMLInputElement>) {
    previews.forEach((url) => URL.revokeObjectURL(url))
    const files = Array.from(e.target.files ?? [])
    setPreviews(files.map((file) => URL.createObjectURL(file)))
  }

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
          defaultValue=""
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="" disabled>
            Bitte wählen
          </option>
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
          defaultValue=""
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="" disabled>
            Bitte wählen
          </option>
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
            defaultValue=""
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
          <input
            id="size"
            name="size"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium">
          Preis
        </label>
        <input
          id="price"
          name="price"
          placeholder="z.B. 10 EUR, VB, gegen Spende"
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="images" className="block text-sm font-medium">
          Bilder (max. 5, je max. 4 MB)
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
