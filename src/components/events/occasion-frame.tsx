import Link from "next/link";
import { EDITORIAL_CAPTION } from "@/lib/atmosphere/campaign";
import type { Face } from "@/lib/events/attendance";
import { FacePile } from "@/components/events/face-pile";

export function OccasionFrame({
  src,
  href,
  title,
  place,
  when,
  detail,
  kicker,
  people,
  peopleEmpty = "No one yet",
  heading = "h2",
}: {
  src: string;
  href?: string;
  title: string;
  place: string;
  when: string;
  detail?: string;
  kicker?: string;
  people?: Face[];
  peopleEmpty?: string;
  heading?: "h1" | "h2";
}) {
  const Title = heading;
  const body = (
    <article className="occasion">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="occasion-photo" />
      <div className="occasion-scrim" aria-hidden />
      <div className="occasion-copy">
        {kicker ? <p className="occasion-kicker">{kicker}</p> : null}
        <Title className="occasion-title">{title}</Title>
        <p className="occasion-meta">
          {place}
          {when ? <span> · {when}</span> : null}
        </p>
        {detail ? <p className="occasion-detail">{detail}</p> : null}
        {people ? <FacePile people={people} empty={peopleEmpty} tone="ivory" /> : null}
      </div>
      <p className="sr-only">{EDITORIAL_CAPTION}</p>
    </article>
  );

  if (!href) return body;
  return (
    <Link href={href} className="occasion-link lift-card block">
      {body}
    </Link>
  );
}
