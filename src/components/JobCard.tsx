"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Status,
  STATUS_CONFIG,
  STATUS_OPTIONS,
  needsFollowUp,
} from "@/constants/generic";
import { NotesModal } from "./NotesModal";
import { ConfirmModal } from "./ConfirmModal";
import { BaseJobProps, JobApplication } from "@/constants/types";
import { useToast } from "@/context/ToastContext";
import { daysSince, formatExactDate, formatRelativeDate } from "@/lib/date";

export const JobCard = ({ application, onUpdate, onDelete }: BaseJobProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(application);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const toast = useToast();

  const handleSaveEdit = async () => {
    const ok = await onUpdate(application.id, editData);
    // The specific failure reason is surfaced by onUpdate itself.
    if (!ok) return;
    setIsEditing(false);
    toast.show("Changes saved", { variant: "success" });
  };

  const handleQuickStatusChange = async (status: Status) => {
    if (status === application.status) return;
    const ok = await onUpdate(application.id, { status });
    // The specific failure reason is surfaced by onUpdate itself.
    if (!ok) return;
    toast.show(`Moved to ${status}`, { variant: "success" });
  };

  const followUp = needsFollowUp(
    application.status,
    application.lastActivityAt,
    application.nextActionDate,
  );
  const detailLine = [application.location, application.salary]
    .filter(Boolean)
    .join(" · ");

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
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
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
        <div className="flex items-start gap-3 mb-1">
          <CompanyAvatar company={application.company} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-foreground text-base leading-tight">
                {application.company}
              </h3>
              <StatusPill
                status={application.status}
                onChange={handleQuickStatusChange}
              />
            </div>
            <p className="text-sm text-foreground/80">{application.position}</p>
            {detailLine && (
              <p className="text-xs text-foreground/60">{detailLine}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <p
            className="text-xs text-foreground/60"
            title={formatExactDate(application.dateApplied)}
          >
            {formatRelativeDate(application.dateApplied)}
          </p>
          {followUp && <FollowUpPill />}
          <NextActionPill application={application} />
        </div>
        <div className="flex items-center gap-2 border-t border-foreground/5 pt-3">
          {application.link && <ExternalLink link={application.link} />}
          <NotesButton
            notes={application.notes}
            openNotes={() => setIsNotesOpen(true)}
          />
          <EditButton setIsEditing={setIsEditing} />
          <DeleteButton onClick={() => setIsDeleteOpen(true)} />
        </div>
      </div>
      {isNotesOpen &&
        createPortal(
          <NotesModal
            application={application}
            onUpdate={onUpdate}
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

/** Palette the company initial-tile is tinted from, keyed by name hash. */
const AVATAR_COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-accent)",
  "var(--color-warning)",
  "var(--color-error)",
];

/**
 * Tinted initial-tile standing in for a company logo. The colour is picked
 * deterministically from the name, so a given company always looks the same.
 */
const CompanyAvatar = ({ company }: { company: string }) => {
  const name = company.trim();
  const initial = name ? name[0].toUpperCase() : "?";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  return (
    <span
      aria-hidden
      className="shrink-0 inline-grid place-content-center w-9 h-9 rounded-xl text-sm font-black"
      style={{
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
        color,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      {initial}
    </span>
  );
};

/**
 * The status pill doubles as a dropdown: an invisible native select sits on
 * top, so moving an application along the pipeline never requires edit mode.
 */
const StatusPill = ({
  status,
  onChange,
}: {
  status: Status;
  onChange: (status: Status) => void;
}) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`focus-ring-within relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-transform hover:scale-105 ${cfg.bg} ${cfg.text}`}
      title="Change status"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
      <svg
        className="w-2.5 h-2.5 opacity-60"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          d="M19 9l-7 7-7-7"
        />
      </svg>
      <select
        aria-label="Change status"
        value={status}
        onChange={(e) => onChange(e.target.value as Status)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </span>
  );
};

/** Scheduled next step: upcoming in secondary, due today in warning, missed in error. */
const NextActionPill = ({ application }: { application: JobApplication }) => {
  if (!application.nextActionDate) return null;
  const days = daysSince(application.nextActionDate);
  if (days === null) return null;

  const overdue = days > 0;
  const tone = overdue
    ? "bg-error/10 text-error"
    : days === 0
      ? "bg-warning/15 text-warning"
      : "bg-secondary/10 text-secondary";
  const when = days === 0 ? "Today" : formatRelativeDate(application.nextActionDate);
  const label = application.nextActionNote || "Next step";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${tone}`}
      title={formatExactDate(application.nextActionDate)}
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
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      {overdue ? `${label} · missed` : `${label} · ${when}`}
    </span>
  );
};

const DeleteButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="focus-ring p-2 text-error hover:bg-error/10 rounded-lg transition-colors ml-auto"
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
      className="focus-ring p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
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
      className={`focus-ring p-2 rounded-lg transition-colors ${
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
      className="focus-ring p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
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
