import { redirect } from "next/navigation";
import { z } from "zod";
import { resolveAccessContext } from "@/lib/access/context";
import { createEntryInvoice, invoiceStubMessage } from "@/lib/stripe/invoice";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  accountId: z.string().optional(),
  applicationId: z.string().optional(),
});

export async function POST(request: Request) {
  const access = await resolveAccessContext();
  if (access.user?.role !== "administrator" && access.user?.role !== "moderator") {
    return new Response("Stewards only.", { status: 403 });
  }

  const form = await request.formData();
  const parsed = schema.safeParse({
    email: String(form.get("email") ?? ""),
    accountId: String(form.get("accountId") ?? "") || undefined,
    applicationId: String(form.get("applicationId") ?? "") || undefined,
  });
  if (!parsed.success) {
    redirect("/admin/billing?invoice=invalid");
  }

  const result = await createEntryInvoice(parsed.data);
  if (!result.ok) {
    redirect(`/admin/billing?invoice=${encodeURIComponent(result.reason)}`);
  }
  redirect(result.hostedInvoiceUrl);
}

export { invoiceStubMessage };
