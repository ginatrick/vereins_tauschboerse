import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/require-admin'
import { ConfirmSubmitButton } from '@/components/ConfirmSubmitButton'
import { toggleUserBlocked, deleteUser } from './actions'

type UserRow = {
  id: string
  email: string
  name: string | null
  role: 'member' | 'admin'
  is_blocked: boolean
  listings: { count: number }[]
}

export default async function AdminUsersPage() {
  const { supabase, user: currentUser } = await requireAdmin()

  const { data: users, error } = await supabase
    .from('profiles')
    .select(
      'id, email, name, role, is_blocked, listings:listings!listings_user_id_fkey ( count )'
    )
    .order('email')
    .returns<UserRow[]>()

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin – Nutzer</h1>
        <Link href="/admin" className="text-sm underline">
          Inserate
        </Link>
      </div>

      {error ? (
        <p className="text-red-600">
          Nutzer konnten nicht geladen werden: {error.message}
        </p>
      ) : !users || users.length === 0 ? (
        <p className="text-gray-600">Keine Nutzer gefunden.</p>
      ) : (
        <ul className="space-y-4">
          {users.map((profile) => {
            const isSelf = profile.id === currentUser.id
            const listingCount = profile.listings[0]?.count ?? 0

            return (
              <li
                key={profile.id}
                className="flex items-start justify-between gap-4 rounded border border-gray-200 p-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {profile.role === 'admin' && (
                      <span className="rounded bg-purple-600 px-2 py-0.5 text-white">
                        Admin
                      </span>
                    )}
                    {profile.is_blocked && (
                      <span className="rounded bg-red-600 px-2 py-0.5 text-white">
                        Gesperrt
                      </span>
                    )}
                    <span className="text-gray-500">
                      {listingCount} Inserat(e)
                    </span>
                  </div>
                  <p className="font-semibold">
                    {profile.name || profile.email}
                  </p>
                  {profile.name && (
                    <p className="text-sm text-gray-600">{profile.email}</p>
                  )}
                </div>
                {!isSelf && (
                  <div className="flex shrink-0 gap-2">
                    <form action={toggleUserBlocked}>
                      <input type="hidden" name="user_id" value={profile.id} />
                      <input
                        type="hidden"
                        name="current"
                        value={String(profile.is_blocked)}
                      />
                      <button
                        type="submit"
                        className="rounded border border-gray-300 px-3 py-2 text-sm"
                      >
                        {profile.is_blocked ? 'Entsperren' : 'Sperren'}
                      </button>
                    </form>
                    <form action={deleteUser}>
                      <input type="hidden" name="user_id" value={profile.id} />
                      <ConfirmSubmitButton
                        confirmMessage={`Nutzer "${profile.email}" wirklich unwiderruflich löschen? Alle seine Inserate werden mitgelöscht.`}
                        className="rounded border border-red-600 px-3 py-2 text-sm text-red-600"
                      >
                        Löschen
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
