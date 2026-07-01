'use client'

import { useState, useTransition } from 'react'
import { revealPhone } from './actions'

export function PhoneReveal({ listingId }: { listingId: number }) {
  const [phone, setPhone] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleReveal() {
    startTransition(async () => {
      const result = await revealPhone(listingId)
      setPhone(result)
      setRevealed(true)
    })
  }

  if (revealed) {
    if (!phone) {
      return (
        <p className="text-sm text-gray-500">Keine Telefonnummer hinterlegt.</p>
      )
    }
    return (
      <a
        href={`tel:${phone.replace(/\s+/g, '')}`}
        className="rounded border border-black px-4 py-2 text-sm"
      >
        Anrufen ({phone})
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={handleReveal}
      disabled={isPending}
      className="rounded border border-black px-4 py-2 text-sm disabled:opacity-50"
    >
      {isPending ? 'Lade…' : 'Telefonnummer anzeigen'}
    </button>
  )
}
