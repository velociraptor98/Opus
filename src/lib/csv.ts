import { Status } from "@/constants/generic";
import {
  ApplicationKind,
  DEFAULT_KIND,
  KIND_OPTIONS,
  STATUS_LABELS,
  toKind,
} from "@/constants/kind";
import { JobApplication } from "@/constants/types";

/** Column order for exports; import matches on these headers (case-insensitive). */
export const CSV_HEADERS = [
  "kind",
  "company",
  "position",
  "status",
  "date_applied",
  "location",
  "salary",
  "source",
  "contact",
  "link",
  "notes",
  "next_action_date",
  "next_action_note",
  "resume_sent",
  "cover_letter_sent",
  "follow_up_sent",
] as const;

const VALID_STATUSES: Status[] = [
  "Pending",
  "Applied",
  "Interviewing",
  "Offered",
  "Rejected",
  "Closed",
];

const KIND_VALUES: string[] = [...KIND_OPTIONS];

/**
 * Resolves a status cell to a stored status, accepting either the stored value
 * or any kind's display label — so a university export saying "Accepted"
 * imports back as `Offered`.
 */
function parseStatus(raw: string): Status {
  const value = raw.trim().toLowerCase();
  if (!value) return "Pending";
  const stored = VALID_STATUSES.find((s) => s.toLowerCase() === value);
  if (stored) return stored;
  for (const labels of Object.values(STATUS_LABELS)) {
    const match = VALID_STATUSES.find(
      (s) => labels[s].toLowerCase() === value,
    );
    if (match) return match;
  }
  return "Pending";
}

function escapeField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Serializes applications to a spreadsheet-friendly CSV string. */
export function applicationsToCsv(apps: JobApplication[]): string {
  const lines = [CSV_HEADERS.join(",")];
  for (const app of apps) {
    const fields = [
      app.kind,
      app.company,
      app.position,
      app.status,
      app.dateApplied,
      app.location,
      app.salary,
      app.source,
      app.contact,
      app.link,
      app.notes,
      app.nextActionDate,
      app.nextActionNote,
      String(app.checklist.resumeSent),
      String(app.checklist.coverLetterSent),
      String(app.checklist.followUpSent),
    ];
    lines.push(fields.map((f) => escapeField(f ?? "")).join(","));
  }
  return lines.join("\r\n");
}

/** Splits raw CSV text into rows of fields, honoring quoted fields. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  // Flush a trailing field/row when the file doesn't end with a newline.
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

export interface CsvImportResult {
  applications: Omit<JobApplication, "id" | "lastActivityAt">[];
  /** Rows skipped because company/position were missing (1-based, header = 1). */
  skippedRows: number[];
  error: string | null;
}

const truthy = (v: string) => ["true", "yes", "1", "y"].includes(v.trim().toLowerCase());

/** Normalizes common date forms (ISO, M/D/YYYY) to "YYYY-MM-DD"; "" if unparseable. */
function normalizeDate(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const slash = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const [, m, d, y] = slash;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const parsed = new Date(v);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
}

/**
 * Parses a CSV export (ours, or any spreadsheet with at least company and
 * position columns) into ready-to-insert applications. Rows carry the
 * `defaultKind` unless the file names a `kind` per row.
 */
export function csvToApplications(
  text: string,
  defaultKind: ApplicationKind = DEFAULT_KIND,
): CsvImportResult {
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return { applications: [], skippedRows: [], error: "The file is empty" };
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const col = (name: string) => headers.indexOf(name);
  // Accept a few common spreadsheet aliases for the essential columns.
  const companyIdx = [col("company"), col("employer")].find((i) => i >= 0) ?? -1;
  const positionIdx =
    [col("position"), col("role"), col("title"), col("job_title")].find(
      (i) => i >= 0,
    ) ?? -1;

  if (companyIdx < 0 || positionIdx < 0) {
    return {
      applications: [],
      skippedRows: [],
      error: 'Couldn\'t find "company" and "position" columns in the header row',
    };
  }

  const get = (row: string[], name: string) => {
    const i = col(name);
    return i >= 0 ? (row[i] ?? "").trim() : "";
  };

  const applications: CsvImportResult["applications"] = [];
  const skippedRows: number[] = [];

  rows.slice(1).forEach((row, i) => {
    const company = (row[companyIdx] ?? "").trim();
    const position = (row[positionIdx] ?? "").trim();
    if (!company || !position) {
      skippedRows.push(i + 2);
      return;
    }

    // An unrecognised kind cell falls back to the active kind rather than
    // silently filing the row as a job.
    const rawKind = get(row, "kind").toLowerCase();
    const kind = KIND_VALUES.includes(rawKind) ? toKind(rawKind) : defaultKind;

    applications.push({
      kind,
      company,
      position,
      status: parseStatus(get(row, "status")),
      dateApplied: normalizeDate(get(row, "date_applied") || get(row, "date")),
      location: get(row, "location"),
      salary: get(row, "salary"),
      source: get(row, "source"),
      contact: get(row, "contact"),
      link: get(row, "link") || get(row, "url"),
      notes: get(row, "notes"),
      nextActionDate: normalizeDate(get(row, "next_action_date")),
      nextActionNote: get(row, "next_action_note"),
      checklist: {
        resumeSent: truthy(get(row, "resume_sent")),
        coverLetterSent: truthy(get(row, "cover_letter_sent")),
        followUpSent: truthy(get(row, "follow_up_sent")),
      },
    });
  });

  if (applications.length === 0) {
    return {
      applications,
      skippedRows,
      error: "No importable rows found (each row needs a company and position)",
    };
  }
  return { applications, skippedRows, error: null };
}
