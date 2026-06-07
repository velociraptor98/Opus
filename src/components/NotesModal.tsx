import { useEffect } from "react";
import { BaseJobProps, JobApplication } from "@/constants/types";
import { useToast } from "@/context/ToastContext";

interface NotesModalProps extends BaseJobProps {
  noteDraft: string;
  setNoteDraft: (v: string) => void;
  linkDraft: string;
  setLinkDraft: (v: string) => void;
  setIsNotesOpen: (open: boolean) => void;
}

export const NotesModal = ({
  application,
  onUpdate,
  noteDraft,
  setNoteDraft,
  linkDraft,
  setLinkDraft,
  setIsNotesOpen,
}: NotesModalProps) => {
  const toast = useToast();

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
  const handleSaveNotes = async () => {
    const ok = await onUpdate(application.id, {
      notes: noteDraft,
      link: linkDraft,
    });
    // The specific failure reason is surfaced by onUpdate itself.
    if (!ok) return;
    setIsNotesOpen(false);
    toast.show("Notes saved", { variant: "success" });
  };
  return (
    <div
      className="animate-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => setIsNotesOpen(false)}
    >
      <div
        className="animate-modal modal-glass rounded-3xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-white/20 dark:border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold text-primary dark:text-primary">
            {application.company}
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
          <div>
            <label className="block text-xs font-bold text-foreground/70 uppercase tracking-widest mb-1">
              Link
            </label>
            <input
              type="url"
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              placeholder="https://..."
              className="input-glass w-full px-3 py-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground/70 uppercase tracking-widest mb-1">
              Notes
            </label>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Add notes about this application…"
              rows={5}
              className="input-glass w-full px-3 py-2 rounded-lg resize-y"
              autoFocus
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={application.checklist.resumeSent}
                onChange={() => handleToggleChecklist("resumeSent")}
                className="checkbox-glass"
              />
              <span className="group-hover:text-primary transition-colors text-xs uppercase tracking-wider font-semibold opacity-70">
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
              <span className="group-hover:text-primary transition-colors text-xs uppercase tracking-wider font-semibold opacity-70">
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
              <span className="group-hover:text-primary transition-colors text-xs uppercase tracking-wider font-semibold opacity-70">
                Follow-up
              </span>
            </label>
          </div>
          <div className="pt-4 border-t border-secondary/10 dark:border-zinc-800 flex gap-3">
            <button
              type="button"
              onClick={() => setIsNotesOpen(false)}
              className="btn-glass flex-1 px-4 py-2 text-secondary rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveNotes}
              className="btn-glass flex-1 px-4 py-2 bg-primary/80 dark:bg-secondary/70 text-white rounded-lg font-semibold border-primary/40 dark:border-secondary/40"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
