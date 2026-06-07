"use client";

import { useState, useEffect } from "react";
import { JobCard } from "./JobCard";
import { createClient } from "@/lib/supabase/client";
import { createPortal } from "react-dom";
import { NewJobModal } from "./NewJobModal";
import { JobApplication } from "@/constants/types";
import { FilterOption, needsFollowUp } from "@/constants/generic";
import { useToast } from "@/context/ToastContext";
import { JobChecklistSkeleton } from "./JobChecklistSkeleton";
import { EmptyContainer } from "./EmptyContainer";
import { NavigationPanel } from "./NavigationPanel";
import { AddApplication } from "./AddApplication";
import { SearchBar } from "./SearchBar";
import { FilterPanel } from "./FilterPanel";

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
        lastActivityAt: row.updated_at ?? row.created_at ?? row.date_applied,
        notes: row.notes,
        link: row.link ?? "",
        checklist: {
          resumeSent: row.resume_sent ?? false,
          coverLetterSent: row.cover_letter_sent ?? false,
          followUpSent: row.follow_up_sent ?? false,
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
  ): Promise<boolean> => {
    const supabase = createClient();
    const dbUpdates: Record<string, unknown> = {};
    if (updates.company !== undefined) dbUpdates.company = updates.company;
    if (updates.position !== undefined) dbUpdates.position = updates.position;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.dateApplied !== undefined)
      dbUpdates.date_applied = updates.dateApplied;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.link !== undefined) dbUpdates.link = updates.link;
    if (updates.checklist !== undefined) {
      dbUpdates.resume_sent = updates.checklist.resumeSent;
      dbUpdates.cover_letter_sent = updates.checklist.coverLetterSent;
      dbUpdates.follow_up_sent = updates.checklist.followUpSent;
    }

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

    if (error) return false;

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
    if (error) return;
    if (!error) {
      setApplications((apps) => apps.filter((app) => app.id !== id));
      toast.show("Application deleted", {
        variant: "error",
      });
    }
  };

  const addNewJob = async (
    newJobData: Omit<JobApplication, "id" | "lastActivityAt">,
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
        resume_sent: newJobData.checklist.resumeSent,
        cover_letter_sent: newJobData.checklist.coverLetterSent,
        follow_up_sent: newJobData.checklist.followUpSent,
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
      lastActivityAt: data.updated_at ?? data.created_at ?? data.date_applied,
      notes: data.notes,
      link: data.link ?? "",
      checklist: {
        resumeSent: data.resume_sent ?? false,
        coverLetterSent: data.cover_letter_sent ?? false,
        followUpSent: data.follow_up_sent ?? false,
      },
    };
    setApplications((apps) => [newJob, ...apps]);
    // Clear any active filter/search so the new card is always visible.
    setStatusFilter("All");
    setSearchQuery("");
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
          ? needsFollowUp(a.status, a.lastActivityAt)
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
        <AddApplication setIsModalOpen={setIsModalOpen} />
      </div>
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="glass-well rounded-2xl p-4">
          <div
            key={`${statusFilter}-${query}-${currentPage}`}
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
