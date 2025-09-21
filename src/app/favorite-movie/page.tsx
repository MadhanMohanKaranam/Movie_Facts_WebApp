import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { FavoriteMovieForm } from "./FavoriteMovieForm";

export const dynamic = "force-dynamic";

export default async function FavoriteMoviePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { favoriteMovie: true },
  });

  if (user?.favoriteMovie) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 py-16">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://image.tmdb.org/t/p/original/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/10 bg-black/70 p-10 shadow-2xl backdrop-blur">
        <div className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-red-500">Step 1</p>
          <h1 className="text-3xl font-black sm:text-4xl">Pick your favorite movie</h1>
          <p className="text-sm text-white/70">
            Start typing to search TMDB, then choose the right poster. We will use it to tailor fun facts just for you.
          </p>
        </div>

        <div className="mt-10">
          <FavoriteMovieForm initialMovie={session.user.favoriteMovie ?? ""} />
        </div>
      </div>
    </div>
  );
}
