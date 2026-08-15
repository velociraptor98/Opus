import { ApplicationKind, KIND_LABELS } from "@/constants/kind";

/**
 * The search cell of the filter band. Borderless by design — the band's own
 * rules already draw the cell, so a bordered input inside one would double
 * every edge.
 */
export const SearchBar = ({
  searchQuery,
  setSearchQuery,
  setPage,
  kind,
}: {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  kind: ApplicationKind;
}) => {
  const placeholder = KIND_LABELS[kind].searchPlaceholder;
  return (
    <label className="flex flex-1 items-center gap-2.5 px-4 md:px-8 min-h-[46px]">
      <span className="eyebrow text-muted shrink-0">Search</span>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setPage(0);
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="input-bare flex-1"
      />
    </label>
  );
};
