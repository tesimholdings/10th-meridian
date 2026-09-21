export function DemoMark({
  children = "Sample",
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <span className={`demo-mark ${className}`}>{children}</span>;
}
