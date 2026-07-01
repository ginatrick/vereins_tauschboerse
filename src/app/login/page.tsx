'use client'

import { Suspense, useActionState, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  signInWithPassword,
  verifyEmailOtp,
  type AuthFormState,
} from './actions'

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
  const [otpState, otpAction] = useActionState(verifyEmailOtp, initialState)

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
            <div className="space-y-4">
              <p className="text-center">
                Check deine E-Mails – wir haben dir einen Anmelde-Link
                geschickt.
              </p>
              <div className="border-t border-gray-200 pt-4">
                <p className="mb-2 text-sm text-gray-600">
                  Funktioniert der Link nicht (z.B. weil du ihn in einer
                  anderen App als hier geöffnet hast)? In derselben E-Mail
                  steht auch ein Code zum Eintippen:
                </p>
                <form action={otpAction} className="space-y-3">
                  <input type="hidden" name="email" value={email} />
                  <input
                    type="text"
                    name="token"
                    inputMode="numeric"
                    placeholder="123456"
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                  <button
                    type="submit"
                    className="w-full rounded bg-black px-3 py-2 text-white"
                  >
                    Code bestätigen
                  </button>
                  {otpState.error && (
                    <p className="text-red-600">{otpState.error}</p>
                  )}
                </form>
              </div>
            </div>
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
