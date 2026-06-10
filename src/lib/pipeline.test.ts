import { describe, expect, it } from "vitest";
import { reachedStages } from "./pipeline";

describe("reachedStages", () => {
  it("treats Pending as not yet submitted", () => {
    expect(reachedStages("Pending")).toEqual({
      submitted: false,
      interviewed: false,
      offered: false,
    });
  });

  it("treats Closed with no history as never submitted", () => {
    expect(reachedStages("Closed").submitted).toBe(false);
  });

  it("counts a plain application as submitted only", () => {
    expect(reachedStages("Applied")).toEqual({
      submitted: true,
      interviewed: false,
      offered: false,
    });
  });

  it("infers submission from a rejection, but not an interview", () => {
    expect(reachedStages("Rejected")).toEqual({
      submitted: true,
      interviewed: false,
      offered: false,
    });
  });

  it("an offer implies every stage", () => {
    expect(reachedStages("Offered")).toEqual({
      submitted: true,
      interviewed: true,
      offered: true,
    });
  });

  it("remembers stages from history that the current status has left", () => {
    // Interviewed, then rejected — the snapshot forgets, the history doesn't.
    expect(reachedStages("Rejected", ["Applied", "Interviewing"])).toEqual({
      submitted: true,
      interviewed: true,
      offered: false,
    });
  });

  it("counts a withdrawn offer from history", () => {
    expect(reachedStages("Closed", ["Offered"]).offered).toBe(true);
  });
});
