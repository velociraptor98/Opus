import { BreathRule } from "./Breath";
export const EmptyContainer = ({
  query,
  statusFilter,
}: {
  query: string;
  statusFilter: string;
}) => {
  return (
    <div className="content-center">
      <div className="py-14 text-center text-foreground/75 flex flex-col gap-3 items-center px-12">
        {/* The breath, held still — nothing to exhale yet. */}
        <BreathRule className="text-2xl" />
        <p className="text-sm">
          {query || statusFilter !== "All"
            ? "Nothing matches that."
            : "No applications yet."}
        </p>
      </div>
    </div>
  );
};
