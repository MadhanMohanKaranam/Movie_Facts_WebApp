import { NextResponse } from "next/server";

export async function GET() {
  const movie = "Inception"; // replace later with user’s movie
  const fact = `Did you know? ${movie} was a huge success!`; // placeholder

  return NextResponse.json({ fact });
}
