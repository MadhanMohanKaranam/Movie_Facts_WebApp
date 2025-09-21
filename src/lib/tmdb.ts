const TMDB_API_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

type TmdbMovieResult = {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string | null;
  original_language?: string | null;
};

type FetchOptions = {
  path: string;
  searchParams?: Record<string, string | number | undefined>;
};

type RecommendationInput = {
  title: string;
  tmdbId?: number | null;
  limit?: number;
};

type SimplifiedMovie = {
  id: number;
  title: string;
  releaseYear?: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  overview?: string | null;
};

function getApiKey() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not configured.");
  }
  return apiKey;
}

function buildImageUrl(path: string | null | undefined, size: "w500" | "w780" | "original" = "w500") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

async function fetchFromTmdb<T>({ path, searchParams = {} }: FetchOptions): Promise<T> {
  const apiKey = getApiKey();
  const url = new URL(`${TMDB_API_BASE}${path}`);

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  const headers: Record<string, string> = {};
  if (apiKey.startsWith("Bearer ")) {
    headers.Authorization = apiKey;
  } else {
    url.searchParams.set("api_key", apiKey);
  }

  const response = await fetch(url, {
    headers,
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message =
      (payload as { status_message?: string }).status_message ??
      response.statusText ??
      "TMDB request failed.";
    throw new Error(message);
  }

  return (await response.json()) as T;
}

function simplifyMovie(result: TmdbMovieResult): SimplifiedMovie {
  const title = result.title ?? result.name ?? "Untitled";
  const releaseYear = result.release_date?.slice(0, 4);
  return {
    id: result.id,
    title,
    releaseYear,
    posterUrl: buildImageUrl(result.poster_path, "w500"),
    backdropUrl: buildImageUrl(result.backdrop_path, "w780"),
    overview: result.overview ?? undefined,
  };
}

async function resolveMovieIdByTitle(title: string): Promise<SimplifiedMovie | null> {
  if (!title.trim()) return null;
  try {
    const data = await fetchFromTmdb<{ results?: TmdbMovieResult[] }>({
      path: "/search/movie",
      searchParams: {
        query: title,
        language: "en-US",
        include_adult: "false",
        page: 1,
      },
    });
    const first = data.results?.[0];
    return first ? simplifyMovie(first) : null;
  } catch (error) {
    console.error("TMDB search error", error);
    return null;
  }
}

export async function getRecommendedMovies({ title, tmdbId, limit = 12 }: RecommendationInput): Promise<SimplifiedMovie[]> {
  if (!title.trim() && !tmdbId) {
    return [];
  }

  let baseMovie: SimplifiedMovie | null = null;

  if (tmdbId) {
    try {
      const data = await fetchFromTmdb<TmdbMovieResult>({ path: `/movie/${tmdbId}` });
      baseMovie = simplifyMovie(data);
    } catch (error) {
      console.error("TMDB movie lookup error", error);
    }
  }

  if (!baseMovie) {
    baseMovie = await resolveMovieIdByTitle(title);
  }

  if (!baseMovie) {
    return [];
  }

  const paths = [`/movie/${baseMovie.id}/recommendations`, `/movie/${baseMovie.id}/similar`];
  const collected = new Map<number, SimplifiedMovie>();

  for (const path of paths) {
    try {
      const data = await fetchFromTmdb<{ results?: TmdbMovieResult[] }>({
        path,
        searchParams: {
          language: "en-US",
          page: 1,
        },
      });

      for (const item of data.results ?? []) {
        if (!item?.id || item.id === baseMovie.id) continue;
        if (collected.has(item.id)) continue;
        collected.set(item.id, simplifyMovie(item));
        if (collected.size >= limit) break;
      }
    } catch (error) {
      console.error("TMDB recommendations error", { path, error });
    }

    if (collected.size >= limit) {
      break;
    }
  }

  return Array.from(collected.values()).slice(0, limit);
}

export type RecommendedMovie = SimplifiedMovie;
