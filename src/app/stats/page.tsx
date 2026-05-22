"use client";

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Link from 'next/link';

type Status = 'Pending' | 'Applied' | 'Interviewing' | 'Offered' | 'Rejected';

interface JobApplication {
  id: number;
  status: Status;
}

const COLORS = {
  Applied: '#3b82f6',      // blue-500
  Interviewing: '#eab308', // yellow-500
  Offered: '#22c55e',      // green-500
  Rejected: '#ef4444',     // red-500
  Pending: '#71717a',      // zinc-500
};

export default function StatsPage() {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Auth check
    const auth = localStorage.getItem("isLoggedIn");
    if (auth !== "true") {
      setIsAuthenticated(false);
      return;
    }
    setIsAuthenticated(true);

    const saved = localStorage.getItem('jobApplications');
    let apps: JobApplication[] = [];

    if (saved) {
      apps = JSON.parse(saved);
    } else {
      // Use the same defaults as JobChecklist
      apps = [
        { id: 1, status: 'Applied' } as JobApplication,
        { id: 2, status: 'Interviewing' } as JobApplication,
        { id: 3, status: 'Pending' } as JobApplication,
        { id: 4, status: 'Offered' } as JobApplication,
        { id: 5, status: 'Rejected' } as JobApplication,
        { id: 6, status: 'Pending' } as JobApplication,
        { id: 7, status: 'Pending' } as JobApplication,
        { id: 8, status: 'Pending' } as JobApplication,
      ];
    }

    if (apps.length > 0) {
      const counts = apps.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const chartData = Object.entries(counts).map(([name, value]) => ({
        name,
        value,
      }));
      setData(chartData);
    }
  }, []);

  if (!isMounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-500 mb-8">Please sign in to view your statistics.</p>
          <Link href="/" className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold transition-all active:scale-95">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8">
      <main className="max-w-4xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <Link href="/" className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter hover:opacity-80 transition-opacity">
            Opus
          </Link>
          <Link 
            href="/" 
            className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold transition-all active:scale-95"
          >
            Back to List
          </Link>
        </header>

        <section className="bg-white dark:bg-zinc-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-zinc-800 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Application Status Distribution</h2>
          
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
                      <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: '#fff' 
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-20 text-center text-gray-500">
              <p className="text-lg italic">No data available to visualize. Add some applications first!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
