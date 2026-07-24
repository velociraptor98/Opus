import { describe, expect, it } from "vitest";
import { applicationsToCsv, csvToApplications, parseCsv } from "./csv";
import type { JobApplication } from "@/constants/types";

function makeApp(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: "1",
    kind: "job",
    company: "Acme",
    position: "Engineer",
    status: "Applied",
    dateApplied: "2026-06-01",
    lastActivityAt: "2026-06-01T00:00:00",
    notes: "",
    link: "",
    location: "",
    salary: "",
    source: "",
    contact: "",
    nextActionDate: "",
    nextActionNote: "",
    checklist: {
      resumeSent: false,
      coverLetterSent: false,
      followUpSent: false,
    },
    ...overrides,
  };
}

describe("parseCsv", () => {
  it("splits simple rows and fields", () => {
    expect(parseCsv("a,b,c\nd,e,f")).toEqual([
      ["a", "b", "c"],
      ["d", "e", "f"],
    ]);
  });

  it("honors quoted fields containing commas, newlines, and escaped quotes", () => {
    const text = 'name,notes\nAcme,"hello, ""world""\nsecond line"';
    expect(parseCsv(text)).toEqual([
      ["name", "notes"],
      ["Acme", 'hello, "world"\nsecond line'],
    ]);
  });

  it("handles CRLF line endings and skips blank lines", () => {
    expect(parseCsv("a,b\r\n\r\nc,d\r\n")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });
});

describe("applicationsToCsv / csvToApplications round trip", () => {
  it("round-trips every field", () => {
    const app = makeApp({
      company: "Globex, Inc.",
      position: 'Senior "10x" Engineer',
      status: "Interviewing",
      location: "Remote",
      salary: "$150k–$180k",
      source: "Referral",
      contact: "Jane Doe <jane@globex.com>",
      link: "https://jobs.globex.com/123",
      notes: "Line one\nLine two",
      nextActionDate: "2026-06-15",
      nextActionNote: "Phone screen",
      checklist: { resumeSent: true, coverLetterSent: false, followUpSent: true },
    });

    const { applications, skippedRows, error } = csvToApplications(
      applicationsToCsv([app]),
    );

    expect(error).toBeNull();
    expect(skippedRows).toEqual([]);
    expect(applications).toHaveLength(1);
    const imported = applications[0];
    expect(imported.company).toBe("Globex, Inc.");
    expect(imported.position).toBe('Senior "10x" Engineer');
    expect(imported.status).toBe("Interviewing");
    expect(imported.location).toBe("Remote");
    expect(imported.salary).toBe("$150k–$180k");
    expect(imported.source).toBe("Referral");
    expect(imported.contact).toBe("Jane Doe <jane@globex.com>");
    expect(imported.link).toBe("https://jobs.globex.com/123");
    expect(imported.notes).toBe("Line one\nLine two");
    expect(imported.nextActionDate).toBe("2026-06-15");
    expect(imported.nextActionNote).toBe("Phone screen");
    expect(imported.checklist).toEqual({
      resumeSent: true,
      coverLetterSent: false,
      followUpSent: true,
    });
  });
});

describe("csvToApplications", () => {
  it("accepts spreadsheet-style aliases and loose values", () => {
    const text = [
      "Company,Role,Status,Date,URL",
      "Acme,Engineer,interviewing,6/1/2026,https://acme.dev",
    ].join("\n");

    const { applications, error } = csvToApplications(text);
    expect(error).toBeNull();
    expect(applications[0]).toMatchObject({
      company: "Acme",
      position: "Engineer",
      status: "Interviewing",
      dateApplied: "2026-06-01",
      link: "https://acme.dev",
    });
  });

  it("defaults unknown statuses to Pending", () => {
    const { applications } = csvToApplications(
      "company,position,status\nAcme,Engineer,ghosted",
    );
    expect(applications[0].status).toBe("Pending");
  });

  it("skips rows missing company or position and reports their line numbers", () => {
    const text = [
      "company,position",
      "Acme,Engineer",
      ",Missing Company",
      "Missing Position,",
    ].join("\n");

    const { applications, skippedRows, error } = csvToApplications(text);
    expect(error).toBeNull();
    expect(applications).toHaveLength(1);
    expect(skippedRows).toEqual([3, 4]);
  });

  it("errors when the essential columns are missing", () => {
    const { error } = csvToApplications("foo,bar\n1,2");
    expect(error).toMatch(/company/i);
  });

  it("errors on an empty file", () => {
    const { error } = csvToApplications("");
    expect(error).toMatch(/empty/i);
  });

  it("files rows under the given kind when the file doesn't say", () => {
    const { applications } = csvToApplications(
      "company,position\nImperial,MSc Computing",
      "university",
    );
    expect(applications[0].kind).toBe("university");
  });

  it("honours a per-row kind column over the default", () => {
    const { applications } = csvToApplications(
      ["kind,company,position", "university,Imperial,MSc Computing", "job,Acme,Engineer"].join(
        "\n",
      ),
      "job",
    );
    expect(applications.map((a) => a.kind)).toEqual(["university", "job"]);
  });

  it("falls back to the given kind for an unrecognised kind cell", () => {
    const { applications } = csvToApplications(
      "kind,company,position\nbootcamp,Acme,Engineer",
      "university",
    );
    expect(applications[0].kind).toBe("university");
  });

  it("reads university status labels back as their stored status", () => {
    const { applications } = csvToApplications(
      [
        "company,position,status",
        "Imperial,MSc Computing,Accepted",
        "LSE,MSc Data,Submitted",
        "UCL,MSc AI,Withdrawn",
      ].join("\n"),
      "university",
    );
    expect(applications.map((a) => a.status)).toEqual([
      "Offered",
      "Applied",
      "Closed",
    ]);
  });

  it("round-trips a university application through export and import", () => {
    const app = makeApp({
      kind: "university",
      company: "Imperial College London",
      position: "MSc Computing",
      status: "Offered",
    });

    const { applications } = csvToApplications(applicationsToCsv([app]), "job");

    expect(applications[0]).toMatchObject({
      kind: "university",
      company: "Imperial College London",
      position: "MSc Computing",
      status: "Offered",
    });
  });
});
