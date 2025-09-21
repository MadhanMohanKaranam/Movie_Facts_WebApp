import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const LOGIN_PATH = "/login";
const FAVORITE_MOVIE_PATH = "/favorite-movie";
const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = Boolean(token);
  const hasFavoriteMovie = Boolean(token?.favoriteMovie);
  const isLoginRoute = pathname === LOGIN_PATH;
  const isFavoriteMovieRoute = pathname === FAVORITE_MOVIE_PATH;

  if (!isAuthenticated) {
    if (isLoginRoute) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (isLoginRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!hasFavoriteMovie && !isFavoriteMovieRoute) {
    return NextResponse.redirect(new URL(FAVORITE_MOVIE_PATH, request.url));
  }

  if (hasFavoriteMovie && isFavoriteMovieRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|api).*)"],
};
