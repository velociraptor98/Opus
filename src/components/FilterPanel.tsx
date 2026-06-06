import {
  FILTER_OPTIONS,
  FilterOption,
  FOLLOW_UP_COLOR,
  needsFollowUp,
  Status,
  STATUS_COLORS,
} from "@/constants/generic";
import { JobApplication } from "@/constants/types";
import React from "react";

export const FilterPanel = ({
  statusFilter,
  setStatusFilter,
  setPage,
  applications,
}: {
  statusFilter: string;
  setStatusFilter: React.Dispatch<React.SetStateAction<FilterOption>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  applications: JobApplication[];
}) => {
  return (
    <div className="filter-strip-glass sticky top-18 z-40 rounded-2xl p-1.5 md:p-2 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible scrollbar-none [&::-webkit-scrollbar]:hidden">
      {FILTER_OPTIONS.map((option) => {
        const isActive = statusFilter === option;
        const color =
          option === "All"
            ? undefined
            : option === "Follow-up"
              ? FOLLOW_UP_COLOR
              : STATUS_COLORS[option as Status];
        return (
          <button
            key={option}
            onClick={() => {
              setStatusFilter(option);
              setPage(0);
            }}
            className="shrink-0 md:shrink flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 rounded-full md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 active:scale-95 md:w-full"
            style={
              isActive
                ? {
                    background: color
                      ? `color-mix(in srgb, ${color} 14%, transparent)`
                      : "rgba(0,0,0,0.08)",
                    boxShadow: color
                      ? `inset 0 0 0 1.5px color-mix(in srgb, ${color} 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.5)`
                      : "inset 0 0 0 1.5px rgba(0,0,0,0.15)",
                    color: color ?? "inherit",
                  }
                : {
                    background: "rgba(255,255,255,0.0)",
                    color: "color-mix(in srgb, currentColor 55%, transparent)",
                  }
            }
          >
            {option !== "All" && (
              <span
                className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shrink-0"
                style={{ background: color }}
              />
            )}
            <span className="md:flex-1 md:text-left">{option}</span>
            <span
              className="text-xs font-medium opacity-75 tabular-nums"
              style={isActive && color ? { color } : undefined}
            >
              {option === "All"
                ? applications.length
                : option === "Follow-up"
                  ? applications.filter((a) =>
                      needsFollowUp(a.status, a.dateApplied),
                    ).length
                  : applications.filter((a) => a.status === option).length}
            </span>
          </button>
        );
      })}
    </div>
  );
};
