import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('ifox_session')?.value
  const session = await decrypt(token)

  // Admin routes: require ADMIN role
  if (pathname.startsWith('/admin')) {
    if (!session?.userId || session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/giris', request.url))
    }
    return NextResponse.next()
  }

  // Panel routes: require ACTIVE status
  if (pathname.startsWith('/panel')) {
    if (!session?.userId) {
      return NextResponse.redirect(new URL('/giris', request.url))
    }
    if (session.status === 'PENDING') {
      return NextResponse.redirect(new URL('/odeme', request.url))
    }
    if (session.status === 'SUSPENDED') {
      return NextResponse.redirect(new URL('/giris?suspended=1', request.url))
    }
    // EMPLOYEE can only access /panel/mesajlar
    if (session.role === 'EMPLOYEE' && !pathname.startsWith('/panel/mesajlar')) {
      return NextResponse.redirect(new URL('/panel/mesajlar', request.url))
    }
    return NextResponse.next()
  }

  // /odeme: only accessible if authenticated but PENDING
  if (pathname === '/odeme') {
    if (!session?.userId) {
      return NextResponse.redirect(new URL('/giris', request.url))
    }
    if (session.status === 'ACTIVE') {
      return NextResponse.redirect(new URL('/panel', request.url))
    }
    return NextResponse.next()
  }

  // Auth pages: redirect to panel if already active
  if (pathname === '/giris' || pathname === '/kayit') {
    if (session?.userId && session.status === 'ACTIVE') {
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
