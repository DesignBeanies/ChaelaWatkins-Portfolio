"use client";

import React, { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50dvh] max-w-md flex-col items-center justify-center gap-3 px-6 py-20 text-center text-ink">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="text-ink/80">
        The page hit an error while loading. Try again, or run{" "}
        <code className="font-mono text-sm">npm run dev:clean</code> to clear
        the Next.js cache, then refresh.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-2 border-2 border-ink bg-ink px-4 py-2 text-hwite"
      >
        Try again
      </button>
    </div>
  );
}
