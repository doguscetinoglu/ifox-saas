import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('ifox_session')?.value
  const session = await decrypt(token)

  if (pathname.startsWith('/admin')) {
    if (!session?.userId || session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/giris', request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/panel')) {
    if (!session?.userId) {
      return NextResponse.redirect(new URL('/giris', request.url))
    }
    if (session.status === 'SUSPENDED') {
      return NextResponse.redirect(new URL('/giris?suspended=1', request.url))
    }
    return NextResponse.next()
  }

  if (pathname === '/giris' || pathname === '/kayit') {
    if (session?.userId) {
      if (session.role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url))
      return NextResponse.redirect(new URL('/panel', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
}
