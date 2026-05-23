"use client";

import React, { useState, useEffect } from "react";
import { JobRow } from "./JobRow";

type Status = "Pending" | "Applied" | "Interviewing" | "Offered" | "Rejected";

export interface JobApplication {
  id: number;
  company: string;
  position: string;
  status: Status;
  dateApplied: string;
  checklist: {
    resumeSent: boolean;
    coverLetterSent: boolean;
    followUpSent: boolean;
  };
}

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (job: Omit<JobApplication, "id">) => void;
}

const NewJobModal = ({ isOpen, onClose, onAdd }: NewJobModalProps) => {
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    status: "Pending" as Status,
    dateApplied: new Date().toISOString().split("T")[0],
    checklist: {
      resumeSent: false,
      coverLetterSent: false,
      followUpSent: false,
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      company: "",
      position: "",
      status: "Pending",
      dateApplied: new Date().toISOString().split("T")[0],
      checklist: {
        resumeSent: false,
        coverLetterSent: false,
        followUpSent: false,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
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
              className="flex-1 px-4 py-2 bg-primary dark:bg-secondary text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-colors font-semibold shadow-md shadow-primary/20"
            >
              Add Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const STATUS_CONFIG: Record<
  Status,
  { dot: string; bg: string; text: string }
> = {
  Applied: {
    dot: "bg-secondary",
    bg: "bg-secondary/10",
    text: "text-secondary",
  },
  Interviewing: {
    dot: "bg-warning",
    bg: "bg-warning/10",
    text: "text-warning",
  },
  Offered: { dot: "bg-primary", bg: "bg-primary/10", text: "text-primary" },
  Rejected: { dot: "bg-error", bg: "bg-error/10", text: "text-error" },
  Pending: {
    dot: "bg-foreground/30",
    bg: "bg-foreground/5",
    text: "text-foreground/50",
  },
};

const JobChecklist = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveFlash, setSaveFlash] = useState<"idle" | "saved">("idle");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("jobApplications");
    if (saved) {
      setApplications(JSON.parse(saved));
    } else {
      setApplications([
        {
          id: 1,
          company: "Tech Corp",
          position: "Frontend Engineer",
          status: "Applied",
          dateApplied: "2023-10-01",
          checklist: {
            resumeSent: true,
            coverLetterSent: true,
            followUpSent: false,
          },
        },
        {
          id: 2,
          company: "Nexus Systems",
          position: "Software Architect",
          status: "Interviewing",
          dateApplied: "2023-10-05",
          checklist: {
            resumeSent: true,
            coverLetterSent: true,
            followUpSent: true,
          },
        },
        {
          id: 3,
          company: "Cloud Scale",
          position: "Fullstack Developer",
          status: "Pending",
          dateApplied: "2023-10-10",
          checklist: {
            resumeSent: true,
            coverLetterSent: false,
            followUpSent: false,
          },
        },
        {
          id: 4,
          company: "Vertex AI",
          position: "ML Engineer",
          status: "Offered",
          dateApplied: "2023-09-20",
          checklist: {
            resumeSent: true,
            coverLetterSent: true,
            followUpSent: true,
          },
        },
        {
          id: 5,
          company: "Blue Wave",
          position: "Product Designer",
          status: "Rejected",
          dateApplied: "2023-09-15",
          checklist: {
            resumeSent: true,
            coverLetterSent: true,
            followUpSent: false,
          },
        },
        {
          id: 6,
          company: "Green Field",
          position: "Backend Developer",
          status: "Pending",
          dateApplied: "2023-10-12",
          checklist: {
            resumeSent: false,
            coverLetterSent: false,
            followUpSent: false,
          },
        },
        {
          id: 7,
          company: "Nova Labs",
          position: "QA Engineer",
          status: "Pending",
          dateApplied: "2023-10-15",
          checklist: {
            resumeSent: true,
            coverLetterSent: false,
            followUpSent: false,
          },
        },
        {
          id: 8,
          company: "Silver Tech",
          position: "DevOps Engineer",
          status: "Pending",
          dateApplied: "2023-10-18",
          checklist: {
            resumeSent: false,
            coverLetterSent: false,
            followUpSent: false,
          },
        },
      ]);
    }
    setIsMounted(true);
  }, []);

  const saveToLocalStorage = () => {
    localStorage.setItem("jobApplications", JSON.stringify(applications));
    setSaveFlash("saved");
    setTimeout(() => setSaveFlash("idle"), 2000);
  };

  const updateApplication = (id: number, updates: Partial<JobApplication>) => {
    setApplications((apps) =>
      apps.map((app) => (app.id === id ? { ...app, ...updates } : app)),
    );
  };

  const deleteApplication = (id: number) => {
    setApplications((apps) => apps.filter((app) => app.id !== id));
  };

  const addNewJob = (newJobData: Omit<JobApplication, "id">) => {
    const newJob: JobApplication = {
      ...newJobData,
      id: Date.now(),
    };
    setApplications([newJob, ...applications]);
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
                    Actions & Checklist
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
                          No applications found. Add your first one!
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
          onClick={saveToLocalStorage}
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
