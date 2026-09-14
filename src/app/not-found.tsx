import Link from "next/link";
export default function NotFound() {
  return (
    <main className="safe-pad mx-auto flex min-h-dvh max-w-2xl flex-col justify-center py-20">
      <p className="label">Beyond the map · 404</p>
      <h1 className="mt-5 font-serif text-5xl">This path ends here.</h1>
      <p className="mt-5 text-ivory-muted">
        The page may have moved or is no longer available.
      </p>
      <Link className="quiet-link mt-8 text-gold" href="/">
        Return to the entrance →
      </Link>
    </main>
  );
}
