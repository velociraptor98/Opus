"use client";

import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { Status, STATUS_OPTIONS, needsFollowUp } from "@/constants/generic";
import { KIND_LABELS, sourceOptions, statusLabel } from "@/constants/kind";
import { BaseJobProps, JobApplication } from "@/constants/types";
import { useToast } from "@/context/ToastContext";
import { pipelineSegments, TONE_MARK, TONE_TAG, toneFor } from "@/lib/pipeline";
import { ConfirmModal } from "./ConfirmModal";
import { PipelineBars } from "./Mark";
import { Modal } from "./Modal";

/** Every field the dialog owns — which, now, is every editable field there is. */
type Draft = Pick<
  JobApplication,
  | "company"
  | "position"
  | "status"
  | "dateApplied"
  | "link"
  | "location"
  | "salary"
  | "source"
  | "contact"
  | "nextActionDate"
  | "nextActionNote"
  | "notes"
  | "checklist"
>;

const draftFrom = (app: JobApplication): Draft => ({
  company: app.company,
  position: app.position,
  status: app.status,
  dateApplied: app.dateApplied,
  link: app.link,
  location: app.location,
  salary: app.salary,
  source: app.source,
  contact: app.contact,
  nextActionDate: app.nextActionDate,
  nextActionNote: app.nextActionNote,
  notes: app.notes,
  checklist: { ...app.checklist },
});

/**
 * Only what actually moved.
 *
 * The dialog holds every field, so sending the whole draft on every save would
 * put `status` in each write — and an update carrying a status is what resets
 * the follow-up clock upstream. Saving a typo fix would silently mark the
 * application as active again.
 */
function changedFields(draft: Draft, app: JobApplication): Partial<Draft> {
  const updates: Partial<Draft> = {};
  for (const key of Object.keys(draft) as (keyof Draft)[]) {
    if (key === "checklist") {
      const a = draft.checklist;
      const b = app.checklist;
      if (
        a.resumeSent !== b.resumeSent ||
        a.coverLetterSent !== b.coverLetterSent ||
        a.followUpSent !== b.followUpSent
      ) {
        updates.checklist = a;
      }
      continue;
    }
    if (draft[key] !== app[key]) {
      // Each branch is a same-typed assignment; TS can't see that through the
      // dynamic key, so the write is narrowed once here rather than per field.
      (updates as Record<string, unknown>)[key] = draft[key];
    }
  }
  return updates;
}

interface DetailModalProps extends BaseJobProps {
  onClose: () => void;
}

/**
 * The application, opened. One dialog now carries what used to be split
 * between the card's inline edit mode and a separate notes modal: the facts on
 * the left, where it has got to on the right.
 */
