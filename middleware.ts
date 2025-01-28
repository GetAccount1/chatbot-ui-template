// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAuth } from './lib/auth'

export async function middleware(request: NextRequest) {
  // Protected routes
  const protectedPaths = ['/chat', '/admin']
  const path = request.nextUrl.pathname

  if (protectedPaths.some(prefix => path.startsWith(prefix))) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const user = await verifyAuth(token)
      
      // Admin route protection
      if (path.startsWith('/admin') && (!user || user.role !== 'owner')) {
        return NextResponse.redirect(new URL('/', request.url))
      }
      
      return NextResponse.next()
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/chat/:path*', '/admin/:path*']
}