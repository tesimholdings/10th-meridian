"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="safe-pad mx-auto flex min-h-dvh max-w-2xl flex-col justify-center py-20">
      <p className="label">A brief interruption</p>
      <h1 className="mt-5 font-serif text-5xl">Let’s find your way back.</h1>
      <p className="mt-5 text-ivory-muted">
        This page couldn’t load. Please try again.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <button
          className="meridian-button bg-ivory px-6 text-void"
          onClick={reset}
        >
          Try again
        </button>
        <Link href="/" className="quiet-link">
          Return to the entrance →
        </Link>
      </div>
    </main>
  );
}
