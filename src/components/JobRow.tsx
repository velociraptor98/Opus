import { JobApplication, Status, STATUS_CONFIG } from "@/constants/generic";
import { useState } from "react";

export interface JobRowProps {
  application: JobApplication;
  onUpdate: (id: string, updates: Partial<JobApplication>) => void;
  onDelete: (id: string) => void;
}

export const JobRow = ({ application, onUpdate, onDelete }: JobRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(application);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(application.notes);

  const handleToggleChecklist = (field: keyof JobApplication["checklist"]) => {
    onUpdate(application.id, {
      checklist: {
        ...application.checklist,
        [field]: !application.checklist[field],
      },
    });
  };

  const handleSaveEdit = () => {
    onUpdate(application.id, editData);
    setIsEditing(false);
  };

  const openNotes = () => {
    setNoteDraft(application.notes);
    setIsNotesOpen(true);
  };

  const handleSaveNotes = () => {
    onUpdate(application.id, { notes: noteDraft });
    setIsNotesOpen(false);
  };

  if (isEditing) {
    return (
      <tr className="bg-blue-50/30 dark:bg-blue-900/10 transition-colors">
        <td className="px-6 py-4">
          <input
            type="text"
            className="w-full px-2 py-1 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            value={editData.company}
            onChange={(e) =>
              setEditData({ ...editData, company: e.target.value })
            }
          />
        </td>
        <td className="px-6 py-4">
          <input
            type="text"
            className="w-full px-2 py-1 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            value={editData.position}
            onChange={(e) =>
              setEditData({ ...editData, position: e.target.value })
            }
          />
        </td>
        <td className="px-6 py-4">
          <select
            className="w-full px-2 py-1 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            value={editData.status}
            onChange={(e) =>
              setEditData({ ...editData, status: e.target.value as Status })
            }
          >
            <option value="Pending">Pending</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </td>
        <td className="px-6 py-4">
          <input
            type="date"
            className="w-full px-2 py-1 border rounded dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            value={editData.dateApplied}
            onChange={(e) =>
              setEditData({ ...editData, dateApplied: e.target.value })
            }
          />
        </td>
        <td className="px-6 py-4">
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="text-green-600 hover:text-green-700 font-medium text-sm px-2 py-1"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-500 hover:text-gray-600 font-medium text-sm px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-foreground/5 dark:hover:bg-foreground/5 transition-colors border-b border-foreground/5 dark:border-foreground/5 last:border-0">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground dark:text-foreground">
        {application.company}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70 dark:text-foreground/60">
        {application.position}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {(() => {
          const cfg = STATUS_CONFIG[application.status];
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {application.status}
            </span>
          );
        })()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70 dark:text-foreground/60">
        {application.dateApplied}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70 dark:text-foreground/60">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={application.checklist.resumeSent}
                onChange={() => handleToggleChecklist("resumeSent")}
                className="rounded border-foreground/20 text-primary focus:ring-primary cursor-pointer"
              />
              <span className="group-hover:text-primary transition-colors text-xs uppercase tracking-wider font-semibold opacity-70">
                Resume
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={application.checklist.coverLetterSent}
                onChange={() => handleToggleChecklist("coverLetterSent")}
                className="rounded border-foreground/20 text-primary focus:ring-primary cursor-pointer"
              />
              <span className="group-hover:text-primary transition-colors text-xs uppercase tracking-wider font-semibold opacity-70">
                Cover Letter
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={application.checklist.followUpSent}
                onChange={() => handleToggleChecklist("followUpSent")}
                className="rounded border-foreground/20 text-primary focus:ring-primary cursor-pointer"
              />
              <span className="group-hover:text-primary transition-colors text-xs uppercase tracking-wider font-semibold opacity-70">
                Follow-up
              </span>
            </label>
          </div>
          <div className="flex gap-3 ml-8">
            <button
              onClick={openNotes}
              className={`p-1.5 rounded-lg transition-colors ${
                application.notes
                  ? "text-primary bg-primary/10 hover:bg-primary/20"
                  : "text-secondary hover:bg-secondary/10"
              }`}
              title={application.notes ? "View notes" : "Add notes"}
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
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
              title="Edit"
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
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                ></path>
              </svg>
            </button>
            <button
              onClick={() => onDelete(application.id)}
              className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
              title="Delete"
            >
              {" "}
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>
        {isNotesOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setIsNotesOpen(false)}
          >
            <div
              className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-primary dark:text-primary">
                  Notes — {application.company}
                </h3>
                <button
                  onClick={() => setIsNotesOpen(false)}
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
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Add notes about this application…"
                  rows={6}
                  className="w-full px-3 py-2 border border-secondary/30 rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all resize-y"
                  autoFocus
                />
                <div className="pt-4 border-t border-secondary/10 dark:border-zinc-800 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNotesOpen(false)}
                    className="flex-1 px-4 py-2 border border-secondary/30 text-secondary rounded-lg hover:bg-secondary/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="flex-1 px-4 py-2 bg-primary dark:bg-secondary text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-colors font-semibold shadow-md shadow-primary/20"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
};
