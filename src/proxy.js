import { NextResponse } from "next/server"

// Przekierowuje na /login gdy nie ma ciasteczka z sesja (role sprawdza requireRole)
export function proxy(request) {
  if (!request.cookies.has("pb_auth")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/user/:path*", "/technician/:path*", "/admin/:path*"],
}
