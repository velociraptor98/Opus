import { Status, STATUS_OPTIONS } from "@/constants/generic";
import {
  ApplicationKind,
  KIND_LABELS,
  sourceOptions,
  statusLabel,
} from "@/constants/kind";
import { JobApplication } from "@/constants/types";
import { useId, useState } from "react";
import { LoadingBars } from "./Mark";
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

/**
 * The intake form: only what you know when you file something. Everything else
 * — contact, salary, checklist, notes — is added later from the detail dialog,
 * so this stays a seven-field form you can fill without stopping to think.
 */
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

  // ⌘↵ from anywhere in the form, since the fields are a grid and the submit
  // button is two rows below wherever you happen to be typing.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.requestSubmit();
    }
  };

  return (
    // A half-filled form shouldn't vanish on a stray click outside it.
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      closeOnBackdrop={false}
      panelClassName="w-[min(620px,100%)] max-h-[88vh] overflow-auto"
    >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        <div className="dialog-head">
          <h3 id={titleId} style={{ margin: 0, fontSize: 22 }}>
            {labels.addTitle}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary ml-auto"
            style={{ fontSize: 11, letterSpacing: "0.1em" }}
          >
            CLOSE
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-6 py-5">
          {error && (
            <div
              className="animate-shake sm:col-span-2 px-3 py-2.5"
              style={{
                background: "var(--color-accent-100)",
                borderLeft: "3px solid var(--color-accent)",
                color: "var(--color-accent-800)",
                fontSize: 13,
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="field sm:col-span-2">
            <label htmlFor={`${titleId}-company`}>{labels.entity}</label>
            <input
              id={`${titleId}-company`}
              required
              className="input"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              placeholder={labels.entityPlaceholder}
            />
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor={`${titleId}-role`}>{labels.role}</label>
            <input
              id={`${titleId}-role`}
              required
              className="input"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
              placeholder={labels.rolePlaceholder}
            />
          </div>
          <div className="field">
            <label htmlFor={`${titleId}-status`}>Status</label>
            <select
              id={`${titleId}-status`}
              className="input"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as Status })
              }
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
              value={formData.dateApplied}
              onChange={(e) =>
                setFormData({ ...formData, dateApplied: e.target.value })
              }
            />
          </div>
          <div className="field">
            <label htmlFor={`${titleId}-location`}>{labels.location}</label>
            <input
              id={`${titleId}-location`}
              className="input"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder={labels.locationPlaceholder}
            />
          </div>
          <div className="field">
            <label htmlFor={`${titleId}-source`}>{labels.source}</label>
            <input
              id={`${titleId}-source`}
              className="input"
              list={`${titleId}-source-options`}
              value={formData.source}
              onChange={(e) =>
                setFormData({ ...formData, source: e.target.value })
              }
              placeholder={labels.sourcePlaceholder}
            />
            <datalist id={`${titleId}-source-options`}>
              {sourceOptions(kind).map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div className="field sm:col-span-2">
            <label htmlFor={`${titleId}-link`}>Link</label>
            <input
              id={`${titleId}-link`}
              type="url"
              className="input"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://"
            />
          </div>
        </div>

        <div className="dialog-foot dialog-foot-ruled">
          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="btn btn-primary"
            style={{ letterSpacing: "0.08em" }}
          >
            {submitting ? (
              <>
                <LoadingBars />
                <span className="sr-only">Adding…</span>
              </>
            ) : (
              "SAVE APPLICATION"
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ letterSpacing: "0.08em" }}
          >
            CANCEL
          </button>
          <span className="text-muted ml-auto eyebrow hidden sm:inline">
            ⌘↵ to save
          </span>
        </div>
      </form>
    </Modal>
  );
};
