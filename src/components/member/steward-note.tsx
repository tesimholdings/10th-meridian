"use client";

import { useState } from "react";

export function StewardNote({ fromName }: { fromName: string }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const body = message.trim();
    if (!body) return;
    setStatus("sending");
    const res = await fetch("/api/help", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: body }),
    });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    setMessage("");
    setStatus("sent");
  }

  return (
    <form id="contact" onSubmit={submit} className="member-card mt-8 grid gap-3 px-5 py-5">
      <h2 className="font-serif text-2xl text-[var(--navy)]">Contact a steward</h2>
      <p className="text-sm text-[var(--navy-soft)]">
        {fromName}, write here. A steward reads the note. This is not instant chat.
      </p>
      <label className="grid gap-2 text-sm text-[var(--navy)]">
        Note
        <textarea
          name="message"
          required
          minLength={8}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What should the house know?"
        />
      </label>
      <button type="submit" className="action-quiet" disabled={status === "sending"}>
        {status === "sending" ? "Sending" : "Send to the house"}
      </button>
      {status === "sent" ? (
        <p className="text-sm text-[var(--navy)]" role="status">
          Sent. A steward has the note.
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          The note did not send. Try again.
        </p>
      ) : null}
    </form>
  );
}
