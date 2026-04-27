/**
 * Prefix paths to files in `public/` when Next.js `basePath` is set (GitHub Pages project URL).
 * `next.config` mirrors the same value into `NEXT_PUBLIC_BASE_PATH` for client-side `<img>` etc.
 */
export function publicPath(path: string): string {
  const prefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!path.startsWith("/")) {
    return `${prefix}/${path}`;
  }
  return `${prefix}${path}`;
}
