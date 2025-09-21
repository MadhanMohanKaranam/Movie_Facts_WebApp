import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { FEATURED_MOVIES } from "@/lib/movies";
import { getRecommendedMovies, type RecommendedMovie } from "@/lib/tmdb";
import { Navbar } from "@/components/Navbar";
import { MovieGrid } from "@/components/MovieGrid";
import { FunFact } from "@/components/FunFact";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.favoriteMovie) {
    redirect("/favorite-movie");
  }

  const favoriteMovie = session.user.favoriteMovie;
  const email = session.user.email ?? "No email on file";
  const favoriteTmdbId = session.user.favoriteMovieTmdbId ?? null;
  const favoriteBackdrop = session.user.favoriteMovieBackdrop ?? null;
  const favoritePoster = session.user.favoriteMoviePoster ?? null;

  let recommended: RecommendedMovie[] = [];

  try {
    recommended = await getRecommendedMovies({
      title: favoriteMovie,
      tmdbId: favoriteTmdbId,
      limit: 12,
    });
  } catch (error) {
    console.error("TMDB recommendation fetch failed", error);
    recommended = [];
  }

  const trendingSource = recommended.length > 0 ? recommended : FEATURED_MOVIES;
  const trendingMovies = trendingSource
    .map((movie) => {
      if ("poster" in movie) {
        return { title: movie.title, poster: movie.poster };
      }
      return { title: movie.title, poster: movie.posterUrl ?? undefined };
    })
    .filter((movie): movie is { title: string; poster: string } => Boolean(movie.poster));

  const heroBackdrop = favoriteBackdrop ?? recommended[0]?.backdropUrl ?? favoritePoster ?? FEATURED_MOVIES[0]?.backdrop;

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage: heroBackdrop
            ? `linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.75) 100%), url(${heroBackdrop})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Navbar
        user={{
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          image: session.user.image ?? null,
        }}
      />

        <section className="relative px-6 pb-12 pt-16 sm:px-12 lg:px-20">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-red-500">Welcome back</p>
            <h1 className="text-4xl font-black sm:text-5xl">
              {session.user.name ? `Welcome, ${session.user.name}` : "Welcome to Movie Facts"}
            </h1>
            <p className="text-base text-white/70">
              Email: <span className="font-semibold text-white">{email}</span>
            </p>
            <p className="text-lg text-white">
              Your favorite movie: <span className="font-semibold text-red-400">{favoriteMovie}</span>
            </p>
          </div>
        </section>
      </div>

      <main className="flex-1 space-y-16 bg-gradient-to-b from-black via-black to-neutral-950 px-6 py-16 sm:px-12 lg:px-20">
        <section className="max-w-3xl">
          <FunFact favoriteMovie={favoriteMovie} />
        </section>

        <section className="space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-bold">
              {recommended.length > 0 ? `Because you liked ${favoriteMovie}` : "Trending Picks"}
            </h2>
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">Powered by TMDB</span>
          </div>
          <MovieGrid movies={trendingMovies.length > 0 ? trendingMovies : FEATURED_MOVIES} />
        </section>
      </main>
    </div>
  );
}


