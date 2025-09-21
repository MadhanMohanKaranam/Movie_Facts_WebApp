import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type FavoriteMoviePayload = {
  movie?: string;
  tmdbId?: number;
  posterUrl?: string | null;
  backdropUrl?: string | null;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json()) as FavoriteMoviePayload;
  const favoriteMovie = typeof body.movie === "string" ? body.movie.trim() : "";

  if (!favoriteMovie) {
    return NextResponse.json({ error: "Please provide a movie title." }, { status: 400 });
  }

  const tmdbId = Number.isFinite(body.tmdbId) ? Number(body.tmdbId) : null;
  const favoriteMoviePoster = typeof body.posterUrl === "string" ? body.posterUrl.trim() || null : null;
  const favoriteMovieBackdrop =
    typeof body.backdropUrl === "string" ? body.backdropUrl.trim() || null : null;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      favoriteMovie,
      favoriteMovieTmdbId: tmdbId,
      favoriteMoviePoster,
      favoriteMovieBackdrop,
    },
    select: {
      favoriteMovie: true,
      favoriteMovieTmdbId: true,
      favoriteMoviePoster: true,
      favoriteMovieBackdrop: true,
    },
  });

  return NextResponse.json(user);
}
