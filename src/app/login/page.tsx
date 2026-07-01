'use client'

import { Suspense, useActionState, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signInWithPassword, type AuthFormState } from './actions'

const initialState: AuthFormState = {}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'magic' | 'password'>('magic')

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [magicError, setMagicError] = useState(searchParams.get('error') ?? '')

  const [passwordState, passwordAction] = useActionState(
    signInWithPassword,
    initialState
  )

  const handleMagicLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMagicError('')
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMagicError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold">Anmelden</h1>

        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMode('magic')}
            className={`rounded px-3 py-1.5 ${
              mode === 'magic' ? 'bg-black text-white' : 'border border-gray-300'
            }`}
          >
            Anmelde-Link
          </button>
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`rounded px-3 py-1.5 ${
              mode === 'password' ? 'bg-black text-white' : 'border border-gray-300'
            }`}
          >
            Passwort
          </button>
        </div>

        {mode === 'magic' ? (
          sent ? (
            <p className="text-center">
              Check deine E-Mails – wir haben dir einen Anmelde-Link geschickt.
            </p>
          ) : (
            <form onSubmit={handleMagicLogin} className="space-y-4">
              <input
                type="email"
                placeholder="deine@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded border border-gray-300 px-3 py-2"
              />
              <button
                type="submit"
                className="w-full rounded bg-black px-3 py-2 text-white"
              >
                Link zusenden
              </button>
              {magicError && <p className="text-red-600">{magicError}</p>}
            </form>
          )
        ) : (
          <form action={passwordAction} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="deine@email.de"
              required
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
            <input
              type="password"
              name="password"
              placeholder="Passwort"
              required
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
            <button
              type="submit"
              className="w-full rounded bg-black px-3 py-2 text-white"
            >
              Anmelden
            </button>
            {passwordState.error && (
              <p className="text-red-600">{passwordState.error}</p>
            )}
            <p className="text-sm text-gray-500">
              Noch kein Passwort gesetzt? Melde dich per Anmelde-Link an und
              richte eines unter „Konto&quot; ein.
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
