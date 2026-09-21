/** The curated For you set. Ranking stays as given; only the first `size` rows render. */
export function recommendationsToRender<T>(rows: readonly T[], size = 10): T[] {
  const pool = Math.min(100, Math.max(0, rows.length));
  const count = Math.min(Math.max(0, Math.floor(size)), pool);
  return rows.slice(0, count);
}
