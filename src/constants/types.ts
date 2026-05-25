import { Status } from "./generic";

export interface JobApplication {
  id: string;
  company: string;
  position: string;
  status: Status;
  dateApplied: string;
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
  onUpdate: (id: string, updates: Partial<JobApplication>) => void;
  onDelete: (id: string) => void;
}
