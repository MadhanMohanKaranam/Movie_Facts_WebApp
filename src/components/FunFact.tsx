"use client";

import { useCallback, useEffect, useState } from "react";

type Props = {
  favoriteMovie: string;
};

type FunFactResponse = {
  fact?: string;
  error?: string;
};

export function FunFact({ favoriteMovie }: Props) {
  const [fact, setFact] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFact = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/funfact", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as FunFactResponse;

      if (!response.ok || !data.fact) {
        throw new Error(data.error ?? "Unable to fetch a fun fact right now.");
      }

      setFact(data.fact);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFact();
  }, [fetchFact, favoriteMovie]);

  return (
    <div className="space-y-4 rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-600/80 to-red-400/70 p-6 text-white shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/70">Fun fact</p>
          <h3 className="text-lg font-bold">About {favoriteMovie}</h3>
        </div>
        <button
          type="button"
          onClick={fetchFact}
          className="rounded-full border border-white/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/10"
          disabled={loading}
        >
          {loading ? "Loading" : "Refresh"}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-white/80">Generating a fresh tidbit...</p>
      ) : error ? (
        <p className="text-sm text-white/80">{error}</p>
      ) : (
        <p className="text-base leading-relaxed text-white">{fact}</p>
      )}
    </div>
  );
}
