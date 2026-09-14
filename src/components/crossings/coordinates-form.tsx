"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PrivacyNotice } from "@/components/crossings/states";
import {
  JOURNEY_VISIBILITY,
  JOURNEY_VISIBILITY_LABELS,
  MEETING_FORMATS,
  TRAVEL_INTENTS,
  type JourneyRecord,
  type JourneyVisibility,
  type MeetingFormat,
  type TravelIntent,
} from "@/lib/crossings/types";

const steps = [
  { id: "where", title: "Where" },
  { id: "when", title: "When" },
  { id: "how", title: "How you wish to meet" },
  { id: "privacy", title: "Who may see this" },
];

type Draft = {
  destinationCity: string;
  destinationCountry: string;
  timezone: string;
  arrivalDate: string;
  departureDate: string;
  flexibleDates: boolean;
  availability: MeetingFormat[];
  intents: TravelIntent[];
  privateNote: string;
  visibility: JourneyVisibility;
  openToOneToOne: boolean;
  openToGroupTable: boolean;
  needsLocalRecommendation: boolean;
  willingCityHost: boolean;
};

const empty: Draft = {
  destinationCity: "",
  destinationCountry: "",
  timezone: "Europe/Paris",
  arrivalDate: "",
  departureDate: "",
  flexibleDates: false,
  availability: [],
  intents: [],
  privateNote: "",
  visibility: "all_members",
  openToOneToOne: true,
  openToGroupTable: false,
  needsLocalRecommendation: false,
  willingCityHost: false,
};

