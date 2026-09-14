"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ReferralEntry } from "@/components/forms/referral-entry";

type Detector = {
  detect: (source: ImageBitmapSource) => Promise<{ rawValue: string }[]>;
};

export function QrScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);

  const submit = useCallback(
    async (raw: string) => {
      const code = raw.includes("/referral/")
        ? (raw.split("/referral/").pop() ?? raw)
        : raw;
      const res = await fetch("/api/referrals/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(
        json.message ??
          (json.ok
            ? "A referral opens the door earlier. What happens next is still earned."
            : "That code cannot be used."),
      );
      setRunning(false);
      if (json.ok) router.push("/open-house");
    },
    [router],
  );

  useEffect(() => {
    if (!running) return;
    let stream: MediaStream | null = null;
    let timer: number | null = null;
    let cancelled = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (!videoRef.current || cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const Detector = (
          window as unknown as {
            BarcodeDetector?: new (opts: { formats: string[] }) => Detector;
          }
        ).BarcodeDetector;
        if (!Detector) {
          setStatus(
            "This browser cannot decode a live QR. Paste the code below.",
          );
          setRunning(false);
          return;
        }
        const detector = new Detector({ formats: ["qr_code"] });
        const tick = async () => {
          if (!videoRef.current || cancelled) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const value = codes[0]?.rawValue;
            if (value) {
              await submit(value);
              return;
            }
          } catch {
            // keep scanning
          }
          timer = window.setTimeout(() => void tick(), 350);
        };
        void tick();
      } catch {
        setStatus(
          "Camera permission was declined. Paste the code or open the secure link.",
        );
        setRunning(false);
      }
    }

    void start();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [running, submit]);

  return (
    <div className="grid gap-6">
      <div className="border border-[var(--line)] p-4">
        <p className="label">Scan</p>
        <p className="mt-2 text-sm text-ivory-muted">
          On browsers that support BarcodeDetector, the rear camera can read a
          referral QR. Otherwise paste the code or open the printed link. The
          server never says whether a code was already used.
        </p>
        <button
          type="button"
          className="mt-4 min-h-12 border border-[var(--gold)] px-4 text-[11px] tracking-[0.18em] uppercase text-gold"
          onClick={() => {
            if (!("BarcodeDetector" in window) || !navigator.mediaDevices) {
              setStatus(
                "This browser cannot decode a live QR. Paste the code below.",
              );
              setRunning(false);
              return;
            }
            setRunning((r) => !r);
          }}
        >
          {running ? "Stop camera" : "Open camera"}
        </button>
        {running ? (
          <video
            ref={videoRef}
            className="mt-4 aspect-[3/4] w-full bg-black object-cover"
            muted
            playsInline
          />
        ) : null}
        {status ? <p className="mt-3 text-sm text-gold">{status}</p> : null}
      </div>
      <ReferralEntry />
    </div>
  );
}
