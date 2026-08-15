import { ApplicationKind, KIND_LABELS } from "@/constants/kind";

/**
 * The empty list. Deliberately left-aligned and full-height rather than a
 * centred card: the design never centres a block on this page, and a first
 * run should look like the start of the table, not like an error.
 */
export const EmptyContainer = ({
  query,
  statusFilter,
  kind,
  onAdd,
}: {
  query: string;
  statusFilter: string;
  kind: ApplicationKind;
  onAdd: () => void;
}) => {
  const filtered = Boolean(query) || statusFilter !== "All";

  return (
    <div className="flex-1 flex items-center px-4 md:px-8 py-16">
      <div className="max-w-[520px]">
        {/* The mark's five bars at poster scale — one lit, four to go. */}
        <div className="flex gap-1 mb-6" aria-hidden="true">
          <span style={{ width: 64, height: 10, background: "var(--color-accent)" }} />
          <span style={{ width: 64, height: 10, background: "var(--color-neutral-300)" }} />
          <span style={{ width: 64, height: 10, background: "var(--color-neutral-300)" }} />
          <span style={{ width: 64, height: 10, background: "var(--color-neutral-300)" }} />
        </div>
        <h2 style={{ fontSize: 38, margin: "0 0 10px" }}>
          {filtered ? "Nothing matches that." : "Nothing tracked yet."}
        </h2>
        <p className="text-muted max-w-[44ch]" style={{ fontSize: 15 }}>
          {filtered
            ? "No application matches the current filter and search. Clear them to see the full list."
            : `${KIND_LABELS[kind].emptyLabel} Add the first one by hand, or bring a CSV across from a spreadsheet. Opus fills the pipeline from there.`}
        </p>
        {!filtered && (
          <>
            <div className="hr" />
            <button
              onClick={onAdd}
              className="btn btn-primary"
              style={{ letterSpacing: "0.08em" }}
            >
              + NEW APPLICATION
            </button>
          </>
        )}
      </div>
    </div>
  );
};
