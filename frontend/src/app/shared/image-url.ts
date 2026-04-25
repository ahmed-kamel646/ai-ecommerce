import { environment } from '../../environments/environment';

const PLACEHOLDER = 'https://placehold.co/400x300?text=No+Image';

/**
 * Resolve a backend-relative image URL (e.g. `/files/products/abc.png`)
 * to a fully qualified URL using `environment.apiBase`. Absolute URLs are
 * returned unchanged.
 */
export function resolveImageUrl(url: string | null | undefined, fallback: string = PLACEHOLDER): string {
  if (!url) return fallback;
  if (/^https?:\/\//i.test(url)) return url;
  return `${environment.apiBase}${url}`;
}
