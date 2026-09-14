"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Countdown({
  targetIso,
  label = "Until the doors open",
  serverNowIso,
}: {
  targetIso: string;
  label?: string;
  serverNowIso: string;
}) {
  const [now, setNow] = useState(() => new Date(serverNowIso).getTime());

  useEffect(() => {
    const offset = Date.now() - new Date(serverNowIso).getTime();
    const tick = () => setNow(Date.now() - offset);
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [serverNowIso]);

  const target = new Date(targetIso).getTime();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return (
    <div>
      <p className="label mb-4">{label}</p>
      <div className="countdown-rail max-w-md">
        {[
          [days, "Days"],
          [hours, "Hours"],
          [minutes, "Min"],
          [seconds, "Sec"],
        ].map(([value, unit]) => (
          <div key={String(unit)} className="countdown-cell">
            <div className="font-serif text-[1.85rem] leading-none tracking-tight tabular-nums md:text-4xl">
              {typeof value === "number" ? pad(value) : value}
            </div>
            <div className="label mt-2 !text-[0.5rem] !text-ivory-dim">{unit}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] tracking-[0.12em] text-ivory-dim">
        Display only. Access is decided on the server, never by this clock.
      </p>
    </div>
  );
}
