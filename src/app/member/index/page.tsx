import { redirect } from "next/navigation";

export default async function IndexRedirect({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const params = await searchParams;
  const next = new URLSearchParams();
  if (params.tab) next.set("tab", params.tab);
  if (params.q) next.set("q", params.q);
  const query = next.toString();
  redirect(query ? `/member/circle?${query}` : "/member/circle");
}
