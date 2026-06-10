"use client";

import { useState, useEffect, useCallback } from "react";
import { JobCard } from "./JobCard";
import { createClient } from "@/lib/supabase/client";
import { createPortal } from "react-dom";
import { NewJobModal } from "./NewJobModal";
import { JobApplication } from "@/constants/types";
import {
  FilterOption,
  needsFollowUp,
  SortOption,
  sortApplications,
  Status,
} from "@/constants/generic";
import {
  mapRowToApplication,
  toInsertRow,
  toUpdateRow,
} from "@/lib/applications";
import { useToast } from "@/context/ToastContext";
import { JobChecklistSkeleton } from "./JobChecklistSkeleton";
import { EmptyContainer } from "./EmptyContainer";
import { NavigationPanel } from "./NavigationPanel";
import { AddApplication } from "./AddApplication";
import { SearchBar } from "./SearchBar";
import { FilterPanel } from "./FilterPanel";
import { SortBar } from "./SortBar";
import { ImportExport } from "./ImportExport";
import { UpcomingStrip } from "./UpcomingStrip";

const PAGE_SIZE = 8;

const JobChecklist = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<FilterOption>("All");
  const [sort, setSort] = useState<SortOption>("Recently added");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const fetchJobs = useCallback(async (): Promise<JobApplication[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("applications")
      .select()
      .order("created_at", { ascending: false });

    if (error) {
      toast.show(error.message || "Couldn't load applications", {
        variant: "error",
      });
      return [];
    }
    if (!data) {
      return [];
    }

    return data.map(mapRowToApplication);
  }, [toast]);

  useEffect(() => {
    (async () => {
      const jobs = await fetchJobs();
      setApplications(jobs);
      setIsMounted(true);
    })();
  }, [fetchJobs]);

  // Best-effort history trail: a failed insert (e.g. migration not yet run)
  // must never block the actual update.
  const logStatusEvent = async (
    applicationId: string,
    fromStatus: Status | null,
    toStatus: Status,
  ) => {
    const supabase = createClient();
    const { error } = await supabase.from("application_events").insert({
      application_id: applicationId,
      from_status: fromStatus,
      to_status: toStatus,
    });
    if (error) {
      console.warn("Couldn't record status history:", error.message);
    }
  };

  const updateApplication = async (
    id: string,
    updates: Partial<JobApplication>,
  ): Promise<boolean> => {
    const supabase = createClient();
    const dbUpdates = toUpdateRow(updates);

    // A status move, or marking a follow-up as just sent, counts as activity —
    // reset the follow-up clock. Only the transition to checked counts, so
    // unchecking it (or toggling the other checklist items) won't reset it.
    const prev = applications.find((app) => app.id === id);
    const followUpJustSent =
      updates.checklist?.followUpSent === true &&
      prev?.checklist.followUpSent === false;
    const activityStamp =
      updates.status !== undefined || followUpJustSent
        ? new Date().toISOString()
        : null;
    if (activityStamp) dbUpdates.updated_at = activityStamp;

    const { error } = await supabase
      .from("applications")
      .update(dbUpdates)
      .eq("id", id);

    if (error) {
      toast.show(error.message || "Couldn't save changes", { variant: "error" });
      return false;
    }

    if (updates.status !== undefined && prev && updates.status !== prev.status) {
      logStatusEvent(id, prev.status, updates.status);
    }

    setApplications((apps) =>
      apps.map((app) =>
        app.id === id
          ? {
              ...app,
              ...updates,
              ...(activityStamp ? { lastActivityAt: activityStamp } : {}),
            }
          : app,
      ),
    );
    return true;
  };

  const deleteApplication = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) {
      toast.show(error.message || "Couldn't delete application", {
        variant: "error",
      });
      return;
    }
    setApplications((apps) => apps.filter((app) => app.id !== id));
    toast.show("Application deleted", { variant: "success" });
  };

  const addNewJob = async (
    newJobData: Omit<JobApplication, "id" | "lastActivityAt">,
  ): Promise<{ error: string | null }> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("applications")
      .insert(toInsertRow(newJobData))
      .select()
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Failed to create application" };
    }

    const newJob = mapRowToApplication(data);
    logStatusEvent(newJob.id, null, newJob.status);
    setApplications((apps) => [newJob, ...apps]);
    // Clear any active filter/search/sort so the new card surfaces at the top.
    setStatusFilter("All");
    setSearchQuery("");
    setSort("Recently added");
    setPage(0);
    toast.show("Application added", { variant: "success" });
    return { error: null };
  };

  const importApplications = async (
    jobs: Omit<JobApplication, "id" | "lastActivityAt">[],
  ): Promise<{ added: number; error: string | null }> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("applications")
      .insert(jobs.map(toInsertRow))
      .select();

    if (error || !data) {
      return { added: 0, error: error?.message ?? "Import failed" };
    }

    const imported = data.map(mapRowToApplication);
    // Seed the history trail in one call rather than per-row inserts.
    const { error: eventsError } = await supabase
      .from("application_events")
      .insert(
        imported.map((job) => ({
          application_id: job.id,
          from_status: null,
          to_status: job.status,
        })),
      );
    if (eventsError) {
      console.warn("Couldn't record status history:", eventsError.message);
    }

    setApplications((apps) => [...imported, ...apps]);
    setStatusFilter("All");
    setSearchQuery("");
    setSort("Recently added");
    setPage(0);
    return { added: imported.length, error: null };
  };

  if (!isMounted) return <JobChecklistSkeleton />;

  const query = searchQuery.trim().toLowerCase();
  const filtered = applications.filter((a) => {
    const matchesStatus =
      statusFilter === "All"
        ? true
        : statusFilter === "Follow-up"
          ? needsFollowUp(a.status, a.lastActivityAt, a.nextActionDate)
          : a.status === statusFilter;
    const matchesQuery =
      query === "" ||
      a.company.toLowerCase().includes(query) ||
      a.position.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });

  const sorted = sortApplications(filtered, sort);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginated = sorted.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 md:items-start">
      <div className="md:shrink-0 flex flex-col gap-2">
        <FilterPanel
          setPage={setPage}
          setStatusFilter={setStatusFilter}
          statusFilter={statusFilter}
          applications={applications}
        />
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
        />
        <SortBar sort={sort} setSort={setSort} setPage={setPage} />
        <AddApplication setIsModalOpen={setIsModalOpen} />
        <ImportExport applications={applications} onImport={importApplications} />
      </div>
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <UpcomingStrip applications={applications} />
        <div className="glass-well rounded-2xl p-4">
          <div
            key={`${statusFilter}-${sort}-${query}-${currentPage}`}
            className={`grid grid-cols-1 gap-3 ${paginated.length > 0 ? "md:grid-cols-2" : "md:grid-cols-1"}`}
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
