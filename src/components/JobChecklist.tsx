"use client";

import React, { useState, useEffect } from "react";
import { JobRow } from "./JobRow";
import { JobApplication, Status } from "@/constants/generic";
import { createClient } from "@/lib/supabase/client";

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (job: Omit<JobApplication, "id">) => Promise<{ error: string | null }>;
}

const NewJobModal = ({ isOpen, onClose, onAdd }: NewJobModalProps) => {
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    status: "Pending" as Status,
    dateApplied: new Date().toISOString().split("T")[0],
    notes: "",
    link: "",
    checklist: {
      resumeSent: false,
      coverLetterSent: false,
      followUpSent: false,
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: addError } = await onAdd(formData);

    if (addError) {
      setError(addError);
      setSubmitting(false);
      return;
    }

    setFormData({
      company: "",
      position: "",
      status: "Pending",
      dateApplied: new Date().toISOString().split("T")[0],
      notes: "",
      link: "",
      checklist: {
        resumeSent: false,
        coverLetterSent: false,
        followUpSent: false,
      },
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="animate-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="animate-modal bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-primary dark:text-primary">
            Add New Job Application
          </h3>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 animate-shake">
              <svg
                className="w-5 h-5 text-error flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-error font-medium text-sm">{error}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-primary/80 dark:text-secondary mb-1">
              Company
            </label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 border border-secondary/30 rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              placeholder="e.g. Google"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary/80 dark:text-secondary mb-1">
              Position
            </label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 border border-secondary/30 rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary/80 dark:text-secondary mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-secondary/30 rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Status })
                }
              >
                <option value="Pending">Pending</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary/80 dark:text-secondary mb-1">
                Date Applied
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-secondary/30 rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all"
                value={formData.dateApplied}
                onChange={(e) =>
                  setFormData({ ...formData, dateApplied: e.target.value })
                }
              />
            </div>
          </div>
          <div className="pt-4 border-t border-secondary/10 dark:border-zinc-800 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-secondary/30 text-secondary rounded-lg hover:bg-secondary/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-primary dark:bg-secondary text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-colors font-semibold shadow-md shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding…" : "Add Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const JobChecklist = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveFlash] = useState<"idle" | "saved">("idle");

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

      <div className="relative group">
        {/* Table Elevation Container */}
        <div className="overflow-hidden bg-white dark:bg-[#343f44] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-foreground/5 dark:border-foreground/5">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-foreground/5 dark:bg-foreground/5 backdrop-blur-sm border-b border-foreground/5 dark:border-foreground/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 dark:text-foreground/50 uppercase tracking-widest">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 dark:text-foreground/50 uppercase tracking-widest">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 dark:text-foreground/50 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 dark:text-foreground/50 uppercase tracking-widest">
                    Date Applied
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-foreground/50 dark:text-foreground/50 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5 dark:divide-foreground/5">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <JobRow
                      key={app.id}
                      application={app}
                      onUpdate={updateApplication}
                      onDelete={deleteApplication}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-primary/40 dark:text-zinc-500"
                    >
                      <div className="flex flex-col items-center gap-2">
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
                          ></path>
                        </svg>
                        <p className="font-medium italic">
                          No applications created
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          className={`group relative px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2 ${
            saveFlash === "saved"
              ? "bg-primary/15 text-primary border border-primary/30 shadow-none"
              : "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90"
          }`}
        >
          {saveFlash === "saved" ? (
            <>
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
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              Saved
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                ></path>
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>

      <NewJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addNewJob}
      />
    </div>
  );
};

export default JobChecklist;
