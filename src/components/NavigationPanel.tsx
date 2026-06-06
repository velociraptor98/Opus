export const NavigationPanel = ({
  totalPages,
  currentPage,
  setPage,
}: {
  totalPages: number;
  currentPage: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  return (
    <>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="btn-glass px-3 py-1.5 text-sm font-semibold rounded-lg text-foreground/75 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          >
            ← Prev
          </button>
          <span className="text-sm text-foreground/65 font-medium">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="btn-glass px-3 py-1.5 text-sm font-semibold rounded-lg text-foreground/75 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
};
