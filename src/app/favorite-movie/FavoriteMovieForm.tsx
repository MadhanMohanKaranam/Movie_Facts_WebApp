"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE = 300;

interface SearchResult {
  id: number;
  title: string;
  releaseYear?: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
}

type Props = {
  initialMovie?: string;
};

export function FavoriteMovieForm({ initialMovie = "" }: Props) {
  const router = useRouter();
  const { update } = useSession();
  const [query, setQuery] = useState(initialMovie);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const effectiveMovie = useMemo(() => {
    if (selected) {
      return selected.releaseYear ? `${selected.title} (${selected.releaseYear})` : selected.title;
    }
    return query.trim();
  }, [query, selected]);

  useEffect(() => {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoadingSearch(true);
      setSearchError(null);

      try {
        const response = await fetch(`/api/search-movies?query=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });

        const data = (await response.json()) as { results?: SearchResult[]; error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to search for movies right now.");
        }

        setResults(data.results ?? []);
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") {
          return;
        }
        const message = error instanceof Error ? error.message : "Unable to search for movies right now.";
        setSearchError(message);
      } finally {
        setLoadingSearch(false);
      }
    }, SEARCH_DEBOUNCE);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    if (!selected) {
      return;
    }

    setQuery(selected.title);
  }, [selected]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const favoriteMovie = effectiveMovie;

    if (!favoriteMovie) {
      setFormError("Please select or enter a movie title.");
      return;
    }

    setSubmitting(true);

    const payload = {
      movie: favoriteMovie,
      tmdbId: selected?.id ?? null,
      posterUrl: selected?.posterUrl ?? null,
      backdropUrl: selected?.backdropUrl ?? null,
    };

    try {
      const response = await fetch("/api/favorite-movie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to save your favorite movie.");
      }

      await update({
        favoriteMovie: data.favoriteMovie ?? favoriteMovie,
        favoriteMovieTmdbId: data.favoriteMovieTmdbId ?? payload.tmdbId ?? undefined,
        favoriteMoviePoster: data.favoriteMoviePoster ?? payload.posterUrl ?? undefined,
        favoriteMovieBackdrop: data.favoriteMovieBackdrop ?? payload.backdropUrl ?? undefined,
      });

      router.replace("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setFormError(message);
    } finally {
        setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-3">
        <label htmlFor="movie" className="text-sm font-semibold uppercase tracking-widest text-red-500">
          Your favorite movie
        </label>
        <input
          id="movie"
          name="movie"
          type="text"
          autoFocus
          placeholder="Search for a movie..."
          className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(null);
          }}
          disabled={submitting}
        />
        <p className="text-xs text-white/60">Start typing to search TMDB. Pick the matching poster or keep your custom title.</p>
      </div>

      {searchError && <p className="text-sm text-red-400">{searchError}</p>}

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
          <span>{loadingSearch ? "Searching..." : "Suggestions"}</span>
          {results.length > 0 && <span className="tracking-normal text-white/40">Click a poster to choose</span>}
        </div>
        <div className="grid max-h-72 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
          {results.map((movie) => {
            const isActive = selected?.id === movie.id;
            return (
              <button
                key={movie.id}
                type="button"
                onClick={() => setSelected(movie)}
                className={`group relative aspect-[2/3] overflow-hidden rounded-xl border transition ${
                  isActive ? "border-red-500 ring-2 ring-red-500" : "border-white/10 hover:border-red-500"
                }`}
                disabled={submitting}
              >
                {movie.posterUrl ? (
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 18vw"
                    className="object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-white/10 text-center text-xs text-white/70">
                    No poster
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-x-2 bottom-2 text-left text-xs font-semibold text-white">
                  <p className="line-clamp-2 leading-tight">{movie.title}</p>
                  {movie.releaseYear && <p className="text-white/70">{movie.releaseYear}</p>}
                </div>
              </button>
            );
          })}

          {!loadingSearch && results.length === 0 && query.trim().length >= MIN_QUERY_LENGTH && !searchError && (
            <div className="col-span-full rounded-xl border border-dashed border-white/10 bg-black/30 p-6 text-center text-sm text-white/70">
              No matches yet. Keep typing or confirm your custom title below.
            </div>
          )}
        </div>
      </div>

      {formError && <p className="text-sm text-red-400">{formError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-red-600 py-3 text-lg font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Saving..." : selected ? `Save "${effectiveMovie}"` : "Save & Continue"}
      </button>
    </form>
  );
}
