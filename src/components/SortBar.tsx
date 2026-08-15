import { SORT_OPTIONS, SortOption } from "@/constants/generic";
import React from "react";

/** The sort cell of the filter band — same borderless treatment as search. */
export const SortBar = ({
  sort,
  setSort,
  setPage,
}: {
  sort: SortOption;
  setSort: React.Dispatch<React.SetStateAction<SortOption>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) => {
  return (
    <label className="flex items-center gap-2.5 px-4 border-l border-line min-h-[46px]">
      <span className="eyebrow text-muted shrink-0">Sort</span>
      <select
        value={sort}
        onChange={(e) => {
          setSort(e.target.value as SortOption);
          setPage(0);
        }}
        aria-label="Sort applications"
        className="input-bare cursor-pointer"
        style={{ fontSize: 13 }}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};
