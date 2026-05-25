import { JobApplication } from "@/constants/generic";
import { JobRowProps } from "./JobRow";

interface NotesModalProps extends JobRowProps {
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
  const handleToggleChecklist = (field: keyof JobApplication["checklist"]) => {
    onUpdate(application.id, {
      checklist: {
        ...application.checklist,
        [field]: !application.checklist[field],
      },
    });
  };
  const handleSaveNotes = () => {
    onUpdate(application.id, { notes: noteDraft, link: linkDraft });
    setIsNotesOpen(false);
  };
  return (
    <div
      className="animate-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => setIsNotesOpen(false)}
    >
      <div
        className="animate-modal bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
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
            <label className="block text-xs font-bold text-foreground/50 uppercase tracking-widest mb-1">
              Link
            </label>
            <input
              type="url"
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-secondary/30 rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground/50 uppercase tracking-widest mb-1">
              Notes
            </label>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Add notes about this application…"
              rows={5}
              className="w-full px-3 py-2 border border-secondary/30 rounded-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-white focus:ring-2 focus:ring-secondary outline-none transition-all resize-y"
              autoFocus
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer group">
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
            <label className="flex items-center gap-2 cursor-pointer group">
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
            <label className="flex items-center gap-2 cursor-pointer group">
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
  );
};