export function CoordinatesForm({
  initial,
  journeyId,
}: {
  initial?: JourneyRecord;
  journeyId?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(
    initial
      ? {
          destinationCity: initial.destinationCity,
          destinationCountry: initial.destinationCountry,
          timezone: initial.timezone,
          arrivalDate: initial.arrivalDate,
          departureDate: initial.departureDate,
          flexibleDates: initial.flexibleDates,
          availability: initial.availability,
          intents: initial.intents,
          privateNote: initial.privateNote ?? "",
          visibility: initial.visibility,
          openToOneToOne: initial.openToOneToOne,
          openToGroupTable: initial.openToGroupTable,
          needsLocalRecommendation: initial.needsLocalRecommendation,
          willingCityHost: initial.willingCityHost,
        }
      : empty,
  );
  const [status, setStatus] = useState<string | null>(null);
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  function toggle<T extends string>(key: "availability" | "intents", value: T) {
    setDraft((d) => {
      const list = d[key] as T[];
      const next = list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
      return { ...d, [key]: next };
    });
  }

  async function save() {
    setStatus(null);
    const payload = {
      ...draft,
      privateNote: draft.privateNote || undefined,
    };
    const res = await fetch("/api/crossings/journeys", {
      method: journeyId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        journeyId ? { id: journeyId, action: "update", patch: payload } : payload,
      ),
    });
    const json = (await res.json()) as { ok?: boolean; message?: string; journey?: JourneyRecord };
    if (!json.ok) {
      setStatus(json.message ?? "Could not save your coordinates.");
      return;
    }
    router.push(json.journey ? `/member/crossings/${json.journey.id}` : "/member/crossings");
    router.refresh();
  }

  return (
    <div>
      <ol className="grid grid-cols-4 gap-2">
        {steps.map((s, i) => (
          <li key={s.id} className="min-w-0">
            <p className={`text-[10px] tracking-[0.14em] uppercase ${i === step ? "text-gold" : "text-ivory-dim"}`}>
              {String(i + 1).padStart(2, "0")}
            </p>
            <p className={`mt-1 truncate text-[11px] ${i === step ? "text-ivory" : "text-ivory-dim"}`}>
              {s.title}
            </p>
          </li>
        ))}
      </ol>
      <div className="mt-4 h-px bg-[var(--line)]">
        <div className="h-px bg-[var(--gold)] transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <p className="label mt-8">
        Set Your Coordinates · Step {step + 1} of {steps.length}
      </p>
      <h2 className="mt-2 font-serif text-3xl">{steps[step].title}</h2>

      <div className="panel mt-6 grid gap-4 p-5">
        {step === 0 ? (
          <>
            <label className="grid gap-2">
              <span className="label">Destination city</span>
              <input
                value={draft.destinationCity}
                onChange={(e) => setDraft({ ...draft, destinationCity: e.target.value })}
                placeholder="Paris"
                required
              />
            </label>
            <label className="grid gap-2">
              <span className="label">Country</span>
              <input
                value={draft.destinationCountry}
                onChange={(e) => setDraft({ ...draft, destinationCountry: e.target.value })}
                placeholder="France"
                required
              />
            </label>
            <label className="grid gap-2">
              <span className="label">Timezone</span>
              <input
                value={draft.timezone}
                onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
                placeholder="Europe/Paris"
              />
            </label>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <label className="grid gap-2">
              <span className="label">Arrival</span>
              <input
                type="date"
                value={draft.arrivalDate}
                onChange={(e) => setDraft({ ...draft, arrivalDate: e.target.value })}
              />
            </label>
            <label className="grid gap-2">
              <span className="label">Departure</span>
              <input
                type="date"
                value={draft.departureDate}
                onChange={(e) => setDraft({ ...draft, departureDate: e.target.value })}
              />
            </label>
            <label className="flex min-h-12 items-center gap-3 text-sm text-ivory-muted">
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={draft.flexibleDates}
                onChange={(e) => setDraft({ ...draft, flexibleDates: e.target.checked })}
              />
              Flexible dates (three days on either side)
            </label>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <p className="label">Availability</p>
            <div className="flex flex-wrap gap-2">
              {MEETING_FORMATS.map((f) => (
                <Chip
                  key={f}
                  on={draft.availability.includes(f)}
                  onClick={() => toggle("availability", f)}
                >
                  {f}
                </Chip>
              ))}
            </div>
            <p className="label mt-2">Intent</p>
            <div className="flex flex-wrap gap-2">
              {TRAVEL_INTENTS.map((f) => (
                <Chip key={f} on={draft.intents.includes(f)} onClick={() => toggle("intents", f)}>
                  {f}
                </Chip>
              ))}
            </div>
            <label className="grid gap-2">
              <span className="label">Private note (optional)</span>
              <textarea
                value={draft.privateNote}
                onChange={(e) => setDraft({ ...draft, privateNote: e.target.value })}
                placeholder="A short note. Never a flight number or a hotel stay."
              />
            </label>
          </>
        ) : null}
        {step === 3 ? (
          <>
            <label className="grid gap-2">
              <span className="label">Visibility</span>
              <select
                value={draft.visibility}
                onChange={(e) =>
                  setDraft({ ...draft, visibility: e.target.value as JourneyVisibility })
                }
              >
                {JOURNEY_VISIBILITY.map((v) => (
                  <option key={v} value={v}>
                    {JOURNEY_VISIBILITY_LABELS[v]}
                  </option>
                ))}
              </select>
            </label>
            <Toggle
              label="Open to one-to-one meetings"
              checked={draft.openToOneToOne}
              onChange={(v) => setDraft({ ...draft, openToOneToOne: v })}
            />
            <Toggle
              label="Open to a group table"
              checked={draft.openToGroupTable}
              onChange={(v) => setDraft({ ...draft, openToGroupTable: v })}
            />
            <Toggle
              label="Needs a local recommendation"
              checked={draft.needsLocalRecommendation}
              onChange={(v) => setDraft({ ...draft, needsLocalRecommendation: v })}
            />
            <Toggle
              label="Willing to act as a City Host"
              checked={draft.willingCityHost}
              onChange={(v) => setDraft({ ...draft, willingCityHost: v })}
            />
            <p className="text-sm text-ivory-dim">
              City Hosts welcome visitors as members — never as professional concierges.
            </p>
          </>
        ) : null}
      </div>

      <div className="mt-5">
        <PrivacyNotice />
      </div>

      {status ? <p className="mt-4 text-sm text-gold">{status}</p> : null}

      <div className="mt-8 flex flex-wrap gap-3">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        ) : null}
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
        ) : (
          <Button onClick={() => void save()}>{journeyId ? "Save journey" : "Set Your Coordinates"}</Button>
        )}
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 text-sm text-ivory-muted">
      <input
        type="checkbox"
        className="h-5 w-5"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
