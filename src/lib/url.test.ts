import { describe, expect, it } from "vitest";
import { safeExternalUrl } from "./url";

describe("safeExternalUrl", () => {
  it("returns null for empty or whitespace-only input", () => {
    expect(safeExternalUrl("")).toBeNull();
    expect(safeExternalUrl("   ")).toBeNull();
  });

  it("keeps http and https links", () => {
    expect(safeExternalUrl("https://acme.com/jobs/1")).toBe(
      "https://acme.com/jobs/1",
    );
    expect(safeExternalUrl("http://acme.com/jobs/1")).toBe(
      "http://acme.com/jobs/1",
    );
  });

  it("reads a scheme-less entry as https", () => {
    expect(safeExternalUrl("acme.com/jobs")).toBe("https://acme.com/jobs");
  });

  it("trims surrounding whitespace", () => {
    expect(safeExternalUrl("  https://acme.com  ")).toBe("https://acme.com/");
  });

  it("rejects script-bearing schemes", () => {
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(safeExternalUrl("JaVaScRiPt:alert(1)")).toBeNull();
    expect(safeExternalUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(safeExternalUrl("vbscript:msgbox(1)")).toBeNull();
  });

  it("rejects other non-web schemes", () => {
    expect(safeExternalUrl("file:///etc/passwd")).toBeNull();
    expect(safeExternalUrl("mailto:someone@acme.com")).toBeNull();
  });

  it("rejects input that is not a URL at all", () => {
    expect(safeExternalUrl("not a url")).toBeNull();
  });
});
