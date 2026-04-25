import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write to request so downstream Server Components see the fresh token
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Recreate response with updated request
          supabaseResponse = NextResponse.next({ request })
          // Write to response so the browser stores the refreshed token
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: getUser() is required to trigger session token refresh.
  // Never skip this call — it is what keeps sessions alive.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // AUTH GUARDS DISABLED FOR DEMO — re-enable before production
  void user

  return supabaseResponse
}
