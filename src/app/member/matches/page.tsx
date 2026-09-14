import { redirect } from "next/navigation";

export default function IndexLegacyRedirect() {
  redirect("/member/index");
}
