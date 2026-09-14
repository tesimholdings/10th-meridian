export function WhyMeet({
  items,
  prose,
}: {
  items?: { pillar: string; text: string }[];
  prose?: string;
}) {
  return (
    <div className="why-meet mt-4">
      <p className="label">Why you should meet</p>
      {prose ? <p className="mt-2">{prose}</p> : null}
      {items?.length ? (
        <ul className="mt-2 grid gap-2">
          {items.map((e) => (
            <li key={e.pillar}>
              <span className="text-gold">{e.pillar}.</span> {e.text}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
