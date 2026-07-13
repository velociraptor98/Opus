import { BreathRule } from "./Breath";

function SkeletonCard() {
  return (
    <div className="card-glass rounded-2xl p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="skeleton h-4 w-28 rounded-md" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="skeleton h-3 w-40 rounded-md mb-2" />
      <div className="skeleton h-3 w-24 rounded-md mb-4" />
      <div className="flex items-center gap-2 border-t border-foreground/5 pt-3">
        <div className="skeleton h-8 w-8 rounded-lg" />
        <div className="skeleton h-8 w-8 rounded-lg" />
        <div className="skeleton h-8 w-8 rounded-lg ml-auto" />
      </div>
    </div>
  );
}

export function JobChecklistSkeleton() {
  return (
    // Mirrors JobChecklist's own layout — a glass-well sidebar, not a sticky
    // strip — so the page doesn't jump when the real content lands.
    <div className="w-full flex flex-col md:flex-row gap-4 md:items-stretch">
      <div className="w-full md:w-auto md:shrink-0 flex flex-col gap-2 glass-well rounded-2xl p-4 self-stretch">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-8 w-20 md:w-44 rounded-full md:rounded-xl shrink-0"
          />
        ))}
        <div className="skeleton h-10 w-full rounded-full mt-1" />
      </div>

      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="glass-well rounded-2xl p-4">
          {/* The loading rhythm: the same exhale, looped. */}
          <div className="flex justify-center py-3" aria-label="Loading" role="status">
            <BreathRule loading className="text-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
