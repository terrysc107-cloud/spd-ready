import { NextResponse } from 'next/server'

/**
 * Demo mode: no Supabase auth codes to exchange.
 * Just redirect to login if someone lands here directly.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get('next') ?? '/student/dashboard'
  return NextResponse.redirect(`${origin}${next}`)
}
