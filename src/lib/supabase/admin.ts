import { createClient } from '@supabase/supabase-js'

/**
 * Service-role client that bypasses RLS. Only ever import this from
 * 'use server' actions after an explicit requireAdmin() check — never
 * from a Client Component or a route reachable by non-admins.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
