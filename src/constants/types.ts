import { Status } from "./generic";

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  status: Status;
  dateApplied: string;
  /** Timestamp of the last meaningful change (e.g. status move); drives follow-up. */
  lastActivityAt: string;
  notes: string;
  link: string;
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
