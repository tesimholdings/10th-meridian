import { redirect } from "next/navigation";

export default function MembersRedirect() {
  redirect("/member/index?tab=all");
}
