import { SOURCE_OPTIONS, type Status } from "./generic";

/**
 * What a tracked application *is*. Both kinds share one table, one status
 * vocabulary and one set of columns — the difference is entirely in the words
 * on screen, which all live in this file.
 */
export type ApplicationKind = "job" | "university";

export const KIND_OPTIONS: ApplicationKind[] = ["job", "university"];

export const DEFAULT_KIND: ApplicationKind = "job";

/** Narrows an untrusted value (localStorage, CSV cell, DB row) to a kind. */
export function toKind(value: unknown): ApplicationKind {
  return value === "university" ? "university" : DEFAULT_KIND;
}

interface KindLabels {
  /** Name of the toggle segment, e.g. "Jobs". */
  tab: string;
  /** The thing being applied to: company / institution. */
  entity: string;
  /** What you're applying for: position / programme. */
  role: string;
  location: string;
  /** Money, in whichever direction it flows. */
  salary: string;
  source: string;
  contact: string;
  nextAction: string;
  /** Column head over `dateApplied` in the list table. */
  dateColumn: string;
  /** The three checklist steps, in `resume / coverLetter / followUp` order. */
  checklist: [string, string, string];
  /**
   * The five segments of the pipeline bar, in order. Purely display: the fill
   * is derived from `status` (see lib/pipeline.ts), so these are labels for a
   * shape that already exists, not a second source of truth.
   */
  pipeline: [string, string, string, string, string];
  addTitle: string;
  addButton: string;
  /** Tooltip on the sidebar's add button. */
  addAction: string;
  searchPlaceholder: string;
  emptyLabel: string;
  entityPlaceholder: string;
  rolePlaceholder: string;
  locationPlaceholder: string;
  sourcePlaceholder: string;
  salaryPlaceholder: string;
  contactPlaceholder: string;
  nextActionPlaceholder: string;
  /** Filename stem for CSV export. */
  exportStem: string;
  // Stats page ------------------------------------------------------------
  /** Funnel stages, in submitted → interviewed → offered order. */
  funnel: [string, string, string];
  /** Heading for the per-entity bar chart. */
  topEntities: string;
  conversionTitle: string;
  conversionSub: string;
}

export const KIND_LABELS: Record<ApplicationKind, KindLabels> = {
  job: {
    tab: "Jobs",
    entity: "Company",
    role: "Position",
    location: "Location",
    salary: "Salary",
    source: "Source",
    contact: "Contact",
    nextAction: "Next step",
    dateColumn: "Applied",
    checklist: ["Resume", "Cover Letter", "Follow-up"],
    pipeline: ["Saved", "Applied", "Screen", "Interview", "Decision"],
    addTitle: "Add New Job Application",
    addButton: "Add Job",
    addAction: "Add application",
    searchPlaceholder: "Search company or role",
    emptyLabel: "No applications yet.",
    entityPlaceholder: "e.g. Google",
    rolePlaceholder: "e.g. Senior Frontend Engineer",
    locationPlaceholder: "e.g. Remote",
    sourcePlaceholder: "e.g. LinkedIn",
    salaryPlaceholder: "e.g. $140k–$170k",
    contactPlaceholder: "Recruiter name / email",
    nextActionPlaceholder: "e.g. Phone screen",
    exportStem: "applications",
    funnel: ["Submitted", "Interviewed", "Offered"],
    topEntities: "Top Companies",
    conversionTitle: "Source Conversion",
    conversionSub: "How far applications from each source get",
  },
  university: {
    tab: "Universities",
    entity: "Institution",
    role: "Programme",
    location: "Campus",
    salary: "Tuition / funding",
    source: "Portal",
    contact: "Admissions contact",
    nextAction: "Deadline",
    dateColumn: "Submitted",
    // Same three stored booleans, named for what admissions actually asks for.
    checklist: ["Transcript", "Statement", "Follow-up"],
    pipeline: ["Saved", "Submitted", "Review", "Interview", "Decision"],
    addTitle: "Add New University Application",
    addButton: "Add Application",
    addAction: "Add university application",
    searchPlaceholder: "Search institution or programme",
    emptyLabel: "No university applications yet.",
    entityPlaceholder: "e.g. Imperial College London",
    rolePlaceholder: "e.g. MSc Computing",
    locationPlaceholder: "e.g. London",
    sourcePlaceholder: "e.g. UCAS",
    salaryPlaceholder: "e.g. £28k/yr, scholarship",
    contactPlaceholder: "Admissions office / email",
    nextActionPlaceholder: "e.g. Reference deadline",
    exportStem: "universities",
    funnel: ["Submitted", "Interviewed", "Accepted"],
    topEntities: "Top Institutions",
    conversionTitle: "Portal Conversion",
    conversionSub: "How far applications from each portal get",
  },
};

/**
 * Display names for the six stored statuses. The values in the database are
 * identical across kinds — only admissions calls an offer an acceptance — so
 * the pipeline, funnel and colour maps stay kind-agnostic.
 */
export const STATUS_LABELS: Record<ApplicationKind, Record<Status, string>> = {
  job: {
    Pending: "Pending",
    Applied: "Applied",
    Interviewing: "Interviewing",
    Offered: "Offered",
    Rejected: "Rejected",
    Closed: "Closed",
  },
  university: {
    Pending: "Draft",
    Applied: "Submitted",
    Interviewing: "Interview",
    Offered: "Accepted",
    Rejected: "Rejected",
    Closed: "Withdrawn",
  },
};

/** Where a university application was submitted; the UI also accepts free text. */
export const UNIVERSITY_SOURCE_OPTIONS = [
  "Common App",
  "UCAS",
  "Coalition App",
  "Direct application",
  "Agent",
  "Other",
] as const;

/** Suggestions for the source/portal field, per kind. */
export function sourceOptions(kind: ApplicationKind): readonly string[] {
  return kind === "university" ? UNIVERSITY_SOURCE_OPTIONS : SOURCE_OPTIONS;
}

export function statusLabel(kind: ApplicationKind, status: Status): string {
  return STATUS_LABELS[kind][status];
}

export function kindLabels(kind: ApplicationKind): KindLabels {
  return KIND_LABELS[kind];
}
