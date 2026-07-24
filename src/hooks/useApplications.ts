"use client";

import { useCallback, useEffect, useState } from "react";
import type { Status } from "@/constants/generic";
import type { JobApplication } from "@/constants/types";
import { mapRowToApplication } from "@/lib/applications";
import { createClient } from "@/lib/supabase/client";
import type { StatusHistory } from "@/lib/stats";
import { useToast } from "@/context/ToastContext";

interface Options {
  /** Also load the status-transition trail, for funnel analytics. */
  withHistory?: boolean;
  /** Skip the fetch entirely, e.g. while signed out. */
  enabled?: boolean;
}

interface Result {
  applications: JobApplication[];
  /** Exposed so callers can apply their own optimistic updates. */
  setApplications: React.Dispatch<React.SetStateAction<JobApplication[]>>;
  history: StatusHistory;
  loading: boolean;
  /** Non-null when the list couldn't be loaded — never confuse with "empty". */
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Loads the signed-in user's applications (rows are scoped by RLS, not by a
 * filter here). Both the dashboard and the stats page read the same list, so
 * the query, the row mapping and the failure handling live here rather than
 * being written twice and drifting.
 *
 * A failed load sets `error` *and* raises a toast: a silent failure renders as
 * an empty list, which tells the user their data is gone when it's only
 * unreachable.
 */
export function useApplications({
  withHistory = false,
  enabled = true,
}: Options = {}): Result {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [history, setHistory] = useState<StatusHistory>({});
  // Starts false when disabled: there is no fetch to wait for, so a caller
  // gating a skeleton on `loading` shouldn't see one.
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Every state change here lands after the await, so the mount effect can
  // call this without a synchronous cascade. `loading` starts true instead.
  const load = useCallback(async () => {
    const supabase = createClient();
    const [appsRes, eventsRes] = await Promise.all([
      supabase
        .from("applications")
        .select()
        .order("created_at", { ascending: false }),
      withHistory
        ? supabase
            .from("application_events")
            .select("application_id, from_status, to_status")
        : null,
    ]);

    if (appsRes.error) {
      const message = appsRes.error.message || "Couldn't load applications";
      setError(message);
      toast.show(message, { variant: "error" });
      setLoading(false);
      return;
    }

    setError(null);
    setApplications((appsRes.data ?? []).map(mapRowToApplication));

    // History is an enhancement — without it (e.g. migration not yet run) the
    // funnel still works from current statuses alone, so its failure is not
    // the list's failure.
    if (eventsRes && !eventsRes.error && eventsRes.data) {
      const byApp: StatusHistory = {};
      for (const e of eventsRes.data) {
        const statuses = (byApp[e.application_id] ??= []);
        // A transition proves both endpoints were visited.
        if (e.from_status) statuses.push(e.from_status as Status);
        statuses.push(e.to_status as Status);
      }
      setHistory(byApp);
    } else if (eventsRes?.error) {
      console.warn("Couldn't load status history:", eventsRes.error.message);
    }

    setLoading(false);
  }, [withHistory, toast]);

  useEffect(() => {
    if (!enabled) return;
    (async () => {
      await load();
    })();
  }, [enabled, load]);

  // Manual refetch, from an event handler — free to show the skeleton again.
  const reload = useCallback(async () => {
    setLoading(true);
    await load();
  }, [load]);

  return {
    applications,
    setApplications,
    history,
    loading,
    error,
    reload,
  };
}
