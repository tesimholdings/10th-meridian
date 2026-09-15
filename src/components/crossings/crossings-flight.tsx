"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";

const FLIGHT_MS = 2200;
const TIMEOUT_MS = 2800;
const REDUCED_MS = 420;
const LEAVE_MS = 380;

type Flight = { href: string; reduced: boolean };

const FlightCtx = createContext<{ flyTo: (href: string) => void } | null>(null);

export function useCrossingsFlight() {
  return useContext(FlightCtx);
}

export function CrossingsFlightProvider({
  city,
  children,
}: {
  city?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [leaving, setLeaving] = useState(false);
  const hrefRef = useRef<string | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);

  const go = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  const flyTo = useCallback(
    (href: string) => {
      if (hrefRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      hrefRef.current = href;
      router.prefetch(href);
      setLeaving(false);
      setFlight({ href, reduced });
      const wait = reduced ? REDUCED_MS : FLIGHT_MS;
      timers.current.push(window.setTimeout(() => go(href), wait));
      timers.current.push(window.setTimeout(() => go(href), TIMEOUT_MS));
    },
    [go, router],
  );

  useEffect(() => {
    if (!flight) return;
    const arrived =
      pathname === flight.href ||
      (flight.href === "/member/crossings" && Boolean(pathname?.startsWith("/member/crossings")));
    if (!arrived) return;
    setLeaving(true);
    const id = window.setTimeout(() => {
      clearTimers();
      hrefRef.current = null;
      setFlight(null);
      setLeaving(false);
    }, LEAVE_MS);
    return () => window.clearTimeout(id);
  }, [clearTimers, flight, pathname]);

  useEffect(() => {
    if (!flight) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape" || !hrefRef.current) return;
      e.preventDefault();
      go(hrefRef.current);
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [flight, go]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <FlightCtx.Provider value={{ flyTo }}>
      {children}
      {flight ? (
        <FlightOverlay
          city={city}
          leaving={leaving}
          reduced={flight.reduced}
        />
      ) : null}
    </FlightCtx.Provider>
  );
}

export function CrossingsEntryLink({
  href,
  className,
  children,
  ...rest
}: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const flight = useCrossingsFlight();
  const target = typeof href === "string" ? href : "/member/crossings";
  const already = Boolean(pathname?.startsWith("/member/crossings"));

  if (already || !flight) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      {...rest}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        flight.flyTo(target);
      }}
    >
      {children}
    </Link>
  );
}

function FlightOverlay({
  city,
  leaving,
  reduced,
}: {
  city?: string;
  leaving: boolean;
  reduced: boolean;
}) {
  const label = city?.trim() || "A crossing";
  return (
    <div
      className={`crossings-flight ${leaving ? "is-leaving" : ""} ${reduced ? "is-reduced" : ""}`}
      role="dialog"
      aria-live="polite"
      aria-label={`Flying to ${label}`}
    >
      <div className="grain crossings-flight-grain" aria-hidden />
      <div className="crossings-flight-stage">
        <svg
          className="crossings-flight-map"
          viewBox="0 0 400 225"
          fill="none"
          aria-hidden
        >
          <path
            className="crossings-flight-arc"
            d="M 36 188 C 118 188 168 62 292 78"
            stroke="#c4a264"
            strokeWidth="1.15"
            strokeLinecap="round"
            pathLength="1"
          />
          <circle className="crossings-flight-dest" cx="292" cy="78" r="3.2" fill="#c4a264" />
          {reduced ? null : (
            <g className="crossings-flight-craft">
              <animateMotion
                dur="2.1s"
                fill="freeze"
                rotate="auto"
                calcMode="spline"
                keyTimes="0;1"
                keySplines="0.22 0.61 0.36 1"
                path="M 36 188 C 118 188 168 62 292 78"
              />
              <g transform="translate(-16,-16)">
                <path
                  d="M2 17.2 28.4 10.6c.8-.22 1.52.46 1.28 1.24l-3.7 11.1c-.2.62-.98.82-1.5.4l-3.86-3.06-3.46 4.24c-.36.44-1.06.26-1.18-.3l-.82-3.66-6.66.06c-.64.02-1-.66-.66-1.16L9.2 15.1 1.86 16c-.62.08-.92-.7-.62-1.16Z"
                  fill="#f0d78a"
                />
              </g>
            </g>
          )}
        </svg>
        <p className="crossings-flight-city">{label}</p>
      </div>
    </div>
  );
}
