import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // createBrowserClient is a singleton by default — safe to call multiple times
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
