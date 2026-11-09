import { NextResponse } from "next/server"

// Szybki filtr przed renderowaniem: brak ciasteczka sesji -> /login.
// Nie weryfikuje tokenu ani roli - to robi requireRole() w lib/pocketbase.js.
export function proxy(request) {
  if (!request.cookies.has("pb_auth")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/user/:path*", "/technician/:path*", "/admin/:path*"],
}
