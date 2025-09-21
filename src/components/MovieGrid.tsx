import Image from "next/image";

type Movie = {
  title: string;
  poster: string;
};

type Props = {
  movies: Movie[];
};

export function MovieGrid({ movies }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {movies.map((movie, index) => (
        <div
          key={movie.title}
          className="group relative aspect-[2/3] overflow-hidden rounded-xl border border-white/5 bg-white/5 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-red-500 hover:shadow-red-500/50"
        >
          <Image
            src={movie.poster}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 18vw"
            className="object-cover transition duration-300 group-hover:scale-105"
            priority={index < 6}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
          <div className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-white opacity-0 transition duration-300 group-hover:opacity-100">
            {movie.title}
          </div>
        </div>
      ))}
    </div>
  );
}
