export const EmptyContainer = ({
  query,
  statusFilter,
}: {
  query: string;
  statusFilter: string;
}) => {
  return (
    <div className="content-center">
      <div className="py-12 text-center text-primary/40 dark:text-zinc-500 flex flex-col gap-2 items-center px-12">
        <svg
          className="w-12 h-12 opacity-20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="font-medium italic">
          {query || statusFilter !== "All"
            ? "No matching applications"
            : "No applications created"}
        </p>
      </div>
    </div>
  );
};
