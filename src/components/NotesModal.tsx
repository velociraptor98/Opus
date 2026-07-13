import { useEffect, useState } from "react";
import { BaseJobProps, JobApplication } from "@/constants/types";
import { SOURCE_OPTIONS } from "@/constants/generic";
import { useToast } from "@/context/ToastContext";

interface NotesModalProps extends Omit<BaseJobProps, "onDelete"> {
  setIsNotesOpen: (open: boolean) => void;
}

/**
 * Details editor for everything beyond the card's core fields: link,
 * location, salary, source, contact, next scheduled step, notes, and the
 * outreach checklist. Drafts are local; nothing persists until Save (the
 * checklist toggles save immediately, as before).
 */
export const NotesModal = ({
  application,
  onUpdate,
  setIsNotesOpen,
}: NotesModalProps) => {
  const toast = useToast();
  const [draft, setDraft] = useState({
    notes: application.notes,
    link: application.link,
    location: application.location,
    salary: application.salary,
    source: application.source,
    contact: application.contact,
    nextActionDate: application.nextActionDate,
    nextActionNote: application.nextActionNote,
  });

  const setField = (field: keyof typeof draft) => (value: string) =>
    setDraft((d) => ({ ...d, [field]: value }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsNotesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setIsNotesOpen]);

  const handleToggleChecklist = (field: keyof JobApplication["checklist"]) => {
    onUpdate(application.id, {
      checklist: {
        ...application.checklist,
        [field]: !application.checklist[field],
      },
    });
  };

  const handleSave = async () => {
    const ok = await onUpdate(application.id, draft);
    // The specific failure reason is surfaced by onUpdate itself.
    if (!ok) return;
    setIsNotesOpen(false);
    toast.show("Details saved", { variant: "success" });
  };

  const labelCls =
    "block text-xs font-bold text-foreground/75 uppercase tracking-widest mb-1";

  return (
    <div
      className="animate-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => setIsNotesOpen(false)}
    >
      <div
        className="animate-modal modal-glass rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-white/20 flex justify-between items-center">
          <h3 className="text-xl font-bold text-foreground">
            {application.company}
          </h3>
          <button
            onClick={() => setIsNotesOpen(false)}
            className="text-foreground/60 hover:text-breath transition-colors"
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
          <div>
            <label className={labelCls}>Link</label>
            <input
              type="url"
              value={draft.link}
              onChange={(e) => setField("link")(e.target.value)}
              placeholder="https://..."
              className="input-glass w-full px-3 py-2 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Location</label>
              <input
                type="text"
                value={draft.location}
                onChange={(e) => setField("location")(e.target.value)}
                placeholder="e.g. Remote"
                className="input-glass w-full px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className={labelCls}>Salary</label>
              <input
                type="text"
                value={draft.salary}
                onChange={(e) => setField("salary")(e.target.value)}
                placeholder="e.g. $140k–$170k"
                className="input-glass w-full px-3 py-2 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Source</label>
              <input
                type="text"
                list="source-options"
                value={draft.source}
                onChange={(e) => setField("source")(e.target.value)}
                placeholder="e.g. LinkedIn"
                className="input-glass w-full px-3 py-2 rounded-lg"
              />
              <datalist id="source-options">
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={labelCls}>Contact</label>
              <input
                type="text"
                value={draft.contact}
                onChange={(e) => setField("contact")(e.target.value)}
                placeholder="Recruiter name / email"
                className="input-glass w-full px-3 py-2 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Next step date</label>
              <input
                type="date"
                value={draft.nextActionDate}
                onChange={(e) => setField("nextActionDate")(e.target.value)}
                className="input-glass w-full px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className={labelCls}>Next step</label>
              <input
                type="text"
                value={draft.nextActionNote}
                onChange={(e) => setField("nextActionNote")(e.target.value)}
                placeholder="e.g. Phone screen"
                className="input-glass w-full px-3 py-2 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              value={draft.notes}
              onChange={(e) => setField("notes")(e.target.value)}
              placeholder="Add notes about this application…"
              rows={4}
              className="input-glass w-full px-3 py-2 rounded-lg resize-y"
              autoFocus
            />
          </div>
          {/* The breath as a progress track: three steps, three dots. Each one
              lights in clay as its step is completed — the gesture filling up
              rather than fading out. */}
          <div className="flex items-center gap-3">
            <span className="breath-rule text-2xl shrink-0" aria-hidden="true">
              <span className="breath-steps">
                <i data-done={application.checklist.resumeSent} />
                <i data-done={application.checklist.coverLetterSent} />
                <i data-done={application.checklist.followUpSent} />
              </span>
            </span>
            <span className="meta text-[10px] font-bold uppercase text-foreground/75">
              {
                [
                  application.checklist.resumeSent,
                  application.checklist.coverLetterSent,
                  application.checklist.followUpSent,
                ].filter(Boolean).length
              }{" "}
              of 3 done
            </span>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={application.checklist.resumeSent}
                onChange={() => handleToggleChecklist("resumeSent")}
                className="checkbox-glass"
              />
              <span className="group-hover:text-breath transition-colors text-xs uppercase tracking-wider font-semibold opacity-70">
                Resume
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={application.checklist.coverLetterSent}
                onChange={() => handleToggleChecklist("coverLetterSent")}
                className="checkbox-glass"
              />
              <span className="group-hover:text-breath transition-colors text-xs uppercase tracking-wider font-semibold opacity-70">
                Cover Letter
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={application.checklist.followUpSent}
                onChange={() => handleToggleChecklist("followUpSent")}
                className="checkbox-glass"
              />
              <span className="group-hover:text-breath transition-colors text-xs uppercase tracking-wider font-semibold opacity-70">
                Follow-up
              </span>
            </label>
          </div>
          <div className="pt-4 border-t border-foreground/10 flex gap-3">
            <button
              type="button"
              onClick={() => setIsNotesOpen(false)}
              className="btn-glass flex-1 px-4 py-2 text-foreground/75 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-glass flex-1 px-4 py-2 bg-breath text-paper rounded-lg font-semibold border-breath disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
