/** Rows actually mounted for the circle dial. The numeral and the list are the same count. */
export function recommendationsToRender<T>(rows: readonly T[], size: number): T[] {
  const pool = Math.min(100, Math.max(0, rows.length));
  const count = Math.min(Math.max(0, Math.floor(size)), pool);
  return rows.slice(0, count);
}
