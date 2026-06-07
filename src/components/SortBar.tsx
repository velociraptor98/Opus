import { SORT_OPTIONS, SortOption } from "@/constants/generic";
import React from "react";

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
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 7h18M6 12h12M10 17h4"
        />
      </svg>
      <select
        value={sort}
        onChange={(e) => {
          setSort(e.target.value as SortOption);
          setPage(0);
        }}
        aria-label="Sort applications"
        className="input-glass w-full h-10 pl-9 pr-8 rounded-full text-sm appearance-none cursor-pointer"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
};
