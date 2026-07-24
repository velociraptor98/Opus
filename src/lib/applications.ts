import type { Status } from "@/constants/generic";
import { toKind } from "@/constants/kind";
import { JobApplication } from "@/constants/types";

/**
 * Raw `applications` row as returned by Supabase. Hand-written rather than
 * generated, so treat every field as optional: a column added in a migration
 * that hasn't been applied yet simply arrives undefined, and the mapper below
 * is what supplies the defaults.
 */
export interface ApplicationRow {
  id: string;
  kind?: string | null;
  company: string;
  position: string;
  status: Status;
  date_applied: string;
  created_at?: string | null;
  updated_at?: string | null;
  notes?: string | null;
  link?: string | null;
  location?: string | null;
  salary?: string | null;
  source?: string | null;
  contact?: string | null;
  next_action_date?: string | null;
  next_action_note?: string | null;
  resume_sent?: boolean | null;
  cover_letter_sent?: boolean | null;
  follow_up_sent?: boolean | null;
}

/** Maps a Supabase `applications` row to the client model. */
export function mapRowToApplication(row: ApplicationRow): JobApplication {
  return {
    id: row.id,
    // Falls back to "job" so the app still reads rows written before the
    // kind migration was applied.
    kind: toKind(row.kind),
    company: row.company,
    position: row.position,
    status: row.status,
    dateApplied: row.date_applied,
    lastActivityAt: row.updated_at ?? row.created_at ?? row.date_applied,
    notes: row.notes ?? "",
    link: row.link ?? "",
    location: row.location ?? "",
    salary: row.salary ?? "",
    source: row.source ?? "",
    contact: row.contact ?? "",
    nextActionDate: row.next_action_date ?? "",
    nextActionNote: row.next_action_note ?? "",
    checklist: {
      resumeSent: row.resume_sent ?? false,
      coverLetterSent: row.cover_letter_sent ?? false,
      followUpSent: row.follow_up_sent ?? false,
    },
  };
}

/** Maps client model fields to `applications` column values for insert. */
export function toInsertRow(
  job: Omit<JobApplication, "id" | "lastActivityAt">,
): Record<string, unknown> {
  return {
    kind: job.kind,
    company: job.company,
    position: job.position,
    status: job.status,
    date_applied: job.dateApplied,
    notes: job.notes,
    link: job.link,
    location: job.location,
    salary: job.salary,
    source: job.source,
    contact: job.contact,
    next_action_date: job.nextActionDate || null,
    next_action_note: job.nextActionNote,
    resume_sent: job.checklist.resumeSent,
    cover_letter_sent: job.checklist.coverLetterSent,
    follow_up_sent: job.checklist.followUpSent,
  };
}

/** Maps a partial client-model update to `applications` column updates. */
export function toUpdateRow(
  updates: Partial<JobApplication>,
): Record<string, unknown> {
  // `kind` is intentionally absent: it's fixed at creation, and letting an
  // edit move an application between kinds would relabel its whole history.
  const row: Record<string, unknown> = {};
  if (updates.company !== undefined) row.company = updates.company;
  if (updates.position !== undefined) row.position = updates.position;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.dateApplied !== undefined) row.date_applied = updates.dateApplied;
  if (updates.notes !== undefined) row.notes = updates.notes;
  if (updates.link !== undefined) row.link = updates.link;
  if (updates.location !== undefined) row.location = updates.location;
  if (updates.salary !== undefined) row.salary = updates.salary;
  if (updates.source !== undefined) row.source = updates.source;
  if (updates.contact !== undefined) row.contact = updates.contact;
  if (updates.nextActionDate !== undefined)
    row.next_action_date = updates.nextActionDate || null;
  if (updates.nextActionNote !== undefined)
    row.next_action_note = updates.nextActionNote;
  if (updates.checklist !== undefined) {
    row.resume_sent = updates.checklist.resumeSent;
    row.cover_letter_sent = updates.checklist.coverLetterSent;
    row.follow_up_sent = updates.checklist.followUpSent;
  }
  return row;
}
