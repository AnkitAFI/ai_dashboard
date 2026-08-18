import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that should never be protected
const publicRoutes = ["/login", "/signup", "/verify-email"];

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Exclude public routes safely (supports nested paths)
  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }

  // 2. Adaptable Session Cookie
  // Name to be finalized during backend integration
  const sessionCookieName = process.env.SESSION_COOKIE_NAME || "session_id";
  const sessionCookie = request.cookies.get(sessionCookieName);

  // If there's no session cookie, redirect to login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// 3. Clean Matcher Architecture
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/explorer/:path*",
    "/seller/:path*",
    "/admin-dashboard/:path*",
    "/admin/:path*",
    "/about",
    "/categories/:path*",
    "/category-products/:path*",
    "/keyword-intelligence/:path*",
    "/order-history/:path*",
    "/overview/:path*",
    "/product/:path*",
    "/product-tracker/:path*",
    "/sales/:path*",
    "/sentiment-analysis/:path*",
    "/settings/:path*",
    "/share-of-voice/:path*",
    "/subscription/:path*",
  ],
};
