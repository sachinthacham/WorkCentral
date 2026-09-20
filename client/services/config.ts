/**
 * Public base URL of the NestJS API.
 *
 * Set NEXT_PUBLIC_API_URL in Vercel (and in client/.env.local for dev). It is
 * inlined at build time, so changing it in Vercel requires a redeploy.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "")

/** Absolute URL for a server-relative asset path such as /uploads/attachments/x.pdf */
export function apiAssetUrl(path: string): string {
  if (!path) return path
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`
}
