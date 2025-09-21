"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";

type Props = {
  posters: string[];
};

export function LoginView({ posters }: Props) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 grid max-h-screen grid-cols-3 gap-1 opacity-40 sm:grid-cols-6">
        {posters.map((src, index) => (
          <div key={index} className="relative h-full w-full">
            <Image
              src={src}
              alt="Movie poster"
              fill
              sizes="33vw"
              className="object-cover"
              priority={index < 6}
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/95" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-black/80 p-10 shadow-2xl backdrop-blur">
          <div className="space-y-3 text-center">
            <div className="text-sm uppercase tracking-[0.3em] text-red-500">Movie Facts</div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">Discover cinematic trivia</h1>
            <p className="text-sm text-white/70">
              Sign in with Google, save your favorite movie, and we will surface an AI-generated fun fact every visit.
            </p>
          </div>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-base font-semibold text-black transition hover:scale-[1.01] hover:bg-white/90"
          >
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
              width={20}
              height={20}
            />
            Continue with Google
          </button>

          <p className="text-center text-xs text-white/50">
            By signing in you agree to receive cinematic fun facts and updates.
          </p>
        </div>
      </div>
    </div>
  );
}
