import { useRef, useState } from "react";
import { JobApplication } from "@/constants/types";
import { applicationsToCsv, csvToApplications } from "@/lib/csv";
import { useToast } from "@/context/ToastContext";

/**
 * Sidebar buttons to export the full list as CSV and import applications
 * from a CSV (ours, or any spreadsheet with company/position columns).
 */
export const ImportExport = ({
  applications,
  onImport,
}: {
  applications: JobApplication[];
  onImport: (
    jobs: Omit<JobApplication, "id" | "lastActivityAt">[],
  ) => Promise<{ added: number; error: string | null }>;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const toast = useToast();

  const handleExport = () => {
    const csv = applicationsToCsv(applications);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `opus-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const { applications: parsed, skippedRows, error } = csvToApplications(text);
      if (error) {
        toast.show(error, { variant: "error" });
        return;
      }
      const { added, error: importError } = await onImport(parsed);
      if (importError) {
        toast.show(importError, { variant: "error" });
        return;
      }
      const skippedNote =
        skippedRows.length > 0 ? ` (${skippedRows.length} rows skipped)` : "";
      toast.show(
        `Imported ${added} application${added === 1 ? "" : "s"}${skippedNote}`,
        { variant: "success" },
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={importing}
        className="btn-glass flex-1 px-3 py-2 text-xs font-semibold text-foreground/70 hover:text-foreground rounded-lg disabled:opacity-50"
      >
        {importing ? "Importing…" : "Import CSV"}
      </button>
      <button
        onClick={handleExport}
        disabled={applications.length === 0}
        className="btn-glass flex-1 px-3 py-2 text-xs font-semibold text-foreground/70 hover:text-foreground rounded-lg disabled:opacity-50"
      >
        Export CSV
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Reset so picking the same file again still fires onChange.
          e.target.value = "";
          if (file) handleFile(file);
        }}
      />
    </div>
  );
};
