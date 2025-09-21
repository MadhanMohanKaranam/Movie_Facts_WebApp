import { NextResponse } from "next/server";

const TMDB_SEARCH_ENDPOINT = "https://api.themoviedb.org/3/search/movie";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function buildRequestUrl(query: string, apiKey: string) {
  const url = new URL(TMDB_SEARCH_ENDPOINT);
  url.searchParams.set("language", "en-US");
  url.searchParams.set("query", query);
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("page", "1");

  if (!apiKey.startsWith("Bearer ")) {
    url.searchParams.set("api_key", apiKey);
  }

  return url;
}

async function performSearch(query: string) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB_API_KEY is not configured." }, { status: 500 });
  }

  const url = buildRequestUrl(query, apiKey);
  const headers: Record<string, string> = {};

  if (apiKey.startsWith("Bearer ")) {
    headers.Authorization = apiKey;
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
      "Failed to search TMDB.";

    return NextResponse.json({ error: message }, { status: response.status });
  }

  const data = (await response.json()) as {
    results?: Array<{
      id: number;
      title?: string;
      name?: string;
      release_date?: string;
      poster_path?: string | null;
      backdrop_path?: string | null;
    }>;
  };

  const results = (data.results ?? [])
    .filter((result) => Boolean(result.title ?? result.name))
    .slice(0, 12)
    .map((result) => {
      const title = result.title ?? result.name ?? "Untitled";
      const releaseYear = result.release_date?.slice(0, 4);
      const posterUrl = result.poster_path ? `${TMDB_IMAGE_BASE}${result.poster_path}` : null;
      const backdropUrl = result.backdrop_path ? `${TMDB_IMAGE_BASE}${result.backdrop_path}` : null;

      return {
        id: result.id,
        title,
        releaseYear,
        posterUrl,
        backdropUrl,
      };
    });

  return NextResponse.json({ results });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  return performSearch(query);
}
