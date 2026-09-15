export async function postRewards(body: Record<string, unknown>) {
  const res = await fetch("/api/rewards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as { ok?: boolean; message?: string };
}
