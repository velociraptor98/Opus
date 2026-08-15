"use client";

import { needsFollowUp } from "@/constants/generic";
import { KIND_LABELS, statusLabel } from "@/constants/kind";
import type { JobApplication } from "@/constants/types";
import { daysSince, formatExactDate, formatRelativeDate } from "@/lib/date";
import { pipelineSegments, TONE_MARK, TONE_TAG, toneFor } from "@/lib/pipeline";
import { PipelineBars } from "./Mark";

/**
 * What the "next step" column says, and whether it's shouting.
 *
 * A scheduled step outranks a staleness nudge — if you already know what
 * you're doing next, being told to follow up is noise. It only turns urgent
 * once the date is today or past.
 */
function nextStep(application: JobApplication): { text: string; urgent: boolean } {
  const labels = KIND_LABELS[application.kind];
  const followUp = needsFollowUp(
    application.status,
    application.lastActivityAt,
    application.nextActionDate,
  );

  if (application.nextActionDate) {
    const days = daysSince(application.nextActionDate);
    if (days !== null) {
      const label = application.nextActionNote || labels.nextAction;
      if (days > 0) return { text: `${label} · missed`, urgent: true };
      if (days === 0) return { text: `${label} · today`, urgent: true };
      return {
        text: `${label} · ${formatRelativeDate(application.nextActionDate)}`,
        urgent: false,
      };
    }
  }

  if (followUp) return { text: "Follow up · due", urgent: true };
  return { text: "—", urgent: false };
}

const MUTED = "color-mix(in srgb, var(--color-text) 65%, transparent)";

/**
 * Everything both presentations of a row need. Derived once here so the table
 * row and the compact row can never disagree about an application's tone.
 */
function rowModel(application: JobApplication) {
  const followUp = needsFollowUp(
    application.status,
    application.lastActivityAt,
    application.nextActionDate,
  );
  const tone = toneFor(application.status, followUp);
  return {
    tone,
    mark: TONE_MARK[tone],
    segments: pipelineSegments(application.status, tone),
    next: nextStep(application),
    initial: application.company.trim()
      ? application.company.trim()[0].toUpperCase()
      : "?",
    // Once an application has gone quiet, the nudge is the more useful label —
    // except while interviewing, where the status is the bigger news.
    tagText:
      followUp && application.status !== "Interviewing"
        ? "Follow-up"
        : statusLabel(application.kind, application.status),
  };
}

/** The square initial standing in for a logo. */
const Mark = ({
  initial,
  bg,
  fg,
  size,
}: {
  initial: string;
  bg: string;
  fg: string;
  size: number;
}) => (
  <span
    aria-hidden="true"
    className="shrink-0 grid place-items-center"
    style={{
      width: size,
      height: size,
      fontWeight: 800,
      fontSize: size <= 26 ? 12 : 13,
      background: bg,
      color: fg,
    }}
  >
    {initial}
  </span>
);

/**
 * One application, as a table row. The row has no controls of its own:
 * editing, the checklist, notes and deleting all live behind a click into the
 * detail dialog, which is what keeps eight columns legible at a glance.
 */
export const JobRow = ({
  application,
  onOpen,
}: {
  application: JobApplication;
  onOpen: () => void;
}) => {
  const { mark, segments, next, initial, tone, tagText } = rowModel(application);

  return (
    <tr className="op-row cursor-pointer align-middle" onClick={onOpen}>
      <td className="pl-4 md:pl-8 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Mark initial={initial} bg={mark.bg} fg={mark.fg} size={26} />
          {/* The whole row is clickable, but this is the control that carries
              the accessible name and the keyboard path into the dialog. */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="op-lnk truncate text-left"
            style={{ fontWeight: 800, fontSize: 15 }}
            title={application.company}
          >
            {application.company}
          </button>
        </div>
      </td>
      <td className="max-w-0 truncate" title={application.position}>
        {application.position}
      </td>
      <td>
        <span className={`tag ${TONE_TAG[tone]} eyebrow`} style={{ letterSpacing: "0.08em" }}>
          {tagText}
        </span>
      </td>
      <td>
        <PipelineBars segments={segments} />
      </td>
      <td className="truncate" style={{ fontSize: 13, color: MUTED }}>
        {application.location || "—"}
      </td>
      <td className="truncate" style={{ fontSize: 13, color: MUTED }}>
        {application.source || "—"}
      </td>
      <td
        style={{ fontSize: 13, color: MUTED }}
        title={formatRelativeDate(application.dateApplied)}
      >
        {formatExactDate(application.dateApplied) || "—"}
      </td>
      <td
        className="pr-4 md:pr-8 truncate"
        style={{ fontSize: 13, color: next.urgent ? "var(--color-accent-700)" : MUTED }}
        title={
          application.nextActionDate
            ? formatExactDate(application.nextActionDate)
            : undefined
        }
      >
        {next.text}
      </td>
    </tr>
  );
};

/**
 * The same application, stacked, for viewports too narrow for eight columns.
 * Not a card — it keeps the list's hairline rules and flat ground, so a phone
 * reads as the same ledger rather than a different product.
 */
export const JobRowCompact = ({
  application,
  onOpen,
}: {
  application: JobApplication;
  onOpen: () => void;
}) => {
  const { mark, segments, next, initial, tone, tagText } = rowModel(application);

  return (
    <button
      onClick={onOpen}
      className="op-row w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-line"
    >
      <Mark initial={initial} bg={mark.bg} fg={mark.fg} size={28} />
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span className="flex-1 truncate" style={{ fontWeight: 800, fontSize: 15 }}>
            {application.company}
          </span>
          <span
            className={`tag ${TONE_TAG[tone]} eyebrow shrink-0`}
            style={{ fontSize: 9, letterSpacing: "0.08em" }}
          >
            {tagText}
          </span>
        </span>
        <span className="block truncate" style={{ fontSize: 13, color: MUTED }}>
          {application.position}
        </span>
        <span className="flex items-center gap-2.5 mt-2">
          <PipelineBars segments={segments} width={16} height={5} />
          <span
            className="eyebrow truncate"
            style={{
              fontSize: 11,
              letterSpacing: "0.08em",
              color: next.urgent ? "var(--color-accent-700)" : MUTED,
            }}
          >
            {next.text}
          </span>
        </span>
      </span>
    </button>
  );
};
