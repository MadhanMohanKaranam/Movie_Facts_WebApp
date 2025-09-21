import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        token.picture = user.image ?? token.picture ?? null;
        token.favoriteMovie = user.favoriteMovie ?? null;
        token.favoriteMovieTmdbId = user.favoriteMovieTmdbId ?? null;
        token.favoriteMoviePoster = user.favoriteMoviePoster ?? null;
        token.favoriteMovieBackdrop = user.favoriteMovieBackdrop ?? null;
      }

      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      if (trigger === "update" && session?.user) {
        token.favoriteMovie = session.user.favoriteMovie ?? token.favoriteMovie ?? null;
        token.favoriteMovieTmdbId =
          (session.user.favoriteMovieTmdbId as number | null | undefined) ?? token.favoriteMovieTmdbId ?? null;
        token.favoriteMoviePoster =
          session.user.favoriteMoviePoster ?? (token.favoriteMoviePoster as string | null) ?? null;
        token.favoriteMovieBackdrop =
          session.user.favoriteMovieBackdrop ?? (token.favoriteMovieBackdrop as string | null) ?? null;
        if (session.user.image) {
          token.picture = session.user.image;
        }
        if (session.user.name) {
          token.name = session.user.name;
        }
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            favoriteMovie: true,
            favoriteMovieTmdbId: true,
            favoriteMoviePoster: true,
            favoriteMovieBackdrop: true,
            image: true,
            name: true,
            email: true,
          },
        });

        if (dbUser) {
          token.favoriteMovie = dbUser.favoriteMovie ?? token.favoriteMovie ?? null;
          token.favoriteMovieTmdbId = dbUser.favoriteMovieTmdbId ?? token.favoriteMovieTmdbId ?? null;
          token.favoriteMoviePoster = dbUser.favoriteMoviePoster ?? token.favoriteMoviePoster ?? null;
          token.favoriteMovieBackdrop = dbUser.favoriteMovieBackdrop ?? token.favoriteMovieBackdrop ?? null;
          token.picture = dbUser.image ?? token.picture ?? null;
          token.name = dbUser.name ?? token.name;
          token.email = dbUser.email ?? token.email;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id;
        session.user.email = (token.email as string | null) ?? session.user.email;
        session.user.name = (token.name as string | null) ?? session.user.name;
        session.user.image = (token.picture as string | null) ?? session.user.image ?? null;
        session.user.favoriteMovie = (token.favoriteMovie as string | null) ?? null;
        session.user.favoriteMovieTmdbId =
          typeof token.favoriteMovieTmdbId === "number" ? token.favoriteMovieTmdbId : null;
        session.user.favoriteMoviePoster = (token.favoriteMoviePoster as string | null) ?? null;
        session.user.favoriteMovieBackdrop = (token.favoriteMovieBackdrop as string | null) ?? null;
      }
      return session;
    },
    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
