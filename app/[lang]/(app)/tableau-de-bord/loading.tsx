export default function Loading() {
  return (
    <div className="space-y-10" aria-busy>
      <div className="h-24 border-b border-line" />
      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse bg-paper" />
        ))}
      </div>
      <div className="h-48 animate-pulse border border-line bg-paper" />
    </div>
  );
}
