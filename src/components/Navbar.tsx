"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";

type NavbarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type Props = {
  user?: NavbarUser;
};

function getInitials(user?: NavbarUser) {
  const source = user?.name || user?.email || "";
  const trimmed = source.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "?";
}

export function Navbar({ user }: Props) {
  const initials = getInitials(user);

  return (
    <header className="flex items-center justify-between gap-6 border-b border-white/10 bg-black/50 px-8 py-5 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 font-black text-white">
          MF
        </div>
        <div className="leading-tight">
          <p className="text-lg font-semibold">Movie Facts</p>
          <p className="text-xs uppercase tracking-[0.35em] text-red-500">Movie insights</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-red-500 hover:bg-red-500/20"
        >
          Sign out
        </button>
        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/20 bg-white/10">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name ? `${user.name}'s avatar` : "User avatar"}
              fill
              sizes="40px"
              className="object-cover"
              priority={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
              {initials}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
