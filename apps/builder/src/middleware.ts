import { NextRequest, NextResponse } from 'next/server'

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname
  const session =
    !!req.cookies.get('next-auth.session-token') ||
    !!req.cookies.get('__Secure-next-auth.session-token')
  const isApi = url.startsWith('/api')

  const hasResetToken = req.nextUrl.searchParams.has('resetToken')
  const isProfileWithResetToken = url === '/account/profile' && hasResetToken

  const isConfirmPasswordChange = url === '/account/confirm-password-change'
  const isConfirmEmailChange = url === '/account/confirm-email'

  if (!session && !isApi) {
    if (isProfileWithResetToken) {
      const resetToken = req.nextUrl.searchParams.get('resetToken')
      return NextResponse.redirect(new URL(`/reset-password?token=${resetToken}`, req.url))
    }

    // Permitir acceso a confirm-password-change y confirm-email sin sesión
    if (isConfirmPasswordChange || isConfirmEmailChange) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL(`/api/auth/signin?callbackUrl=${url}`, req.url))
  }

  const response = NextResponse.next()

  if (isApi) {
    const origin = req.headers.get('origin') || req.headers.get('referer') || req.nextUrl.origin

    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers })
    }
  }

  return response
}

export const config = {
  matcher: ['/api/:path*', '/dashboard', '/bots(.*)', '/account(.*)', '/workspace(.*)'],
}
