import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SetPasswordForm } from './SetPasswordForm'

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold">Mein Konto</h1>
      <p className="mb-6 text-sm text-gray-600">Angemeldet als {user.email}</p>

      <h2 className="mb-3 text-lg font-medium">Passwort festlegen/ändern</h2>
      <p className="mb-4 text-sm text-gray-600">
        Damit kannst du dich künftig auch direkt mit E-Mail und Passwort
        anmelden, ohne jedes Mal auf den Anmelde-Link in deiner E-Mail zu
        warten.
      </p>
      <SetPasswordForm />
    </main>
  )
}
