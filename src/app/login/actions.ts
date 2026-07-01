'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthFormState = {
  error?: string
}

export async function signInWithPassword(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Bitte E-Mail und Passwort angeben.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'E-Mail oder Passwort ist falsch.' }
  }

  redirect('/')
}

export async function verifyEmailOtp(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim()
  const token = String(formData.get('token') ?? '').trim()

  if (!email || !token) {
    return { error: 'Bitte E-Mail und Code angeben.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    return { error: 'Der Code ist ungültig oder abgelaufen.' }
  }

  redirect('/')
}
