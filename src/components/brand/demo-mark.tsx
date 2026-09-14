export function DemoMark({
  children = "SYNTHETIC DEMO",
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <span className={`demo-mark ${className}`}>{children}</span>;
}
