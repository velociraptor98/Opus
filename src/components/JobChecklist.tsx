"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { JobRow, JobRowCompact } from "./JobRow";
import { DetailModal } from "./DetailModal";
import { NewJobModal } from "./NewJobModal";
import { createClient } from "@/lib/supabase/client";
import { JobApplication } from "@/constants/types";
import {
  FilterOption,
  needsFollowUp,
  SortOption,
  sortApplications,
  Status,
} from "@/constants/generic";
import { KIND_LABELS } from "@/constants/kind";
import {
  mapRowToApplication,
  toInsertRow,
  toUpdateRow,
} from "@/lib/applications";
import { useToast } from "@/context/ToastContext";
import { useKind } from "@/context/KindContext";
import { useApplications } from "@/hooks/useApplications";
import { JobChecklistSkeleton } from "./JobChecklistSkeleton";
import { EmptyContainer } from "./EmptyContainer";
import { NavigationPanel } from "./NavigationPanel";
import { AddApplication } from "./AddApplication";
import { SearchBar } from "./SearchBar";
import { FilterPanel } from "./FilterPanel";
import { SortBar } from "./SortBar";
import { ImportExport } from "./ImportExport";
import { UpcomingStrip } from "./UpcomingStrip";
import { KindToggle } from "./KindToggle";

// A table row is a third the height of the old card, so a screenful is
// roughly three times as many.
const PAGE_SIZE = 25;

/** Rows per insert when importing, so one huge CSV isn't one huge request. */
const IMPORT_BATCH_SIZE = 200;

/** Fields a free-text search looks at, in the order they matter. */
const SEARCH_FIELDS = [
  "company",
  "position",
  "location",
  "source",
  "contact",
  "notes",
  "nextActionNote",
] as const satisfies readonly (keyof JobApplication)[];

const matchesSearch = (app: JobApplication, query: string) =>
  SEARCH_FIELDS.some((field) =>
    String(app[field] ?? "")
      .toLowerCase()
      .includes(query),
  );

