"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useKind } from "@/context/KindContext";
import { useApplications } from "@/hooks/useApplications";
import { KindToggle } from "@/components/KindToggle";
import Navbar from "@/components/Navbar";
import { PipelineBars } from "@/components/Mark";
import {
  FOLLOW_UP_DAYS,
  STATUS_COLORS,
  STATUS_INK,
  STATUS_OPTIONS,
} from "@/constants/generic";
import { KIND_LABELS, statusLabel } from "@/constants/kind";
import { derive } from "@/lib/stats";
import { pipelineSegments, toneFor } from "@/lib/pipeline";

const MONTH_LABEL = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
};

const pct = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

/* ── band furniture ────────────────────────────────────────────────────────
   Every block on this page is a ruled band, not a card. The 2px rule between
   bands and the 1px rule between cells are the only structure there is.
   ───────────────────────────────────────────────────────────────────────── */

function Section({
  title,
  sub,
  className = "",
  children,
}: {
  title: string;
  sub: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`px-6 py-6 ${className}`}>
      <h4 style={{ margin: "0 0 2px" }}>{title}</h4>
      <p className="text-muted eyebrow" style={{ fontSize: 12, letterSpacing: "0.1em", margin: "0 0 20px" }}>
        {sub}
      </p>
      {children}
    </section>
  );
}

/** A headline number. `alive` is the one that asks something of you. */
function Metric({
  value,
  label,
  note,
  alive = false,
}: {
  value: string | number;
  label: string;
  note: string;
  alive?: boolean;
}) {
  return (
    <div className="px-6 py-6 border-l border-line first:border-l-0">
      <div
        className="tnum"
        style={{
          fontWeight: 800,
          fontSize: 46,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: alive ? "var(--color-accent-700)" : "var(--color-text)",
        }}
      >
        {value}
      </div>
      <div className="eyebrow" style={{ fontSize: 12, letterSpacing: "0.12em", marginTop: 10 }}>
        {label}
      </div>
      <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
        {note}
      </div>
    </div>
  );
}

/** One horizontal bar in a funnel or ranking. */
function BarRow({
  label,
  value,
  ratio,
  fill,
  labelWidth = 112,
}: {
  label: string;
  value: string | number;
  /** 0–1 of the track. */
  ratio: number;
  fill: string;
  labelWidth?: number;
}) {
  return (
    <div className="flex items-center gap-4 mb-3">
      <span
        className="eyebrow shrink-0 truncate"
        style={{ width: labelWidth, fontSize: 12, letterSpacing: "0.1em" }}
        title={label}
      >
        {label}
      </span>
      <span className="flex-1 relative" style={{ height: 26, background: "var(--color-neutral-200)" }}>
        <span
          className="absolute left-0 top-0 bottom-0"
          style={{ width: `${Math.max(ratio * 100, ratio > 0 ? 1.5 : 0)}%`, background: fill }}
        />
      </span>
      <span
        className="tnum shrink-0 text-right"
        style={{ width: 56, fontWeight: 800, fontSize: 15 }}
      >
        {value}
      </span>
    </div>
  );
}

function ScreenFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Navbar />
      {children}
    </div>
  );
}

