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
  statusFilter: FilterOption;
  setStatusFilter: React.Dispatch<React.SetStateAction<FilterOption>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  applications: JobApplication[];
}) => {
  return (
    <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible scrollbar-none [&::-webkit-scrollbar]:hidden">
      {FILTER_OPTIONS.map((option) => {
        const isActive = statusFilter === option;
        const color =
          option === "All"
            ? undefined
            : option === "Follow-up"
              ? FOLLOW_UP_COLOR
              : STATUS_COLORS[option as Status];
        // "All" has no status colour of its own, so it tints from the theme's
        // foreground — a hardcoded black here disappears in dark mode.
        const tint = color ?? "var(--color-foreground)";
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
                    background: `color-mix(in srgb, ${tint} 14%, transparent)`,
                    boxShadow: `inset 0 0 0 1.5px color-mix(in srgb, ${tint} 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.5)`,
                    color: tint,
                  }
                : {
                    background: "transparent",
                    color: "color-mix(in srgb, currentColor 75%, transparent)",
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
                      needsFollowUp(a.status, a.lastActivityAt, a.nextActionDate),
                    ).length
                  : applications.filter((a) => a.status === option).length}
            </span>
          </button>
        );
      })}
    </div>
  );
};
