"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
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
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Status, STATUS_COLORS, needsFollowUp } from "@/constants/generic";
import { daysSince } from "@/lib/date";
import { JobApplication } from "@/constants/types";
import { mapRowToApplication } from "@/lib/applications";

/** Shared glass tooltip styling for every chart. */
const TOOLTIP_STYLE = {
  background: "rgba(45, 53, 59, 0.72)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  borderRadius: "14px",
  color: "#fff",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
} as const;

const AXIS_TICK = {
  fill: "color-mix(in srgb, var(--color-foreground) 55%, transparent)",
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

interface Derived {
  total: number;
  statusCounts: Record<string, number>;
  submitted: number;
  interviewRate: number;
  offerRate: number;
  followUpsDue: number;
  winRate: number | null;
  decided: number;
  thisWeek: number;
  thisMonth: number;
  byMonth: { month: string; count: number }[];
  busiestMonth: { month: string; count: number } | null;
  topCompanies: { company: string; count: number }[];
  bySource: { source: string; count: number }[];
}

function derive(apps: JobApplication[]): Derived {
  const total = apps.length;

  const statusCounts = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const offered = statusCounts["Offered"] || 0;
  const rejected = statusCounts["Rejected"] || 0;
  const interviewing = statusCounts["Interviewing"] || 0;
  const pending = statusCounts["Pending"] || 0;
  const closed = statusCounts["Closed"] || 0;

  // Applications you actually submitted — exclude Pending (not sent yet) and
  // Closed (posting closed before you could apply). These are the fair
  // denominator for conversion rates.
  const submitted = total - pending - closed;

  // Anyone currently interviewing or with an offer has earned a conversation.
  const advanced = interviewing + offered;
  const decided = offered + rejected;

  const followUpsDue = apps.filter((a) =>
    needsFollowUp(a.status, a.lastActivityAt, a.nextActionDate),
  ).length;

  let thisWeek = 0;
  let thisMonth = 0;
  const monthCounts: Record<string, number> = {};

  for (const a of apps) {
    const d = daysSince(a.dateApplied);
    if (d !== null && d >= 0) {
      if (d < 7) thisWeek += 1;
      if (d < 30) thisMonth += 1;
    }
    const parts = a.dateApplied?.split("-");
    if (parts && parts.length >= 2 && !parts.slice(0, 2).some((p) => !p)) {
      const key = `${parts[0]}-${parts[1].padStart(2, "0")}`;
      monthCounts[key] = (monthCounts[key] || 0) + 1;
    }
  }

  // Build a continuous monthly series (zero-filled) for the last 12 months
  // with data, so the trend reads honestly rather than skipping quiet months.
  const sortedKeys = Object.keys(monthCounts).sort();
  let byMonth: { month: string; count: number }[] = [];
  if (sortedKeys.length > 0) {
    const [startY, startM] = sortedKeys[0].split("-").map(Number);
    const cursor = new Date(startY, startM - 1, 1);
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      byMonth.push({ month: key, count: monthCounts[key] || 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    byMonth = byMonth.slice(-12);
  }

  const busiestMonth =
    sortedKeys.length > 0
      ? Object.entries(monthCounts)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => b.count - a.count)[0]
      : null;

  const companyCounts = apps.reduce<Record<string, number>>((acc, a) => {
    const name = a.company?.trim();
    if (name) acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const topCompanies = Object.entries(companyCounts)
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Group untagged applications under one bucket so the chart stays honest
  // about how much of the pipeline has a known source.
  const sourceCounts = apps.reduce<Record<string, number>>((acc, a) => {
    const key = a.source?.trim() || "Untagged";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const bySource = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    total,
    statusCounts,
    submitted,
    interviewRate: submitted > 0 ? Math.round((advanced / submitted) * 100) : 0,
    offerRate: submitted > 0 ? Math.round((offered / submitted) * 100) : 0,
    followUpsDue,
    winRate: decided > 0 ? Math.round((offered / decided) * 100) : null,
    decided,
    thisWeek,
    thisMonth,
    byMonth,
    busiestMonth,
    topCompanies,
    bySource,
  };
}

export default function StatsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [apps, setApps] = useState<JobApplication[]>([]);

  useEffect(() => {
    (async () => {
      if (!isAuthenticated) {
        router.replace("/");
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from("applications")
        .select()
        .order("created_at", { ascending: false });

      if (error || !data) return;

      setApps(data.map(mapRowToApplication));
    })();
  }, [isAuthenticated, router]);

  const stats = useMemo(() => derive(apps), [apps]);

  const pieData = useMemo(
    () =>
      Object.entries(stats.statusCounts).map(([name, value]) => ({
        name,
        value,
      })),
    [stats.statusCounts],
  );

  const statCards = [
    {
      label: "Total Applications",
      value: stats.total,
      sub: "tracked",
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Interview Rate",
      value: `${stats.interviewRate}%`,
      sub: "of apps submitted",
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Offer Rate",
      value: `${stats.offerRate}%`,
      sub:
        stats.winRate !== null
          ? `${stats.winRate}% of decided`
          : "of apps submitted",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Follow-ups Due",
      value: stats.followUpsDue,
      sub: "need a nudge",
      color: "text-error",
      bg: "bg-error/10",
    },
  ];

  const highlights = [
    { label: "Applied this week", value: stats.thisWeek },
    { label: "Applied this month", value: stats.thisMonth },
    {
      label: "Win rate (decided)",
      value: stats.winRate !== null ? `${stats.winRate}%` : "—",
      sub: stats.decided > 0 ? `${stats.decided} decided` : "no outcomes yet",
    },
    {
      label: "Busiest month",
      value: stats.busiestMonth ? MONTH_LABEL(stats.busiestMonth.month) : "—",
      sub: stats.busiestMonth ? `${stats.busiestMonth.count} apps` : undefined,
    },
  ];

  const hasData = stats.total > 0;

  return (
    <div className="min-h-[calc(100vh-6rem)] p-4 md:p-8 transition-colors">
      <main className="max-w-4xl mx-auto space-y-6">
        {/* Headline KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="card-glass rounded-2xl p-5">
              <div
                className={`btn-glass inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-xl ${card.bg} mb-3`}
              >
                <span className={`text-lg font-black ${card.color}`}>
                  {card.value}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground/80">
                {card.label}
              </p>
              <p className="text-xs text-foreground/60 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        {!hasData ? (
          <section className="card-glass rounded-3xl p-8">
            <div className="py-20 text-center text-gray-500">
              <p className="text-lg italic">
                No data available to visualize. Add some applications first!
              </p>
            </div>
          </section>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status distribution */}
              <section className="card-glass rounded-3xl p-8">
                <h2 className="text-xl font-bold text-primary mb-6">
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
                            key={`cell-${entry.name}`}
                            fill={
                              STATUS_COLORS[entry.name as Status] || "#8884d8"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: "#fff" }} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Applications over time */}
              <section className="card-glass rounded-3xl p-8">
                <h2 className="text-xl font-bold text-primary mb-6">
                  Applications Over Time
                </h2>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stats.byMonth}
                      margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="appsArea" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="var(--color-secondary)"
                            stopOpacity={0.5}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--color-secondary)"
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
                        itemStyle={{ color: "#fff" }}
                        labelFormatter={(label) => MONTH_LABEL(String(label))}
                        formatter={(value) => [value, "Applications"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="var(--color-secondary)"
                        strokeWidth={2}
                        fill="url(#appsArea)"
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            {/* Top companies */}
            {stats.topCompanies.length > 0 && (
              <section className="card-glass rounded-3xl p-8">
                <h2 className="text-xl font-bold text-primary mb-6">
                  Top Companies
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
                        itemStyle={{ color: "#fff" }}
                        formatter={(value) => [value, "Applications"]}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--color-primary)"
                        radius={[0, 8, 8, 0]}
                        animationDuration={900}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {/* Where applications come from */}
            {stats.bySource.some((s) => s.source !== "Untagged") && (
              <section className="card-glass rounded-3xl p-8">
                <h2 className="text-xl font-bold text-primary mb-6">
                  Application Sources
                </h2>
                <div
                  className="w-full"
                  style={{ height: stats.bySource.length * 48 + 24 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.bySource}
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
                        width={120}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        contentStyle={TOOLTIP_STYLE}
                        itemStyle={{ color: "#fff" }}
                        formatter={(value) => [value, "Applications"]}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--color-secondary)"
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
              {highlights.map((h) => (
                <div key={h.label} className="card-glass rounded-2xl p-5">
                  <p className="text-2xl font-black text-foreground">
                    {h.value}
                  </p>
                  <p className="text-sm font-semibold text-foreground/80 mt-1">
                    {h.label}
                  </p>
                  {h.sub && (
                    <p className="text-xs text-foreground/60 mt-0.5">{h.sub}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
