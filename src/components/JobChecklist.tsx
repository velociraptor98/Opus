"use client";

import { useState, useEffect } from "react";
import { JobCard } from "./JobCard";
import { createClient } from "@/lib/supabase/client";
import { createPortal } from "react-dom";
import { NewJobModal } from "./NewJobModal";
import { JobApplication } from "@/constants/types";

interface JobChecklistProps {
  isModalOpen: boolean;
  onModalClose: () => void;
}

const PAGE_SIZE = 8;

const JobChecklist = ({ isModalOpen, onModalClose }: JobChecklistProps) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [page, setPage] = useState(0);

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

  const deleteApplication = (id: string) => {
    setApplications((apps) => apps.filter((app) => app.id !== id));
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
    return { error: null };
  };

  if (!isMounted) return null;

  const totalPages = Math.max(1, Math.ceil(applications.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginated = applications.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="bg-foreground/[0.03] dark:bg-white/[0.03] rounded-2xl border border-foreground/5 p-4 shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paginated.length > 0 ? (
            paginated.map((app) => (
              <JobCard
                key={app.id}
                application={app}
                onUpdate={updateApplication}
                onDelete={deleteApplication}
              />
            ))
          ) : (
            <div className="py-12 text-center text-primary/40 dark:text-zinc-500 flex flex-col items-center gap-2">
              <svg
                className="w-12 h-12 opacity-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="font-medium italic">No applications created</p>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            ← Prev
          </button>
          <span className="text-sm text-foreground/40 font-medium">
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            Next →
          </button>
        </div>
      )}
      {createPortal(
        <NewJobModal
          isOpen={isModalOpen}
          onClose={onModalClose}
          onAdd={addNewJob}
        />,
        document.body,
      )}
    </div>
  );
};

export default JobChecklist;
