"use client";

import { useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Label,
  ResponsiveContainer,
  Legend,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  FOLLOW_UP_DAYS,
  Status,
  STATUS_COLORS,
  STATUS_CONFIG,
} from "@/constants/generic";
import { KIND_LABELS, statusLabel } from "@/constants/kind";
import { derive } from "@/lib/stats";
import { useKind } from "@/context/KindContext";
import { useApplications } from "@/hooks/useApplications";
import { KindToggle } from "@/components/KindToggle";

const MUTED_BAR = "color-mix(in srgb, var(--color-foreground) 28%, transparent)";

/** Shared glass tooltip styling for every chart — theme-aware via tokens. */
const TOOLTIP_STYLE = {
  background: "color-mix(in srgb, var(--background) 82%, transparent)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  border: "1px solid color-mix(in srgb, var(--foreground) 14%, transparent)",
  borderRadius: "14px",
  color: "var(--foreground)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.18)",
} as const;

/** Item (series) text colour inside tooltips — follows the foreground token. */
const TOOLTIP_ITEM_STYLE = { color: "var(--foreground)" } as const;

const AXIS_TICK = {
  // Axis labels are text, so they sit at the 4.5:1 floor, not the 3:1 one.
  fill: "color-mix(in srgb, var(--color-foreground) 75%, transparent)",
  fontSize: 12,
} as const;

const GRID_STROKE = "color-mix(in srgb, var(--color-foreground) 12%, transparent)";

const MONTH_LABEL = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
};

interface StatCardData {
  label: string;
  value: string | number;
  sub?: string;
  /**
   * Clay, and only clay — for the one metric that is a breath signal ("this is
   * alive"). Everything else is ink: a metric is not a status, so spending a
   * status hue on it made the colour mean nothing.
   */
  alive?: boolean;
  trend?: { delta: number; label: string };
}

/**
 * Headline metric tile — glass pill value and a staggered entrance. No colour
 * except where colour carries meaning: the clay "needs you" metric, and the
 * trend chip's direction.
 */
function StatCard({ card, index }: { card: StatCardData; index: number }) {
  const sub = card.trend
    ? `${card.trend.delta >= 0 ? "+" : ""}${card.trend.delta} ${card.trend.label}`
    : card.sub;
  return (
    <div
      className="card-glass animate-card rounded-2xl p-5"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`btn-glass inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-xl ${
            card.alive ? "bg-breath/10" : ""
          }`}
        >
          <span
            className={`text-lg font-bold whitespace-nowrap ${
              card.alive ? "text-breath" : "text-foreground"
            }`}
          >
            {card.value}
          </span>
        </div>
        {card.trend && <TrendChip delta={card.trend.delta} />}
      </div>
      <p className="text-sm font-semibold text-foreground/80">{card.label}</p>
      {sub && <p className="text-xs text-foreground/75 mt-0.5">{sub}</p>}
    </div>
  );
}

