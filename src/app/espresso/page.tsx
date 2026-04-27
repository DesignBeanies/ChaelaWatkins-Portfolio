"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Replaces legacy `next.config` redirect for static export (GitHub Pages). */
export default function EspressoRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}
