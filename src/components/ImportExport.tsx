import { useRef, useState } from "react";
import { ApplicationKind, KIND_LABELS } from "@/constants/kind";
import { JobApplication } from "@/constants/types";
import { applicationsToCsv, csvToApplications } from "@/lib/csv";
import { useToast } from "@/context/ToastContext";
import { LoadingBars } from "./Mark";

/**
 * The CSV cell of the filter band: two text links rather than buttons, because
 * they sit inside a row of controls that are all set in the same 10px caps and
 * a pair of filled buttons here would out-shout the one primary action.
 *
 * Both sides are scoped to the active kind: you export what you're looking at,
 * and an imported row without a `kind` column joins it.
 */
export const ImportExport = ({
  applications,
  onImport,
  kind,
}: {
  applications: JobApplication[];
  onImport: (
    jobs: Omit<JobApplication, "id" | "lastActivityAt">[],
  ) => Promise<{ added: number; error: string | null }>;
  kind: ApplicationKind;
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
    a.download = `opus-${KIND_LABELS[kind].exportStem}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const {
        applications: parsed,
        skippedRows,
        error,
      } = csvToApplications(text, kind);
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
    <div className="flex items-stretch border-l border-line">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={importing}
        aria-busy={importing}
        className="op-lnk eyebrow px-4 flex items-center gap-2 min-h-[46px]"
      >
        {importing ? (
          <>
            <LoadingBars width={7} height={3} />
            <span className="sr-only">Importing…</span>
          </>
        ) : (
          "Import CSV"
        )}
      </button>
      <button
        onClick={handleExport}
        disabled={applications.length === 0}
        className="op-lnk eyebrow px-4 md:pr-8 border-l border-line min-h-[46px]"
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
