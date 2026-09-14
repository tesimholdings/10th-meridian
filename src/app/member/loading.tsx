export default function Loading() {
  return (
    <div
      role="status"
      className="safe-pad mx-auto min-h-[60vh] max-w-6xl py-24"
    >
      <div className="loading-orbit" aria-hidden="true" />
      <p className="label mt-8">One moment</p>
      <p className="mt-3 font-serif text-4xl">Opening the house.</p>
      <span className="sr-only">Loading member content</span>
    </div>
  );
}