export default function StatsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { kind, setKind } = useKind();
  const labels = KIND_LABELS[kind];
  const {
    applications: apps,
    history,
    loading,
    error,
    reload,
  } = useApplications({ withHistory: true, enabled: isAuthenticated });

  useEffect(() => {
    if (!isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  // Every number on the page describes one kind at a time; the fetch stays
  // unscoped so the toggle's counts stay honest.
  const scoped = useMemo(() => apps.filter((a) => a.kind === kind), [apps, kind]);
  const stats = useMemo(() => derive(scoped, history), [scoped, history]);

  if (loading) {
    return (
      <ScreenFrame>
        <div className="px-6 py-6 border-b-2 border-line">
          <div className="skeleton h-8 w-44 mb-2" />
          <div className="skeleton h-3 w-56" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 border-b-2 border-line">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-6 py-6 border-l border-line first:border-l-0">
              <div className="skeleton h-11 w-20 mb-3" />
              <div className="skeleton h-3 w-28 mb-1.5" />
              <div className="skeleton h-3 w-20" />
            </div>
          ))}
        </div>
        <div className="px-6 py-6" role="status" aria-label="Loading statistics">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 mb-3">
              <div className="skeleton h-3 w-[112px] shrink-0" />
              <div className="skeleton h-[26px] flex-1" />
              <div className="skeleton h-4 w-14 shrink-0" />
            </div>
          ))}
        </div>
      </ScreenFrame>
    );
  }

  // A failed load must never render as "you have no applications" — every
  // number below would be a zero the user has no reason to distrust.
  if (error) {
    return (
      <ScreenFrame>
        <div className="flex-1 flex items-center px-6 py-16">
          <div className="max-w-[520px]">
            <div className="flex gap-1 mb-6" aria-hidden="true">
              <span style={{ width: 64, height: 10, background: "var(--color-accent)" }} />
              <span style={{ width: 64, height: 10, background: "var(--color-neutral-300)" }} />
              <span style={{ width: 64, height: 10, background: "var(--color-neutral-300)" }} />
            </div>
            <h2 style={{ fontSize: 38, margin: "0 0 10px" }}>
              Couldn&apos;t load your stats.
            </h2>
            <p className="text-muted max-w-[44ch]" style={{ fontSize: 15 }}>
              {error}
            </p>
            <div className="hr" />
            <button
              onClick={() => reload()}
              className="btn btn-primary"
              style={{ letterSpacing: "0.08em" }}
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      </ScreenFrame>
    );
  }

  const hasData = stats.total > 0;

  // Four stages rather than the mock's five: these are the ones the data
  // actually records, and inventing a "screen" stage would be a decorative
  // number in a place people read as a fact.
  const funnel = [
    { label: "Tracked", value: stats.total, fill: "var(--color-text)" },
    { label: labels.funnel[0], value: stats.funnel.submitted, fill: "var(--color-text)" },
    { label: labels.funnel[1], value: stats.funnel.interviewed, fill: "var(--color-neutral-700)" },
    { label: labels.funnel[2], value: stats.funnel.offered, fill: "var(--color-accent)" },
  ];

  const conversions = [
    { label: `Tracked → ${labels.funnel[0].toLowerCase()}`, from: stats.total, to: stats.funnel.submitted },
    { label: `${labels.funnel[0]} → ${labels.funnel[1].toLowerCase()}`, from: stats.funnel.submitted, to: stats.funnel.interviewed },
    { label: `${labels.funnel[1]} → ${labels.funnel[2].toLowerCase()}`, from: stats.funnel.interviewed, to: stats.funnel.offered },
  ];

  const sources = stats.sourceConversion.map((s) => {
    const total = s.offered + s.interviewed + s.noInterview;
    const interviews = s.offered + s.interviewed;
    return {
      name: s.source,
      apps: total,
      interviews,
      rate: pct(interviews, total),
    };
  });

  const maxMonth = Math.max(1, ...stats.byMonth.map((m) => m.count));
  const maxCompany = Math.max(1, ...stats.topCompanies.map((c) => c.count));
  const busiest = stats.busiestMonth;

  const highlights = [
    {
      value: stats.thisWeek,
      label: "Applied this week",
      note: `${stats.thisWeek - stats.lastWeek >= 0 ? "+" : ""}${stats.thisWeek - stats.lastWeek} vs last week`,
    },
    { value: stats.thisMonth, label: "Applied this month", note: "in the last 30 days" },
    {
      value: stats.winRate !== null ? `${stats.winRate}%` : "—",
      label: "Win rate (decided)",
      note: stats.decided > 0 ? `${stats.decided} decided` : "no outcomes yet",
    },
    {
      value: busiest ? MONTH_LABEL(busiest.month) : "—",
      label: "Busiest month",
      note: busiest ? `${busiest.count} applications` : "—",
    },
  ];

  return (
    <ScreenFrame>
      {/* Header band */}
      <div className="flex flex-wrap items-end gap-4 px-6 py-5 border-b-2 border-line">
        <div className="mr-auto">
          <h2 style={{ margin: "0 0 2px", fontSize: 30 }}>Statistics</h2>
          <div className="eyebrow text-muted" style={{ fontSize: 12, letterSpacing: "0.1em" }}>
            {labels.tab} · {stats.total} application{stats.total === 1 ? "" : "s"}
          </div>
        </div>
        {/* The mock put a date-range switch here; the real scope control on
            this page is which track you're looking at. */}
        <KindToggle kind={kind} setKind={setKind} applications={apps} />
      </div>

      {/* Headline metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b-2 border-line">
        <Metric
          value={stats.total}
          label="Total applications"
          note={`${stats.thisMonth} in the last 30 days`}
        />
        <Metric
          value={`${stats.interviewRate}%`}
          label="Interview rate"
          note={`of ${stats.funnel.submitted} submitted`}
        />
        <Metric
          value={`${stats.offerRate}%`}
          label="Offer rate"
          note={
            stats.decided > 0
              ? `${stats.funnel.offered} of ${stats.decided} decided`
              : "no outcomes yet"
          }
          alive={stats.funnel.offered > 0}
        />
        <Metric
          value={stats.followUpsDue}
          label="Follow-ups due"
          note={stats.followUpsDue > 0 ? "need a nudge" : "nothing overdue"}
          alive={stats.followUpsDue > 0}
        />
      </div>

      {!hasData ? (
        <div className="flex-1 flex items-center px-6 py-16">
          <div className="max-w-[520px]">
            <div className="flex gap-1 mb-6" aria-hidden="true">
              <span style={{ width: 64, height: 10, background: "var(--color-neutral-300)" }} />
              <span style={{ width: 64, height: 10, background: "var(--color-neutral-300)" }} />
              <span style={{ width: 64, height: 10, background: "var(--color-neutral-300)" }} />
            </div>
            <h2 style={{ fontSize: 38, margin: "0 0 10px" }}>Nothing to measure yet.</h2>
            <p className="text-muted max-w-[44ch]" style={{ fontSize: 15 }}>
              Add a few applications and this page fills in — conversion at each
              stage, which sources are working, and what has gone quiet.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Funnel + sources */}
          <div className="grid lg:grid-cols-[1.4fr_1fr] border-b-2 border-line">
            <Section
              title="Pipeline funnel"
              sub="Every stage an application has reached"
              className="lg:border-r border-line"
            >
              {funnel.map((stage) => (
                <BarRow
                  key={stage.label}
                  label={stage.label}
                  value={stage.value}
                  ratio={stats.total > 0 ? stage.value / stats.total : 0}
                  fill={stage.fill}
                />
              ))}
              <div className="hr" />
              <div className="grid grid-cols-3 gap-3">
                {conversions.map((c) => (
                  <div key={c.label}>
                    <div className="tnum" style={{ fontWeight: 800, fontSize: 24 }}>
                      {c.from > 0 ? `${pct(c.to, c.from)}%` : "—"}
                    </div>
                    <div className="text-muted eyebrow" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
                      {c.label}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title={labels.conversionTitle} sub={labels.conversionSub}>
              {sources.length === 0 ? (
                <p className="text-muted" style={{ fontSize: 13 }}>
                  Nothing submitted yet.
                </p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>{labels.source}</th>
                      <th className="text-right">Apps</th>
                      <th className="text-right">{labels.funnel[1]}</th>
                      <th className="text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((s) => (
                      <tr key={s.name}>
                        <td className="truncate">{s.name}</td>
                        <td className="text-right tnum">{s.apps}</td>
                        <td className="text-right tnum">{s.interviews}</td>
                        <td
                          className="text-right tnum"
                          style={{
                            fontWeight: 800,
                            // Only a source that's actually converting earns
                            // the accent; the rest are plain ink.
                            color:
                              s.rate >= 50
                                ? "var(--color-accent-700)"
                                : "var(--color-text)",
                          }}
                        >
                          {s.rate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Section>
          </div>

          {/* Status split + top entities */}
          <div className="grid lg:grid-cols-2 border-b-2 border-line">
            <Section
              title="Status distribution"
              sub="Where everything stands right now"
              className="lg:border-r border-line"
            >
              {/* One stacked rule, then the key. A ring would be the only
                  curve on the page. */}
              <div className="flex w-full mb-4" style={{ height: 26 }}>
                {STATUS_OPTIONS.filter((s) => (stats.statusCounts[s] ?? 0) > 0).map(
                  (s) => (
                    <span
                      key={s}
                      title={`${statusLabel(kind, s)}: ${stats.statusCounts[s]}`}
                      style={{
                        flex: `${stats.statusCounts[s]} 0 0`,
                        background: STATUS_COLORS[s],
                      }}
                    />
                  ),
                )}
              </div>
              <table className="table">
                <tbody>
                  {STATUS_OPTIONS.map((s) => {
                    const count = stats.statusCounts[s] ?? 0;
                    return (
                      <tr key={s}>
                        <td style={{ width: 18 }}>
                          <span
                            aria-hidden="true"
                            className="block"
                            style={{ width: 10, height: 10, background: STATUS_COLORS[s] }}
                          />
                        </td>
                        <td style={{ color: count > 0 ? STATUS_INK[s] : undefined }}>
                          {statusLabel(kind, s)}
                        </td>
                        <td className="text-right tnum" style={{ fontWeight: 800 }}>
                          {count}
                        </td>
                        <td className="text-right tnum text-muted" style={{ width: 56 }}>
                          {pct(count, stats.total)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Section>

            <Section title={labels.topEntities} sub="Where you have applied most">
              {stats.topCompanies.length === 0 ? (
                <p className="text-muted" style={{ fontSize: 13 }}>
                  Nothing tracked yet.
                </p>
              ) : (
                stats.topCompanies.map((c) => (
                  <BarRow
                    key={c.company}
                    label={c.company}
                    value={c.count}
                    ratio={c.count / maxCompany}
                    fill="var(--color-neutral-700)"
                    labelWidth={132}
                  />
                ))
              )}
            </Section>
          </div>

          {/* Activity */}
          <Section
            title="Activity"
            sub="Applications submitted per month"
            className="border-b-2 border-line"
          >
            {stats.byMonth.length === 0 ? (
              <p className="text-muted" style={{ fontSize: 13 }}>
                No dated applications yet — add an application date to see your
                trend over time.
              </p>
            ) : (
              <>
                <div
                  className="flex items-end gap-1.5"
                  style={{ height: 120, borderBottom: "2px solid var(--color-divider)" }}
                >
                  {stats.byMonth.map((m, i) => (
                    <span
                      key={m.month}
                      title={`${MONTH_LABEL(m.month)}: ${m.count}`}
                      style={{
                        flex: 1,
                        // The most recent stretch is the live one.
                        background:
                          i >= stats.byMonth.length - 2
                            ? "var(--color-accent)"
                            : "var(--color-neutral-700)",
                        height: `${Math.max((m.count / maxMonth) * 100, 2)}%`,
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-muted eyebrow pt-2">
                  {stats.byMonth.map((m) => (
                    <span key={m.month} className="flex-1 text-center truncate">
                      {MONTH_LABEL(m.month)}
                    </span>
                  ))}
                </div>
              </>
            )}
          </Section>

          {/* Staleness */}
          {stats.staleness.length > 0 && (
            <Section
              title="Gone quiet"
              sub="Active applications with no scheduled next step"
              className="border-b-2 border-line"
            >
              <table className="table">
                <thead>
                  <tr>
                    <th>{labels.entity}</th>
                    <th className="hidden md:table-cell">{labels.role}</th>
                    <th style={{ width: 130 }}>Pipeline</th>
                    <th className="text-right" style={{ width: 110 }}>
                      Silent for
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.staleness.map((row) => {
                    const overdue = row.daysQuiet >= FOLLOW_UP_DAYS;
                    const tone = toneFor(row.status, overdue);
                    return (
                      <tr key={row.id}>
                        <td className="truncate" style={{ fontWeight: 800 }}>
                          {row.company}
                        </td>
                        <td className="hidden md:table-cell max-w-0 truncate text-muted">
                          {row.position}
                        </td>
                        <td>
                          <PipelineBars
                            segments={pipelineSegments(row.status, tone)}
                          />
                        </td>
                        <td
                          className="text-right tnum"
                          style={{
                            fontWeight: 800,
                            color: overdue
                              ? "var(--color-accent-700)"
                              : "var(--color-text)",
                          }}
                        >
                          {row.daysQuiet <= 0
                            ? "Today"
                            : `${row.daysQuiet} day${row.daysQuiet === 1 ? "" : "s"}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Section>
          )}

          {/* Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4">
            {highlights.map((h) => (
              <Metric key={h.label} value={h.value} label={h.label} note={h.note} />
            ))}
          </div>
        </>
      )}
    </ScreenFrame>
  );
}
