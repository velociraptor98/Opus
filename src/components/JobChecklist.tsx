"use client";

import { useState, useEffect } from "react";
import { JobCard } from "./JobCard";
import { createClient } from "@/lib/supabase/client";
import { createPortal } from "react-dom";
import { NewJobModal } from "./NewJobModal";
import { JobApplication } from "@/constants/types";

const JobChecklist = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    return { error: null };
  };

  if (!isMounted) return null;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex justify-end items-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-secondary text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-secondary/20 hover:bg-secondary/90 active:scale-95 flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 4v16m8-8H4"
            ></path>
          </svg>
          Add Application
        </button>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 ">
        {applications.length > 0 ? (
          applications.map((app) => (
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
