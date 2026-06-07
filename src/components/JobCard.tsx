"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Status, STATUS_CONFIG, needsFollowUp } from "@/constants/generic";
import { NotesModal } from "./NotesModal";
import { ConfirmModal } from "./ConfirmModal";
import { BaseJobProps } from "@/constants/types";
import { useToast } from "@/context/ToastContext";
import { formatExactDate, formatRelativeDate } from "@/lib/date";

export const JobCard = ({ application, onUpdate, onDelete }: BaseJobProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(application);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(application.notes);
  const [linkDraft, setLinkDraft] = useState(application.link);
  const toast = useToast();

  const handleSaveEdit = async () => {
    const ok = await onUpdate(application.id, editData);
    if (!ok) {
      toast.show("Couldn't save changes", { variant: "error" });
      return;
    }
    setIsEditing(false);
    toast.show("Changes saved", { variant: "success" });
  };

  const openNotes = () => {
    setNoteDraft(application.notes);
    setLinkDraft(application.link);
    setIsNotesOpen(true);
  };

  const cfg = STATUS_CONFIG[application.status];
  const followUp = needsFollowUp(
    application.status,
    application.lastActivityAt,
  );

  if (isEditing) {
    return (
      <div className="card-glass animate-row rounded-2xl p-4 space-y-3">
        <input
          type="text"
          className="input-glass w-full px-3 py-2 rounded-lg text-sm"
          value={editData.company}
          onChange={(e) =>
            setEditData({ ...editData, company: e.target.value })
          }
          placeholder="Company"
        />
        <input
          type="text"
          className="input-glass w-full px-3 py-2 rounded-lg text-sm"
          value={editData.position}
          onChange={(e) =>
            setEditData({ ...editData, position: e.target.value })
          }
          placeholder="Position"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            className="input-glass w-full px-3 py-2 rounded-lg text-sm"
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
            <option value="Closed">Closed</option>
          </select>
          <input
            type="date"
            className="input-glass w-full px-3 py-2 rounded-lg text-sm"
            value={editData.dateApplied}
            onChange={(e) =>
              setEditData({ ...editData, dateApplied: e.target.value })
            }
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSaveEdit}
            className="btn-glass flex-1 py-2 bg-primary/80 dark:bg-secondary/70 text-white rounded-lg text-sm font-semibold border-primary/40 dark:border-secondary/40"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="btn-glass flex-1 py-2 text-secondary rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card-glass animate-row rounded-2xl p-4 hover:scale-[1.02]">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-foreground text-base leading-tight">
            {application.company}
          </h3>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${cfg.bg} ${cfg.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {application.status}
          </span>
        </div>
        <p className="text-sm text-foreground/80 mb-1">
          {application.position}
        </p>
        <div className="flex items-center gap-2 mb-3">
          <p
            className="text-xs text-foreground/60"
            title={formatExactDate(application.dateApplied)}
          >
            {formatRelativeDate(application.dateApplied)}
          </p>
          {followUp && <FollowUpPill />}
        </div>
        <div className="flex items-center gap-2 border-t border-foreground/5 pt-3">
          {application.link && <ExternalLink link={application.link} />}
          <NotesButton notes={application.notes} openNotes={openNotes} />
          <EditButton setIsEditing={setIsEditing} />
          <DeleteButton onClick={() => setIsDeleteOpen(true)} />
        </div>
      </div>
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
      {isDeleteOpen &&
        createPortal(
          <ConfirmModal
            title="Delete application?"
            message={`This will permanently remove ${application.company} — ${application.position}. This can't be undone.`}
            confirmLabel="Delete"
            onConfirm={() => {
              setIsDeleteOpen(false);
              onDelete(application.id);
            }}
            onCancel={() => setIsDeleteOpen(false)}
          />,
          document.body,
        )}
    </>
  );
};

const DeleteButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors ml-auto"
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
        />
      </svg>
    </button>
  );
};

const EditButton = ({
  setIsEditing,
}: {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <button
      onClick={() => setIsEditing(true)}
      className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
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
        />
      </svg>
    </button>
  );
};

const NotesButton = ({
  notes,
  openNotes,
}: {
  notes: string;
  openNotes: () => void;
}) => {
  return (
    <button
      onClick={openNotes}
      className={`p-2 rounded-lg transition-colors ${
        notes
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
  );
};

const ExternalLink = ({ link }: { link: string }) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
      title="Open link"
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
  );
};

const FollowUpPill = () => {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-warning/15 text-warning"
      title="No movement in a while — time to follow up"
    >
      <svg
        className="w-2.5 h-2.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Follow up
    </span>
  );
};
