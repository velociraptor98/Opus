import { describe, expect, it } from "vitest";
import { STATUS_OPTIONS, type Status } from "./generic";
import {
  KIND_LABELS,
  KIND_OPTIONS,
  sourceOptions,
  statusLabel,
  toKind,
} from "./kind";

describe("toKind", () => {
  it("recognises university", () => {
    expect(toKind("university")).toBe("university");
  });

  it("falls back to job for anything else", () => {
    expect(toKind("job")).toBe("job");
    expect(toKind("")).toBe("job");
    expect(toKind(undefined)).toBe("job");
    expect(toKind(null)).toBe("job");
    expect(toKind("College")).toBe("job");
  });
});

describe("statusLabel", () => {
  it("leaves job statuses as their stored value", () => {
    for (const status of STATUS_OPTIONS) {
      expect(statusLabel("job", status)).toBe(status);
    }
  });

  it("renames the statuses admissions calls something else", () => {
    expect(statusLabel("university", "Pending")).toBe("Draft");
    expect(statusLabel("university", "Applied")).toBe("Submitted");
    expect(statusLabel("university", "Interviewing")).toBe("Interview");
    expect(statusLabel("university", "Offered")).toBe("Accepted");
    expect(statusLabel("university", "Closed")).toBe("Withdrawn");
  });

  it("keeps Rejected, which needs no translation", () => {
    expect(statusLabel("university", "Rejected")).toBe("Rejected");
  });

  it("labels every stored status for every kind", () => {
    for (const kind of KIND_OPTIONS) {
      for (const status of STATUS_OPTIONS) {
        expect(statusLabel(kind, status as Status)).toBeTruthy();
      }
    }
  });

  it("keeps labels unique within a kind, so a filter never reads twice", () => {
    for (const kind of KIND_OPTIONS) {
      const labels = STATUS_OPTIONS.map((s) => statusLabel(kind, s));
      expect(new Set(labels).size).toBe(STATUS_OPTIONS.length);
    }
  });
});

describe("KIND_LABELS", () => {
  it("gives both kinds a full vocabulary", () => {
    for (const kind of KIND_OPTIONS) {
      for (const [key, value] of Object.entries(KIND_LABELS[kind])) {
        expect(value, `${kind}.${key}`).toBeTruthy();
      }
    }
  });

  it("names the two tracks distinctly", () => {
    expect(KIND_LABELS.job.tab).not.toBe(KIND_LABELS.university.tab);
    expect(KIND_LABELS.job.entity).toBe("Company");
    expect(KIND_LABELS.university.entity).toBe("Institution");
  });
});

describe("sourceOptions", () => {
  it("suggests portals for universities and job boards for jobs", () => {
    expect(sourceOptions("university")).toContain("UCAS");
    expect(sourceOptions("job")).toContain("LinkedIn");
    expect(sourceOptions("job")).not.toContain("UCAS");
  });
});
