"use client";

import { useState, useEffect } from "react";
import { JobCard } from "./JobCard";
import { createClient } from "@/lib/supabase/client";
import { createPortal } from "react-dom";
import { NewJobModal } from "./NewJobModal";
import { JobApplication } from "@/constants/types";
import { Status, needsFollowUp } from "@/constants/generic";
import { useToast } from "@/context/ToastContext";
import { JobChecklistSkeleton } from "./JobChecklistSkeleton";
import { EmptyContainer } from "./EmptyContainer";
import { NavigationPanel } from "./NavigationPanel";

type FilterOption = "All" | "Follow-up" | Status;

const FILTER_OPTIONS: FilterOption[] = [
  "All",
  "Follow-up",
  "Applied",
  "Interviewing",
  "Offered",
  "Rejected",
  "Pending",
];

const FOLLOW_UP_COLOR = "var(--color-warning)";

const STATUS_COLORS: Record<Status, string> = {
  Applied: "var(--color-secondary)",
  Interviewing: "var(--color-warning)",
  Offered: "var(--color-primary)",
  Rejected: "var(--color-error)",
  Pending: "color-mix(in srgb, var(--color-foreground) 60%, transparent)",
};

const PAGE_SIZE = 8;

const JobChecklist = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<FilterOption>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const fetchJobs = async (): Promise<JobApplication[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("applications")
      .select()
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(
      (row): JobApplication => ({
        id: row.id,
        company: row.company,
        position: row.position,
        status: row.status,
        dateApplied: row.date_applied,
        notes: row.notes,
        link: row.link ?? "",
        checklist: {
          resumeSent: false,
          coverLetterSent: false,
          followUpSent: false,
        },
      }),
    );
  };

  useEffect(() => {
    (async () => {
      const jobs = await fetchJobs();
      setApplications(jobs);
      setIsMounted(true);
    })();
  }, []);

  const updateApplication = async (
    id: string,
    updates: Partial<JobApplication>,
  ) => {
    const supabase = createClient();
    const dbUpdates: Record<string, unknown> = {};
    if (updates.company !== undefined) dbUpdates.company = updates.company;
    if (updates.position !== undefined) dbUpdates.position = updates.position;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.dateApplied !== undefined)
      dbUpdates.date_applied = updates.dateApplied;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.link !== undefined) dbUpdates.link = updates.link;

    const { error } = await supabase
      .from("applications")
      .update(dbUpdates)
      .eq("id", id);

    if (!error) {
      setApplications((apps) =>
        apps.map((app) => (app.id === id ? { ...app, ...updates } : app)),
      );
    }
  };

  const deleteApplication = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) return;
    if (!error) {
      setApplications((apps) => apps.filter((app) => app.id !== id));
      toast.show("Application deleted", {
        variant: "error",
      });
    }
  };

  const addNewJob = async (
    newJobData: Omit<JobApplication, "id">,
  ): Promise<{ error: string | null }> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("applications")
      .insert({
        company: newJobData.company,
        position: newJobData.position,
        status: newJobData.status,
        date_applied: newJobData.dateApplied,
        notes: newJobData.notes,
        link: newJobData.link,
      })
      .select()
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Failed to create application" };
    }

    const newJob: JobApplication = {
      id: data.id,
      company: data.company,
      position: data.position,
      status: data.status,
      dateApplied: data.date_applied,
      notes: data.notes,
      link: data.link ?? "",
      checklist: newJobData.checklist,
    };
    setApplications((apps) => [newJob, ...apps]);
    setPage(0);
    toast.show("Application added", { variant: "success" });
    return { error: null };
  };

  if (!isMounted) return <JobChecklistSkeleton />;

  const query = searchQuery.trim().toLowerCase();
  const filtered = applications.filter((a) => {
    const matchesStatus =
      statusFilter === "All"
        ? true
        : statusFilter === "Follow-up"
          ? needsFollowUp(a.status, a.dateApplied)
          : a.status === statusFilter;
    const matchesQuery =
      query === "" ||
      a.company.toLowerCase().includes(query) ||
      a.position.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 md:items-start">
      {/* Left column: filter strip + add button */}
      <div className="md:shrink-0 flex flex-col gap-2">
        {/* Filter strip — horizontal scrolling row on mobile, sticky vertical sidebar on desktop */}
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
                        color:
                          "color-mix(in srgb, currentColor 55%, transparent)",
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

        {/* Search — filter by company name or job role */}
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search company or role"
            aria-label="Search applications by company or role"
            className="input-glass w-full h-10 pl-9 pr-8 rounded-full text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPage(0);
              }}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-foreground/40 hover:text-foreground transition-colors active:scale-90"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Add application button */}
        <button
          onClick={() => setIsModalOpen(true)}
          title="Add Application"
          className="btn-glass w-full h-10 rounded-full flex items-center justify-center text-secondary transition-all duration-200 active:scale-95 hover:scale-[1.03]"
          style={{
            background:
              "color-mix(in srgb, var(--color-secondary) 10%, transparent)",
            boxShadow:
              "inset 0 0 0 1.5px color-mix(in srgb, var(--color-secondary) 30%, transparent)",
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* Cards + pagination */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="glass-well rounded-2xl p-4">
          <div
            key={`${statusFilter}-${query}-${currentPage}`}
            className={`grid grid-cols-1 md:grid-cols-${paginated.length > 0 ? 2 : 1} gap-3`}
          >
            {paginated.length > 0 ? (
              paginated.map((app, i) => (
                <div
                  key={app.id}
                  className="animate-card"
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  <JobCard
                    application={app}
                    onUpdate={updateApplication}
                    onDelete={deleteApplication}
                  />
                </div>
              ))
            ) : (
              <EmptyContainer query={query} statusFilter={statusFilter} />
            )}
          </div>
        </div>
        <NavigationPanel
          totalPages={totalPages}
          currentPage={currentPage}
          setPage={setPage}
        />
      </div>
      {createPortal(
        <NewJobModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={addNewJob}
        />,
        document.body,
      )}
    </div>
  );
};

export default JobChecklist;
