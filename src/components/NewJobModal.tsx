import { Status, STATUS_OPTIONS } from "@/constants/generic";
import {
  ApplicationKind,
  KIND_LABELS,
  sourceOptions,
  STATUS_LABELS,
} from "@/constants/kind";
import { JobApplication } from "@/constants/types";
import { useId, useState } from "react";
import { BreathDots } from "./Breath";
import { Modal } from "./Modal";

const emptyForm = (kind: ApplicationKind) => ({
  kind,
  company: "",
  position: "",
  status: "Pending" as Status,
  dateApplied: new Date().toISOString().split("T")[0],
  notes: "",
  link: "",
  location: "",
  salary: "",
  source: "",
  contact: "",
  nextActionDate: "",
  nextActionNote: "",
  checklist: {
    resumeSent: false,
    coverLetterSent: false,
    followUpSent: false,
  },
});

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    job: Omit<JobApplication, "id" | "lastActivityAt">,
  ) => Promise<{ error: string | null }>;
  kind: ApplicationKind;
}

export const NewJobModal = ({
  isOpen,
  onClose,
  onAdd,
  kind,
}: NewJobModalProps) => {
  const [formData, setFormData] = useState(() => emptyForm(kind));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const labels = KIND_LABELS[kind];
  const titleId = useId();

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

    setFormData(emptyForm(kind));
    setSubmitting(false);
    onClose();
  };

  return (
    // A half-filled form shouldn't vanish on a stray click outside it.
    <Modal onClose={onClose} labelledBy={titleId} closeOnBackdrop={false}>
      <div>
        <div className="px-6 py-4 border-b border-white/20 flex justify-between items-center">
          <h3 id={titleId} className="text-xl font-bold text-foreground">
            {labels.addTitle}
          </h3>
          <button
            onClick={onClose}
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
            <label className="meta block text-[10px] font-bold uppercase text-foreground/75 mb-1.5">
              {labels.entity}
            </label>
            <input
              required
              type="text"
              className="input-glass w-full px-3 py-2 rounded-lg"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              placeholder={labels.entityPlaceholder}
            />
          </div>
          <div>
            <label className="meta block text-[10px] font-bold uppercase text-foreground/75 mb-1.5">
              {labels.role}
            </label>
            <input
              required
              type="text"
              className="input-glass w-full px-3 py-2 rounded-lg"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              placeholder={labels.rolePlaceholder}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="meta block text-[10px] font-bold uppercase text-foreground/75 mb-1.5">
                Status
              </label>
              <select
                className="input-glass w-full px-3 py-2 rounded-lg"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Status })
                }
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[kind][s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="meta block text-[10px] font-bold uppercase text-foreground/75 mb-1.5">
                Date Applied
              </label>
              <input
                type="date"
                className="input-glass w-full px-3 py-2 rounded-lg"
                value={formData.dateApplied}
                onChange={(e) =>
                  setFormData({ ...formData, dateApplied: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="meta block text-[10px] font-bold uppercase text-foreground/75 mb-1.5">
                {labels.location}
              </label>
              <input
                type="text"
                className="input-glass w-full px-3 py-2 rounded-lg"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder={labels.locationPlaceholder}
              />
            </div>
            <div>
              <label className="meta block text-[10px] font-bold uppercase text-foreground/75 mb-1.5">
                {labels.source}
              </label>
              <input
                type="text"
                list="new-job-source-options"
                className="input-glass w-full px-3 py-2 rounded-lg"
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                placeholder={labels.sourcePlaceholder}
              />
              <datalist id="new-job-source-options">
                {sourceOptions(kind).map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          </div>
          <div>
            <label className="meta block text-[10px] font-bold uppercase text-foreground/75 mb-1.5">
              Link
            </label>
            <input
              type="url"
              className="input-glass w-full px-3 py-2 rounded-lg"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
          <div className="pt-4 border-t border-foreground/10 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-glass flex-1 px-4 py-2 text-foreground/75 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="btn-glass flex-1 px-4 py-2 bg-breath text-paper rounded-lg font-semibold border-breath disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-h-[2.5rem]"
            >
              {submitting ? (
                <>
                  <BreathDots loading />
                  <span className="sr-only">Adding…</span>
                </>
              ) : (
                labels.addButton
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
