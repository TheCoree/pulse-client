import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value

  const { pathname } = request.nextUrl
  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')

  // 🔐 НЕ авторизован → только login / register
  if (!refreshToken && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 🔐 авторизован → нельзя на login / register
  if (refreshToken && isAuthPage) {
    return NextResponse.redirect(new URL('/calendars', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
