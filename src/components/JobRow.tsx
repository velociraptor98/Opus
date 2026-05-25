import { JobApplication, Status, STATUS_CONFIG } from "@/constants/generic";
import { useState } from "react";
import { createPortal } from "react-dom";
import { NotesModal } from "./NotesModal";

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
  const [linkDraft, setLinkDraft] = useState(application.link);

  const handleSaveEdit = () => {
    onUpdate(application.id, editData);
    setIsEditing(false);
  };

  const openNotes = () => {
    setNoteDraft(application.notes);
    setLinkDraft(application.link);
    setIsNotesOpen(true);
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
    <tr className="animate-row hover:bg-foreground/5 dark:hover:bg-foreground/5 transition-colors border-b border-foreground/5 dark:border-foreground/5 last:border-0">
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
        <div className="flex gap-3">
          {application.link && (
            <a
              href={application.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
              title="Launch Application"
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
          <button
            onClick={openNotes}
            className={`p-1.5 rounded-lg transition-colors ${
              application.notes
                ? "text-primary bg-primary/10 hover:bg-primary/20"
                : "text-secondary hover:bg-secondary/10"
            }`}
            title="Notes & checklist"
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
      </td>
      {isNotesOpen &&
        createPortal(
          <NotesModal
            application={application}
            onUpdate={onUpdate}
            onDelete={onDelete}
            noteDraft={noteDraft}
            setNoteDraft={setNoteDraft}
            linkDraft={linkDraft}
            setLinkDraft={setLinkDraft}
            setIsNotesOpen={setIsNotesOpen}
          />,
          document.body,
        )}
    </tr>
  );
};
