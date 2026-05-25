"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "Pending" | "Applied" | "Interviewing" | "Offered" | "Rejected";

interface JobApplication {
  id: number;
  status: Status;
}

const COLORS = {
  Applied: "#3a94c5", // Blue
  Interviewing: "#dfa000", // Yellow
  Offered: "#8da101", // Green
  Rejected: "#f85552", // Red
  Pending: "#df69ba", // Purple
};

export default function StatsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [totals, setTotals] = useState({
    total: 0,
    offered: 0,
    interviewing: 0,
    rejected: 0,
  });

  const fetchJobs = async (): Promise<JobApplication[]> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("applications")
      .select()
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(
      (row): JobApplication => ({
        id: row.id,
        status: row.status,
      }),
    );
  };

  useEffect(() => {
    (async () => {
      if (!isAuthenticated) {
        router.replace("/");
        return;
      }

      const apps = await fetchJobs();

      if (apps.length > 0) {
        const counts = apps.reduce(
          (acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        const chartData = Object.entries(counts).map(([name, value]) => ({
          name,
          value,
        }));
        setData(chartData);
        setTotals({
          total: apps.length,
          offered: counts["Offered"] || 0,
          interviewing: counts["Interviewing"] || 0,
          rejected: counts["Rejected"] || 0,
        });
      }
    })();
  }, [isAuthenticated, router]);

  const statCards = [
    {
      label: "Total Applications",
      value: totals.total,
      sub: "tracked",
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Offers Received",
      value: totals.offered,
      sub:
        totals.total > 0
          ? `${Math.round((totals.offered / totals.total) * 100)}% rate`
          : "—",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "In Pipeline",
      value: totals.interviewing,
      sub: "interviewing",
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Rejected",
      value: totals.rejected,
      sub:
        totals.total > 0
          ? `${Math.round((totals.rejected / totals.total) * 100)}% rate`
          : "—",
      color: "text-error",
      bg: "bg-error/10",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-6rem)] p-4 md:p-8 transition-colors">
      <main className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white dark:bg-[#343f44] rounded-2xl border border-foreground/5 p-5 shadow-sm"
            >
              <div
                className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${card.bg} mb-3`}
              >
                <span className={`text-lg font-black ${card.color}`}>
                  {card.value}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground/80">
                {card.label}
              </p>
              <p className="text-xs text-foreground/40 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        <section className="bg-white dark:bg-[#343f44] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-foreground/5 dark:border-foreground/5 p-8">
          <h2 className="text-xl font-bold text-primary dark:text-primary mb-6">
            Status Distribution
          </h2>

          {data.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {data.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={
                          COLORS[entry.name as keyof typeof COLORS] || "#8884d8"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-20 text-center text-gray-500">
              <p className="text-lg italic">
                No data available to visualize. Add some applications first!
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
