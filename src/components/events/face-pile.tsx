import type { Face } from "@/lib/events/attendance";

export function FacePile({
  people,
  empty = "No one yet",
  limit = 4,
  tone = "ivory",
}: {
  people: Face[];
  empty?: string;
  limit?: number;
  tone?: "ivory" | "navy";
}) {
  if (people.length === 0) {
    return <p className={`face-empty face-empty-${tone}`}>{empty}</p>;
  }
  const shown = people.slice(0, limit);
  const extra = people.length - shown.length;
  const names = shown.map((person) => person.name).join(", ");
  return (
    <div className={`face-pile face-pile-${tone}`}>
      <div className="face-pile-avatars">
        {shown.map((person) => (
          <span key={person.id} className="avatar face-avatar" style={{ background: person.accent }} title={person.name}>
            {person.initials}
          </span>
        ))}
        {extra > 0 ? <span className="face-more">+{extra}</span> : null}
      </div>
      <p className="face-names">
        {names}
        {extra > 0 ? <span className="face-overflow"> +{extra} more</span> : null}
      </p>
    </div>
  );
}
