/** Strip house-ops labels before a string is shown to a member. */
export function memberSurfaceCopy(text: string): string {
  return text
    .replace(/\s*[·—-]?\s*SYNTHETIC DEMO\b\.?/gi, "")
    .replace(/\bDEMO thread:\s*/gi, "")
    .replace(/\bDEMO:\s*/gi, "")
    .replace(/\s*—\s*DEMO only\.?/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
