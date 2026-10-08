import type { ReactNode } from "react";
import { SESEH_TRIP } from "@/lib/trips/seseh";

export function TripStory({
  going,
  waitlist,
  cta,
  showTitle = false,
}: {
  going: number;
  waitlist: number;
  cta?: ReactNode;
  showTitle?: boolean;
}) {
  const trip = SESEH_TRIP;
  const open = Math.max(trip.capacity - going, 0);

  return (
    <div className="trip-story">
      <section className="trip-facts">
        {showTitle ? (
          <>
            <p className="label">{trip.kicker}</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">{trip.title}</h2>
            <p className="mt-3 text-[var(--navy-soft)]">{trip.hostLine}</p>
          </>
        ) : (
          <p className="label">{trip.hostLine}</p>
        )}
        <p className="mt-6 max-w-2xl text-lg text-[var(--navy)]">{trip.lede}</p>
        <dl className="trip-fact-grid mt-8">
          <div>
            <dt>When</dt>
            <dd>{trip.whenLabel}</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>{trip.priceLine}</dd>
          </div>
          <div>
            <dt>The room</dt>
            <dd>
              {going} going · {open} of {trip.capacity} spots open
              {waitlist > 0 ? ` · ${waitlist} waitlist` : ""}
            </dd>
          </div>
          <div>
            <dt>Place</dt>
            <dd>{trip.place}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-[var(--navy-soft)]">{trip.spotsLine}</p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-3xl">Included</h2>
        <ul className="mt-4 grid gap-2 text-[var(--navy)]">
          {trip.inclusions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <ul className="trip-gallery mt-12">
        {trip.gallery.map((still) => (
          <li key={still.src}>
            <figure className="trip-shot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={still.src} alt={still.alt} />
              <div className="trip-shot-scrim" aria-hidden />
              <figcaption>{still.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-3xl">The week</h2>
          <p className="text-sm text-[var(--navy-soft)]">{trip.scheduleNote}</p>
        </div>
        <ol className="trip-days mt-6">
          {trip.days.map((day) => (
            <li key={day.label} className="surface rounded-[1.35rem] p-5">
              <p className="label">
                {day.label} · {day.date}
              </p>
              <h3 className="mt-2 font-serif text-2xl">{day.title}</h3>
              {day.note ? <p className="mt-2 text-sm text-[var(--navy-soft)]">{day.note}</p> : null}
              <ul className="mt-3 grid gap-1 text-sm text-[var(--navy)]">
                {day.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {day.optional ? (
                <p className="mt-3 text-sm text-[var(--navy-soft)]">Optional: {day.optional}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section className="trip-sections mt-14">
        {trip.sections.map((section) => (
          <article key={section.kicker}>
            <p className="label">{section.kicker}</p>
            <h2 className="mt-2 font-serif text-3xl">{section.title}</h2>
            <p className="mt-3 text-[var(--navy-soft)]">{section.body}</p>
          </article>
        ))}
      </section>

      {cta ? <div className="mt-12">{cta}</div> : null}
    </div>
  );
}
