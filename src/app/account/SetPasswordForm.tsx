'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { setPassword, type PasswordFormState } from './actions'

const initialState: PasswordFormState = {}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
    >
      {pending ? 'Wird gespeichert…' : 'Speichern'}
    </button>
  )
}

export function SetPasswordForm() {
  const [state, formAction] = useActionState(setPassword, initialState)

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Neues Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="password_confirm" className="block text-sm font-medium">
          Passwort bestätigen
        </label>
        <input
          id="password_confirm"
          name="password_confirm"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
      {state.error && <p className="text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-green-600">Passwort gespeichert.</p>
      )}
      <SubmitButton />
    </form>
  )
}
