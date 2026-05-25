import { Status } from "@/constants/generic";
import { JobApplication } from "@/constants/types";
import { useState } from "react";

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (job: Omit<JobApplication, "id">) => Promise<{ error: string | null }>;
}

export const NewJobModal = ({ isOpen, onClose, onAdd }: NewJobModalProps) => {
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
