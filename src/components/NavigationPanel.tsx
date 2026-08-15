/** Pager band under the table. Renders nothing when it all fits on one page. */
export const NavigationPanel = ({
  totalPages,
  currentPage,
  setPage,
}: {
  totalPages: number;
  currentPage: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-4 px-4 md:px-8 py-3 border-t-2 border-line">
      <button
        onClick={() => setPage((p) => Math.max(0, p - 1))}
        disabled={currentPage === 0}
        className="op-lnk eyebrow"
      >
        ← Previous
      </button>
      <span className="eyebrow text-muted tnum">
        Page {currentPage + 1} of {totalPages}
      </span>
      <button
        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        disabled={currentPage === totalPages - 1}
        className="op-lnk eyebrow ml-auto"
      >
        Next →
      </button>
    </div>
  );
};
