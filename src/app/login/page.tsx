import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { FEATURED_MOVIES } from "@/lib/movies";
import { LoginView } from "./LoginView";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/");
  }

  const posters = FEATURED_MOVIES.map((movie) => movie.poster);

  return <LoginView posters={posters} />;
}
