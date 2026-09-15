import { redirect } from "next/navigation";

export default function MembersRedirect() {
  redirect("/member/circle?tab=all");
}