/** Up/down/flat arrow with magnitude, green for gains and red for losses. */
function TrendChip({ delta }: { delta: number }) {
  const flat = delta === 0;
  const up = delta > 0;
  const tone = flat ? "text-foreground/75" : up ? "text-primary" : "text-error";
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-bold tabular-nums ${tone}`}
      title={`${up ? "Up" : flat ? "No change" : "Down"} vs last week`}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d={flat ? "M5 12h14" : up ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
        />
      </svg>
      {Math.abs(delta)}
    </span>
  );
}

/** Centered placeholder shown in a chart slot when there isn't enough data. */
function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="h-full w-full flex items-center justify-center text-center px-6">
      <p className="text-sm italic text-foreground/75 max-w-xs">{message}</p>
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
  const scoped = useMemo(
    () => apps.filter((a) => a.kind === kind),
    [apps, kind],
  );
  const stats = useMemo(() => derive(scoped, history), [scoped, history]);

  // `status` keeps the stored value for the colour lookup; `name` is what the
  // legend and tooltip show, in the active kind's vocabulary.
  const pieData = useMemo(
    () =>
      Object.entries(stats.statusCounts).map(([status, value]) => ({
        status: status as Status,
        name: statusLabel(kind, status as Status),
        value,
      })),
    [stats.statusCounts, kind],
  );

  const statCards: StatCardData[] = [
    {
      label: "Total Applications",
      value: stats.total,
      sub: "tracked",
      trend: { delta: stats.thisWeek - stats.lastWeek, label: "vs last week" },
    },
    {
      label: "Interview Rate",
      value: `${stats.interviewRate}%`,
      sub: "of apps submitted",
    },
    {
      label: "Offer Rate",
      value: `${stats.offerRate}%`,
      sub:
        stats.winRate !== null
          ? `${stats.winRate}% of decided`
          : "of apps submitted",
    },
    {
      // The one card that asks something of you — a breath signal, so it keeps
      // the clay and is now the only colour in the row.
      label: "Follow-ups Due",
      value: stats.followUpsDue,
      sub: "need a nudge",
      alive: true,
    },
  ];

  const highlights: StatCardData[] = [
    {
      label: "Applied this week",
      value: stats.thisWeek,
      sub: "in the last 7 days",
    },
    {
      label: "Applied this month",
      value: stats.thisMonth,
      sub: "in the last 30 days",
    },
    {
      label: "Win rate (decided)",
      value: stats.winRate !== null ? `${stats.winRate}%` : "—",
      sub: stats.decided > 0 ? `${stats.decided} decided` : "no outcomes yet",
    },
    {
      label: "Busiest month",
      value: stats.busiestMonth ? MONTH_LABEL(stats.busiestMonth.month) : "—",
      sub: stats.busiestMonth ? `${stats.busiestMonth.count} apps` : "—",
    },
  ];

  const hasData = stats.total > 0;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-6rem)] p-4 md:p-8">
        <main className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-glass rounded-2xl p-5">
                <div className="skeleton h-9 w-12 rounded-xl mb-3" />
                <div className="skeleton h-4 w-24 rounded mb-1.5" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <section key={i} className="card-glass animate-card rounded-2xl p-8">
                <div className="skeleton h-6 w-40 rounded mb-6" />
                <div className="skeleton h-[280px] w-full rounded-2xl" />
              </section>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // A failed load must never render as "you have no applications" — every
  // number below would be a zero the user has no reason to distrust.
  if (error) {
    return (
      <div className="min-h-[calc(100vh-6rem)] p-4 md:p-8 transition-colors">
        <main className="max-w-4xl mx-auto">
          <section className="card-glass animate-card rounded-2xl p-8">
            <div className="py-16 text-center flex flex-col items-center gap-4">
              <svg
                className="w-8 h-8 text-error"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-lg font-semibold text-foreground mb-1">
                  Couldn&apos;t load your stats
                </p>
                <p className="text-sm text-foreground/75">{error}</p>
              </div>
              <button
                onClick={() => reload()}
                className="btn-glass px-4 py-2 rounded-lg text-sm font-semibold bg-breath text-paper border-breath"
              >
                Try again
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] p-4 md:p-8 transition-colors">
      <main className="max-w-4xl mx-auto space-y-6">
        {/* Which track these numbers describe. Counts come from the full
            fetch, so the inactive segment still shows what's waiting there. */}
        <div className="flex justify-end">
          <KindToggle
            kind={kind}
            setKind={setKind}
            applications={apps}
            size="sm"
          />
        </div>

        {/* Headline KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <StatCard key={card.label} card={card} index={i} />
          ))}
        </div>

        {!hasData ? (
          <section className="card-glass animate-card rounded-2xl p-8">
            <div className="py-20 text-center text-foreground/75">
              <p className="text-lg italic">
                No data available to visualize. Add some applications first!
              </p>
            </div>
          </section>
        ) : (
          <>
            {stats.funnel.submitted > 0 && (
              <>
                {/* Pipeline funnel — ever-reached stages, not a snapshot */}
                <section className="card-glass animate-card rounded-2xl p-8">
                  <h2 className="text-xl font-semibold text-foreground mb-1">
                    Pipeline Funnel
                  </h2>
                  <p className="text-xs text-foreground/75 mb-4">
                    Every stage an application has ever reached
                  </p>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <FunnelChart>
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          itemStyle={TOOLTIP_ITEM_STYLE}
                        />
                        <Funnel
                          dataKey="value"
                          data={[
                            {
                              name: labels.funnel[0],
                              value: stats.funnel.submitted,
                              fill: "var(--color-secondary)",
                            },
                            {
                              name: labels.funnel[1],
                              value: stats.funnel.interviewed,
                              fill: "var(--color-warning)",
                            },
                            {
                              name: labels.funnel[2],
                              value: stats.funnel.offered,
                              fill: "var(--color-primary)",
                            },
                          ]}
                          isAnimationActive
                          animationDuration={900}
                        >
                          <LabelList
                            dataKey="name"
                            position="right"
                            fill={AXIS_TICK.fill}
                            stroke="none"
                            fontSize={12}
                          />
                        </Funnel>
                      </FunnelChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-foreground/5 text-center">
                    {[
                      {
                        label: `${labels.funnel[0]} → ${labels.funnel[1]}`,
                        from: stats.funnel.submitted,
                        to: stats.funnel.interviewed,
                      },
                      {
                        label: `${labels.funnel[1]} → ${labels.funnel[2]}`,
                        from: stats.funnel.interviewed,
                        to: stats.funnel.offered,
                      },
                      {
                        label: "Overall",
                        from: stats.funnel.submitted,
                        to: stats.funnel.offered,
                      },
                    ].map((step) => (
                      <div key={step.label}>
                        <p className="text-lg font-black text-foreground">
                          {step.from > 0
                            ? `${Math.round((step.to / step.from) * 100)}%`
                            : "—"}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide font-semibold text-foreground/75">
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Conversion by source */}
                {stats.sourceConversion.some((s) => s.source !== "Untagged") && (
                  <section className="card-glass animate-card rounded-2xl p-8">
                    <h2 className="text-xl font-semibold text-foreground mb-1">
                      {labels.conversionTitle}
                    </h2>
                    <p className="text-xs text-foreground/75 mb-4">
                      {labels.conversionSub}
                    </p>
                    <div
                      className="w-full"
                      style={{
                        height: Math.max(
                          stats.sourceConversion.length * 48 + 60,
                          200,
                        ),
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.sourceConversion}
                          layout="vertical"
                          margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                        >
                          <CartesianGrid
                            horizontal={false}
                            strokeDasharray="3 3"
                            stroke={GRID_STROKE}
                          />
                          <XAxis
                            type="number"
                            allowDecimals={false}
                            tick={AXIS_TICK}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="source"
                            tick={AXIS_TICK}
                            tickLine={false}
                            axisLine={false}
                            width={110}
                          />
                          <Tooltip
                            cursor={{ fill: "rgba(255,255,255,0.04)" }}
                            contentStyle={TOOLTIP_STYLE}
                            itemStyle={TOOLTIP_ITEM_STYLE}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: 12 }}
                            iconSize={10}
                          />
                          <Bar
                            dataKey="offered"
                            name={labels.funnel[2]}
                            stackId="pipeline"
                            fill="var(--sage)"
                            animationDuration={900}
                          />
                          <Bar
                            dataKey="interviewed"
                            name={labels.funnel[1]}
                            stackId="pipeline"
                            fill="var(--amber)"
                            animationDuration={900}
                          />
                          <Bar
                            dataKey="noInterview"
                            name="No interview yet"
                            stackId="pipeline"
                            fill={MUTED_BAR}
                            radius={[0, 8, 8, 0]}
                            animationDuration={900}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                )}
              </>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status distribution */}
              <section className="card-glass animate-card rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Status Distribution
                </h2>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1000}
                      >
                        {pieData.map((entry) => (
                          <Cell
                            key={`cell-${entry.status}`}
                            fill={STATUS_COLORS[entry.status] ?? "var(--taupe)"}
                          />
                        ))}
                        <Label
                          position="center"
                          content={({ viewBox }) => {
                            const { cx, cy } = (viewBox ?? {}) as {
                              cx?: number;
                              cy?: number;
                            };
                            if (cx == null || cy == null) return null;
                            return (
                              <text textAnchor="middle">
                                <tspan
                                  x={cx}
                                  y={cy}
                                  dy="-0.1em"
                                  style={{
                                    fill: "var(--color-foreground)",
                                    fontSize: 32,
                                    fontWeight: 800,
                                  }}
                                >
                                  {stats.total}
                                </tspan>
                                <tspan
                                  x={cx}
                                  y={cy}
                                  dy="1.5em"
                                  style={{
                                    fill: "color-mix(in srgb, var(--color-foreground) 60%, transparent)",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    letterSpacing: "0.08em",
                                  }}
                                >
                                  APPLICATIONS
                                </tspan>
                              </text>
                            );
                          }}
                        />
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Applications over time */}
              <section className="card-glass animate-card rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Applications Over Time
                </h2>
                <div className="h-[320px] w-full">
                  {stats.byMonth.length === 0 ? (
                    <ChartEmpty message="No dated applications yet — add an application date to see your trend over time." />
                  ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stats.byMonth}
                      margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="appsArea" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="var(--clay)"
                            stopOpacity={0.5}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--clay)"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                      <XAxis
                        dataKey="month"
                        tickFormatter={MONTH_LABEL}
                        tick={AXIS_TICK}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={AXIS_TICK}
                        tickLine={false}
                        axisLine={false}
                        width={32}
                      />
                      <Tooltip
                        contentStyle={TOOLTIP_STYLE}
                        itemStyle={TOOLTIP_ITEM_STYLE}
                        labelFormatter={(label) => MONTH_LABEL(String(label))}
                        formatter={(value) => [value, "Applications"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="var(--clay)"
                        strokeWidth={2}
                        fill="url(#appsArea)"
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  )}
                </div>
              </section>
            </div>

            {/* Pipeline staleness — who's been left waiting */}
            {stats.staleness.length > 0 && (
              <section className="card-glass animate-card rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Pipeline Staleness
                </h2>
                <p className="text-xs text-foreground/75 mb-6">
                  Active applications by time since last movement — apps with a
                  scheduled next step aren&apos;t shown
                </p>
                <div className="space-y-3">
                  {stats.staleness.map((row) => {
                    const cfg = STATUS_CONFIG[row.status];
                    const tone =
                      row.daysQuiet >= FOLLOW_UP_DAYS * 2
                        ? "text-error"
                        : row.daysQuiet >= FOLLOW_UP_DAYS
                          ? "text-warning"
                          : "text-foreground/75";
                    const barColor =
                      row.daysQuiet >= FOLLOW_UP_DAYS * 2
                        ? "var(--color-error)"
                        : row.daysQuiet >= FOLLOW_UP_DAYS
                          ? "var(--color-warning)"
                          : "var(--color-secondary)";
                    return (
                      <div key={row.id} className="flex items-center gap-3">
                        <div className="w-40 md:w-56 shrink-0 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {row.company}
                          </p>
                          <p className="text-xs text-foreground/75 truncate">
                            {row.position}
                          </p>
                        </div>
                        <span
                          className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${cfg.bg} ${cfg.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                          />
                          {statusLabel(kind, row.status)}
                        </span>
                        <div className="flex-1 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              // Saturates at four weeks of silence.
                              width: `${Math.min(row.daysQuiet / 28, 1) * 100}%`,
                              background: barColor,
                              opacity: 0.7,
                            }}
                          />
                        </div>
                        <p
                          className={`w-20 shrink-0 text-right text-xs font-bold tabular-nums ${tone}`}
                        >
                          {row.daysQuiet <= 0
                            ? "Today"
                            : `${row.daysQuiet} day${row.daysQuiet === 1 ? "" : "s"}`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Top companies */}
            {stats.topCompanies.length > 0 && (
              <section className="card-glass animate-card rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {labels.topEntities}
                </h2>
                <div
                  className="w-full"
                  style={{ height: stats.topCompanies.length * 48 + 24 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.topCompanies}
                      layout="vertical"
                      margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid
                        horizontal={false}
                        strokeDasharray="3 3"
                        stroke={GRID_STROKE}
                      />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={AXIS_TICK}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="company"
                        tick={AXIS_TICK}
                        tickLine={false}
                        axisLine={false}
                        width={120}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        contentStyle={TOOLTIP_STYLE}
                        itemStyle={TOOLTIP_ITEM_STYLE}
                        formatter={(value) => [value, "Applications"]}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--sage)"
                        radius={[0, 8, 8, 0]}
                        animationDuration={900}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* Quick highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {highlights.map((h, i) => (
                <StatCard key={h.label} card={h} index={i} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
