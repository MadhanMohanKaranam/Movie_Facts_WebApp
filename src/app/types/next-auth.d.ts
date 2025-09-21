import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      favoriteMovie?: string | null;
      favoriteMovieTmdbId?: number | null;
      favoriteMoviePoster?: string | null;
      favoriteMovieBackdrop?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    favoriteMovie?: string | null;
    favoriteMovieTmdbId?: number | null;
    favoriteMoviePoster?: string | null;
    favoriteMovieBackdrop?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    favoriteMovie?: string | null;
    favoriteMovieTmdbId?: number | null;
    favoriteMoviePoster?: string | null;
    favoriteMovieBackdrop?: string | null;
  }
}
