'use client'

import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton'

export function DeleteButton() {
  return (
    <ConfirmSubmitButton
      confirmMessage="Inserat wirklich unwiderruflich löschen?"
      className="w-full rounded border border-red-600 px-3 py-2 text-sm text-red-600"
    >
      Löschen
    </ConfirmSubmitButton>
  )
}
