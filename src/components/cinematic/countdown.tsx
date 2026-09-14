"use client";

import { useEffect, useState } from "react";

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
      <div className="grid grid-cols-4 gap-2 max-w-md">
        {[
          [days, "Days"],
          [hours, "Hours"],
          [minutes, "Min"],
          [seconds, "Sec"],
        ].map(([value, unit]) => (
          <div
            key={String(unit)}
            className="countdown-unit px-2 py-1 text-left"
          >
            <div className="font-serif text-4xl md:text-5xl tabular-nums">
              {String(value).padStart(2, "0")}
            </div>
            <div className="label !text-[0.55rem] mt-1 !text-ivory-muted">
              {unit}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] tracking-wide text-ivory-muted/70">
        Your next chance to enter the house.
      </p>
    </div>
  );
}