const JobChecklist = () => {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<FilterOption>("All");
  const [sort, setSort] = useState<SortOption>("Recently added");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const toast = useToast();
  const { kind, setKind } = useKind();
  const { applications, setApplications, loading } = useApplications();

  // Best-effort history trail: a failed insert (e.g. migration not yet run)
  // must never block the actual update.
  const logStatusEvent = async (
    applicationId: string,
    fromStatus: Status | null,
    toStatus: Status,
  ) => {
    const supabase = createClient();
    const { error } = await supabase.from("application_events").insert({
      application_id: applicationId,
      from_status: fromStatus,
      to_status: toStatus,
    });
    if (error) {
      console.warn("Couldn't record status history:", error.message);
    }
  };

  const updateApplication = async (
    id: string,
    updates: Partial<JobApplication>,
  ): Promise<boolean> => {
    const supabase = createClient();
    const dbUpdates = toUpdateRow(updates);

    // A status move, or marking a follow-up as just sent, counts as activity —
    // reset the follow-up clock. Only the transition to checked counts, so
    // unchecking it (or toggling the other checklist items) won't reset it.
    const prev = applications.find((app) => app.id === id);
    const followUpJustSent =
      updates.checklist?.followUpSent === true &&
      prev?.checklist.followUpSent === false;
    const activityStamp =
      updates.status !== undefined || followUpJustSent
        ? new Date().toISOString()
        : null;
    if (activityStamp) dbUpdates.updated_at = activityStamp;

    const { error } = await supabase
      .from("applications")
      .update(dbUpdates)
      .eq("id", id);

    if (error) {
      toast.show(error.message || "Couldn't save changes", { variant: "error" });
      return false;
    }

    if (updates.status !== undefined && prev && updates.status !== prev.status) {
      logStatusEvent(id, prev.status, updates.status);
    }

    setApplications((apps) =>
      apps.map((app) =>
        app.id === id
          ? {
              ...app,
              ...updates,
              ...(activityStamp ? { lastActivityAt: activityStamp } : {}),
            }
          : app,
      ),
    );
    return true;
  };

  const deleteApplication = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) {
      toast.show(error.message || "Couldn't delete application", {
        variant: "error",
      });
      return;
    }
    setApplications((apps) => apps.filter((app) => app.id !== id));
    toast.show("Application deleted", { variant: "success" });
  };

  const addNewJob = async (
    newJobData: Omit<JobApplication, "id" | "lastActivityAt">,
  ): Promise<{ error: string | null }> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("applications")
      .insert(toInsertRow(newJobData))
      .select()
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Failed to create application" };
    }

    const newJob = mapRowToApplication(data);
    logStatusEvent(newJob.id, null, newJob.status);
    setApplications((apps) => [newJob, ...apps]);
    // Clear any active filter/search/sort so the new row surfaces at the top.
    setStatusFilter("All");
    setSearchQuery("");
    setSort("Recently added");
    setPage(0);
    toast.show("Application added", { variant: "success" });
    return { error: null };
  };

  const importApplications = async (
    jobs: Omit<JobApplication, "id" | "lastActivityAt">[],
  ): Promise<{ added: number; error: string | null }> => {
    const supabase = createClient();

    // Sent in batches: one insert of a few thousand rows is a single request
    // large enough to be rejected outright, and the failure arrives as an
    // opaque error with nothing imported. Batches also mean a failure part
    // way through keeps the rows that already landed.
    const imported: JobApplication[] = [];
    for (let i = 0; i < jobs.length; i += IMPORT_BATCH_SIZE) {
      const batch = jobs.slice(i, i + IMPORT_BATCH_SIZE);
      const { data, error } = await supabase
        .from("applications")
        .insert(batch.map(toInsertRow))
        .select();

      if (error || !data) {
        return {
          added: imported.length,
          error: error?.message ?? "Import failed",
        };
      }
      imported.push(...data.map(mapRowToApplication));
    }

    if (imported.length === 0) {
      return { added: 0, error: "Import failed" };
    }
    // A CSV carrying its own `kind` column can land entirely outside the
    // active toggle; follow it rather than reporting a successful import
    // into a list that doesn't change.
    if (!imported.some((job) => job.kind === kind)) {
      setKind(imported[0].kind);
    }
    // Seed the history trail in batches too, for the same reason.
    for (let i = 0; i < imported.length; i += IMPORT_BATCH_SIZE) {
      const { error: eventsError } = await supabase
        .from("application_events")
        .insert(
          imported.slice(i, i + IMPORT_BATCH_SIZE).map((job) => ({
            application_id: job.id,
            from_status: null,
            to_status: job.status,
          })),
        );
      if (eventsError) {
        console.warn("Couldn't record status history:", eventsError.message);
        break;
      }
    }

    setApplications((apps) => [...imported, ...apps]);
    setStatusFilter("All");
    setSearchQuery("");
    setSort("Recently added");
    setPage(0);
    return { added: imported.length, error: null };
  };

  if (loading) return <JobChecklistSkeleton />;

  const labels = KIND_LABELS[kind];
  const query = searchQuery.trim().toLowerCase();
  // Everything below the toggle — rows, strip counts, upcoming, export —
  // speaks about one kind at a time.
  const inKind = applications.filter((a) => a.kind === kind);
  const filtered = inKind.filter((a) => {
    const matchesStatus =
      statusFilter === "All"
        ? true
        : statusFilter === "Follow-up"
          ? needsFollowUp(a.status, a.lastActivityAt, a.nextActionDate)
          : a.status === statusFilter;
    // Search the whole application, not just its headline: "remote", a
    // recruiter's name, or something you only wrote in the notes are all
    // things people reach for when hunting a row they can't name exactly.
    const matchesQuery = query === "" || matchesSearch(a, query);
    return matchesStatus && matchesQuery;
  });

  const sorted = sortApplications(filtered, sort);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginated = sorted.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

  const followUpsDue = inKind.filter((a) =>
    needsFollowUp(a.status, a.lastActivityAt, a.nextActionDate),
  ).length;

  const openApplication = applications.find((a) => a.id === openId) ?? null;
  const hasFilters = query !== "" || statusFilter !== "All";
  const subtitle =
    inKind.length === 0
      ? "Nothing tracked yet · first run"
      : `${sorted.length} shown · ${statusFilter.toLowerCase()} · ${followUpsDue} follow-up${
          followUpsDue === 1 ? "" : "s"
        } due`;

  return (
    <div className="flex flex-col flex-1 min-w-0">
      {/* Title bar */}
      <div className="flex flex-wrap items-end gap-4 md:gap-6 px-4 md:px-8 pt-5 pb-3.5">
        <div className="mr-auto min-w-0">
          <h2 style={{ margin: "0 0 2px", fontSize: 30 }}>
            {inKind.length === 0 ? "Applications" : labels.tab}
          </h2>
          <div className="eyebrow text-muted" style={{ fontSize: 12, letterSpacing: "0.1em" }}>
            {subtitle}
          </div>
        </div>
        <KindToggle
          kind={kind}
          setKind={(next) => {
            setKind(next);
            setPage(0);
          }}
          applications={applications}
        />
        <AddApplication setIsModalOpen={setIsModalOpen} kind={kind} />
      </div>

      <FilterPanel
        setPage={setPage}
        setStatusFilter={setStatusFilter}
        statusFilter={statusFilter}
        applications={inKind}
        kind={kind}
      />

      {/* Filter band — one row of cells, each separated by a single rule. */}
      <div className="flex flex-wrap items-stretch border-b-2 border-line">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setPage={setPage}
          kind={kind}
        />
        <SortBar sort={sort} setSort={setSort} setPage={setPage} />
        {hasFilters && (
          <div className="flex items-center gap-2.5 px-4 border-l border-line min-h-[46px]">
            <span className="eyebrow text-muted shrink-0">Filtered</span>
            <span className="tag tag-neutral eyebrow" style={{ letterSpacing: "0.08em" }}>
              {statusFilter === "All" ? "All statuses" : statusFilter}
              {query ? ` · “${searchQuery.trim()}”` : ""}
            </span>
            <button
              onClick={() => {
                setStatusFilter("All");
                setSearchQuery("");
                setPage(0);
              }}
              className="op-lnk eyebrow"
              style={{ color: "var(--color-accent-700)" }}
            >
              Clear
            </button>
          </div>
        )}
        <ImportExport
          applications={inKind}
          onImport={importApplications}
          kind={kind}
        />
      </div>

      <UpcomingStrip applications={inKind} />

      {paginated.length > 0 ? (
        <>
          {/* Below md the eight columns can't fit without a 1080px scroller,
              so the same rows stack instead. */}
          <div className="md:hidden">
            {paginated.map((app) => (
              <JobRowCompact
                key={app.id}
                application={app}
                onOpen={() => setOpenId(app.id)}
              />
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="table" style={{ minWidth: 1080 }}>
              <thead>
                <tr>
                  <th className="pl-4 md:pl-8" style={{ width: "22%" }}>
                    {labels.entity}
                  </th>
                  <th style={{ width: "26%" }}>{labels.role}</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th style={{ width: 130 }}>Pipeline</th>
                  <th style={{ width: 110 }}>{labels.location}</th>
                  <th style={{ width: 100 }}>{labels.source}</th>
                  <th style={{ width: 110 }}>{labels.dateColumn}</th>
                  <th className="pr-4 md:pr-8">{labels.nextAction}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((app) => (
                  <JobRow
                    key={app.id}
                    application={app}
                    onOpen={() => setOpenId(app.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <EmptyContainer
          query={query}
          statusFilter={statusFilter}
          kind={kind}
          onAdd={() => setIsModalOpen(true)}
        />
      )}

      <NavigationPanel
        totalPages={totalPages}
        currentPage={currentPage}
        setPage={setPage}
      />

      {createPortal(
        <NewJobModal
          // Remounts on a toggle flip, so a half-typed draft can't be filed
          // under the kind you just switched away from.
          key={kind}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={addNewJob}
          kind={kind}
        />,
        document.body,
      )}

      {openApplication &&
        createPortal(
          <DetailModal
            // Keyed on the row, so opening a different one starts a fresh draft
            // rather than reusing the last application's.
            key={openApplication.id}
            application={openApplication}
            onUpdate={updateApplication}
            onDelete={deleteApplication}
            onClose={() => setOpenId(null)}
          />,
          document.body,
        )}
    </div>
  );
};

export default JobChecklist;
