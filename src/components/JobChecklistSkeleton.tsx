/**
 * Mirrors JobChecklist's band stack exactly — title bar, status strip, filter
 * band, table — so the page doesn't jump a single pixel when the rows land.
 */
export function JobChecklistSkeleton() {
  return (
    <div className="flex flex-col flex-1" role="status" aria-label="Loading applications">
      <div className="flex items-end gap-6 px-4 md:px-8 pt-5 pb-3.5">
        <div className="mr-auto">
          <div className="skeleton h-8 w-56 mb-2" />
          <div className="skeleton h-3 w-40" />
        </div>
        <div className="skeleton h-9 w-52 hidden md:block" />
        <div className="skeleton h-9 w-44" />
      </div>

      <div className="grid grid-cols-4 md:grid-cols-8 border-t-2 border-b border-line">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-4 pt-3 pb-3.5 border-l border-line first:border-l-0">
            <div className="skeleton h-6 w-8 mb-2.5" />
            <div className="skeleton h-2.5 w-16" />
          </div>
        ))}
      </div>

      <div className="flex items-center border-b-2 border-line min-h-[46px] px-4 md:px-8">
        <div className="skeleton h-3 w-52" />
      </div>

      <div className="px-4 md:px-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-line">
            <div className="skeleton h-[26px] w-[26px] shrink-0" />
            <div className="skeleton h-4 w-32 shrink-0" />
            <div className="skeleton h-3 flex-1 max-w-[220px]" />
            <div className="skeleton h-5 w-20 shrink-0 hidden md:block" />
            <div className="skeleton h-1.5 w-[108px] shrink-0 hidden md:block" />
            <div className="skeleton h-3 w-24 shrink-0 ml-auto hidden lg:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
