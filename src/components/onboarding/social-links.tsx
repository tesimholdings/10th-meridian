import { SOCIAL_CATALOG, type SocialConnection } from "@/lib/onboarding/socials";

export function SocialLinks({ socials }: { socials?: SocialConnection[] }) {
  const connected = (socials ?? []).filter((row) => row.connected);
  if (!connected.length) return null;
  return (
    <ul className="mt-4 flex flex-wrap justify-center gap-2">
      {connected.map((row) => {
        const meta = SOCIAL_CATALOG.find((item) => item.id === row.provider);
        const href = row.url;
        const label = meta?.label ?? row.provider;
        return (
          <li key={row.provider}>
            {href ? (
              <a href={href} className="pill" rel="noreferrer" target="_blank">
                {label}
              </a>
            ) : (
              <span className="pill">{label}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
