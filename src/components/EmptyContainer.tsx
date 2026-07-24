import { ApplicationKind, KIND_LABELS } from "@/constants/kind";
import { BreathRule } from "./Breath";
export const EmptyContainer = ({
  query,
  statusFilter,
  kind,
}: {
  query: string;
  statusFilter: string;
  kind: ApplicationKind;
}) => {
  return (
    <div className="content-center">
      <div className="py-14 text-center text-foreground/75 flex flex-col gap-3 items-center px-12">
        {/* The breath, held still — nothing to exhale yet. */}
        <BreathRule className="text-2xl" />
        <p className="text-sm">
          {query || statusFilter !== "All"
            ? "Nothing matches that."
            : KIND_LABELS[kind].emptyLabel}
        </p>
      </div>
    </div>
  );
};
