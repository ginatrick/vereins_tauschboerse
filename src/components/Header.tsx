import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="FC Steinbach-Hallenberg"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="font-semibold">Tauschbörse</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {isAdmin && (
            <Link href="/admin" className="underline">
              Admin
            </Link>
          )}
          {user && (
            <Link href="/listings/mine" className="underline">
              Meine Inserate
            </Link>
          )}
          {user && (
            <Link href="/account" className="underline">
              Konto
            </Link>
          )}
          <Link
            href="/listings/new"
            className="rounded bg-black px-3 py-1.5 text-white"
          >
            + Neues Inserat
          </Link>
          {user ? (
            <form action={signOut}>
              <button type="submit" className="underline">
                Abmelden
              </button>
            </form>
          ) : (
            <Link href="/login" className="underline">
              Anmelden
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
