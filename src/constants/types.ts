import { Status } from "./generic";
import type { ApplicationKind } from "./kind";

/**
 * One tracked application. Jobs and university applications share this shape —
 * `kind` only changes the words on screen (see constants/kind.ts), so
 * `company`/`position` are the institution and programme for a university.
 */
export interface JobApplication {
  id: string;
  /** Job or university application; set at creation, never edited. */
  kind: ApplicationKind;
  company: string;
  position: string;
  status: Status;
  dateApplied: string;
  /** Timestamp of the last meaningful change (e.g. status move); drives follow-up. */
  lastActivityAt: string;
  notes: string;
  link: string;
  location: string;
  salary: string;
  /** Where the application came from, e.g. "LinkedIn", "Referral". */
  source: string;
  /** Recruiter / hiring contact, free-form ("Jane Doe <jane@acme.com>"). */
  contact: string;
  /** Next scheduled step ("YYYY-MM-DD"); empty when nothing is scheduled. */
  nextActionDate: string;
  /** Short label for the next step, e.g. "Phone screen". */
  nextActionNote: string;
  checklist: {
    resumeSent: boolean;
    coverLetterSent: boolean;
    followUpSent: boolean;
  };
}

export interface BaseJobProps {
  application: JobApplication;
  /** Resolves `true` when the change was persisted, `false` on failure. */
  onUpdate: (id: string, updates: Partial<JobApplication>) => Promise<boolean>;
  onDelete: (id: string) => void;
}