export const DetailModal = ({
  application,
  onUpdate,
  onDelete,
  onClose,
}: DetailModalProps) => {
  const [draft, setDraft] = useState<Draft>(() => draftFrom(application));
  const [saving, setSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const toast = useToast();
  const titleId = useId();

  const kind = application.kind;
  const labels = KIND_LABELS[kind];

  const set = <K extends keyof Draft>(field: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [field]: value }));

  const toggleChecklist = (field: keyof JobApplication["checklist"]) =>
    setDraft((d) => ({
      ...d,
      checklist: { ...d.checklist, [field]: !d.checklist[field] },
    }));

  const handleSave = async () => {
    const updates = changedFields(draft, application);
    if (Object.keys(updates).length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    const ok = await onUpdate(application.id, updates);
    setSaving(false);
    // The specific failure reason is surfaced by onUpdate itself.
    if (!ok) return;
    onClose();
    toast.show("Changes saved", { variant: "success" });
  };

  // The header reads from the draft, so moving the status repaints the mark,
  // the tag and the pipeline before anything is written.
  const followUp = needsFollowUp(
    draft.status,
    application.lastActivityAt,
    draft.nextActionDate,
  );
  const tone = toneFor(draft.status, followUp);
  const mark = TONE_MARK[tone];
  const segments = pipelineSegments(draft.status, tone);
  const initial = draft.company.trim() ? draft.company.trim()[0].toUpperCase() : "?";
  const done = [
    draft.checklist.resumeSent,
    draft.checklist.coverLetterSent,
    draft.checklist.followUpSent,
  ].filter(Boolean).length;

  const checklistFields = [
    "resumeSent",
    "coverLetterSent",
    "followUpSent",
  ] as const;

  return (
    <>
      {/* Unsaved edits live here, so a stray backdrop click mustn't bin them. */}
      <Modal
        onClose={onClose}
        labelledBy={titleId}
        closeOnBackdrop={false}
        panelClassName="w-[min(760px,100%)] max-h-[88vh] overflow-auto"
      >
        <div className="dialog-head">
          <span
            aria-hidden="true"
            className="shrink-0 grid place-items-center"
            style={{
              width: 34,
              height: 34,
              fontWeight: 800,
              fontSize: 15,
              background: mark.bg,
              color: mark.fg,
            }}
          >
            {initial}
          </span>
          <div className="min-w-0">
            <h3 id={titleId} className="truncate" style={{ margin: 0, fontSize: 22 }}>
              {draft.company || labels.entity}
            </h3>
            <div className="text-muted truncate" style={{ fontSize: 13 }}>
              {draft.position || labels.role}
            </div>
          </div>
          <span
            className={`tag ${TONE_TAG[tone]} eyebrow shrink-0`}
            style={{ letterSpacing: "0.08em" }}
          >
            {statusLabel(kind, draft.status)}
          </span>
          <button
            onClick={onClose}
            className="btn btn-secondary ml-auto shrink-0"
            style={{ fontSize: 11, letterSpacing: "0.1em" }}
          >
            CLOSE
          </button>
        </div>

        <div className="grid md:grid-cols-2 border-b-2 border-line">
          {/* The facts. */}
          <div className="flex flex-col gap-4 px-6 py-5 md:border-r border-line">
            <div className="field">
              <label htmlFor={`${titleId}-company`}>{labels.entity}</label>
              <input
                id={`${titleId}-company`}
                className="input"
                value={draft.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder={labels.entityPlaceholder}
              />
            </div>
            <div className="field">
              <label htmlFor={`${titleId}-role`}>{labels.role}</label>
              <input
                id={`${titleId}-role`}
                className="input"
                value={draft.position}
                onChange={(e) => set("position", e.target.value)}
                placeholder={labels.rolePlaceholder}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label htmlFor={`${titleId}-status`}>Status</label>
                <select
                  id={`${titleId}-status`}
                  className="input"
                  value={draft.status}
                  onChange={(e) => set("status", e.target.value as Status)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(kind, s)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor={`${titleId}-applied`}>{labels.dateColumn}</label>
                <input
                  id={`${titleId}-applied`}
                  type="date"
                  className="input"
                  value={draft.dateApplied}
                  onChange={(e) => set("dateApplied", e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor={`${titleId}-link`}>Link</label>
              <input
                id={`${titleId}-link`}
                type="url"
                className="input"
                value={draft.link}
                onChange={(e) => set("link", e.target.value)}
                placeholder="https://"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label htmlFor={`${titleId}-location`}>{labels.location}</label>
                <input
                  id={`${titleId}-location`}
                  className="input"
                  value={draft.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder={labels.locationPlaceholder}
                />
              </div>
              <div className="field">
                <label htmlFor={`${titleId}-salary`}>{labels.salary}</label>
                <input
                  id={`${titleId}-salary`}
                  className="input"
                  value={draft.salary}
                  onChange={(e) => set("salary", e.target.value)}
                  placeholder={labels.salaryPlaceholder}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label htmlFor={`${titleId}-source`}>{labels.source}</label>
                <input
                  id={`${titleId}-source`}
                  className="input"
                  list={`${titleId}-source-options`}
                  value={draft.source}
                  onChange={(e) => set("source", e.target.value)}
                  placeholder={labels.sourcePlaceholder}
                />
                <datalist id={`${titleId}-source-options`}>
                  {sourceOptions(kind).map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div className="field">
                <label htmlFor={`${titleId}-contact`}>{labels.contact}</label>
                <input
                  id={`${titleId}-contact`}
                  className="input"
                  value={draft.contact}
                  onChange={(e) => set("contact", e.target.value)}
                  placeholder={labels.contactPlaceholder}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label htmlFor={`${titleId}-next`}>{labels.nextAction}</label>
                <input
                  id={`${titleId}-next`}
                  className="input"
                  value={draft.nextActionNote}
                  onChange={(e) => set("nextActionNote", e.target.value)}
                  placeholder={labels.nextActionPlaceholder}
                />
              </div>
              <div className="field">
                <label htmlFor={`${titleId}-next-date`}>
                  {labels.nextAction} date
                </label>
                <input
                  id={`${titleId}-next-date`}
                  type="date"
                  className="input"
                  value={draft.nextActionDate}
                  onChange={(e) => set("nextActionDate", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Where it has got to. */}
          <div className="flex flex-col gap-4 px-6 py-5">
            <div>
              <div className="eyebrow mb-2.5" style={{ fontSize: 11, letterSpacing: "0.12em" }}>
                Pipeline
              </div>
              <PipelineBars segments={segments} grow height={10} className="mb-2" />
              <div className="text-muted flex justify-between eyebrow" style={{ fontSize: 10, letterSpacing: "0.08em" }}>
                {labels.pipeline.map((stage) => (
                  <span key={stage}>{stage}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="eyebrow mb-2.5" style={{ fontSize: 11, letterSpacing: "0.12em" }}>
                Checklist — {done} of 3 done
              </div>
              <div className="flex flex-col gap-2">
                {checklistFields.map((field, i) => (
                  <label key={field} className="radio">
                    <input
                      type="checkbox"
                      checked={draft.checklist[field]}
                      onChange={() => toggleChecklist(field)}
                    />
                    <span className="box" />
                    {labels.checklist[i]}
                  </label>
                ))}
              </div>
            </div>

            <div className="field flex flex-col flex-1">
              <label htmlFor={`${titleId}-notes`}>Notes</label>
              <textarea
                id={`${titleId}-notes`}
                className="input flex-1"
                style={{ minHeight: 96 }}
                value={draft.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Add notes about this application…"
              />
            </div>

            {draft.link && (
              <a
                href={draft.link}
                target="_blank"
                rel="noopener noreferrer"
                className="eyebrow"
                style={{ letterSpacing: "0.12em" }}
              >
                Open listing ↗
              </a>
            )}
          </div>
        </div>

        <div className="dialog-foot">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            aria-busy={saving}
            className="btn btn-primary"
            style={{ letterSpacing: "0.08em" }}
          >
            SAVE CHANGES
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ letterSpacing: "0.08em" }}
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="btn btn-ghost ml-auto"
            style={{ letterSpacing: "0.08em" }}
          >
            DELETE
          </button>
        </div>
      </Modal>

      {isDeleteOpen &&
        createPortal(
          <ConfirmModal
            title="Delete application?"
            message={`This will permanently remove ${application.company} — ${application.position}. This can't be undone.`}
            confirmLabel="Delete"
            onConfirm={() => {
              setIsDeleteOpen(false);
              onClose();
              onDelete(application.id);
            }}
            onCancel={() => setIsDeleteOpen(false)}
          />,
          document.body,
        )}
    </>
  );
};
