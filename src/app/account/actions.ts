'use server'

import { createClient } from '@/lib/supabase/server'

export type PasswordFormState = {
  error?: string
  success?: boolean
}

export async function setPassword(
  _prevState: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Bitte zuerst anmelden.' }
  }

  const password = String(formData.get('password') ?? '')
  const passwordConfirm = String(formData.get('password_confirm') ?? '')

  if (password.length < 8) {
    return { error: 'Das Passwort muss mindestens 8 Zeichen lang sein.' }
  }
  if (password !== passwordConfirm) {
    return { error: 'Die Passwörter stimmen nicht überein.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: `Passwort konnte nicht gespeichert werden: ${error.message}` }
  }

  return { success: true }
}
