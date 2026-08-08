import { describe, expect, it } from "vitest";
import { findBuilding, parseBuildingRaw, resolveLocation } from "@/lib/resolveLocation";
import { estimateTravel } from "@/lib/travelTime";
import { transitionCues } from "@/lib/transitions";
import { demoEvents } from "@/lib/demo-data";

describe("resolveLocation", () => {
  it("strips room numbers and resolves aliases", () => {
    const parsed = parseBuildingRaw("Boelter 3400");
    expect(parsed.buildingName.toLowerCase()).toContain("boelter");
    expect(parsed.room).toBe("3400");
    const loc = resolveLocation("Boelter 3400");
    expect(loc.building).toBe("Boelter Hall");
    expect(loc.lat).toBeTypeOf("number");
  });

  it("resolves Wooden gym alias", () => {
    expect(findBuilding("gym")?.name).toBe("John Wooden Center");
  });

  it("returns raw-only for unknowns", () => {
    const loc = resolveLocation("Mystery Pavilion 12");
    expect(loc.building).toBeUndefined();
    expect(loc.raw).toContain("Mystery");
  });
});

describe("transitions", () => {
  it("flags tight Boelter to Bunche on Wednesday", () => {
    const cues = transitionCues(demoEvents, "you", "walk");
    const tight = cues.filter((c) => c.tight);
    expect(tight.length).toBeGreaterThan(0);
    const wed = tight.find((c) => c.fromLabel.includes("CS 31") && c.toLabel.includes("Office"));
    expect(wed).toBeTruthy();
    expect(wed!.travelMin).toBe(12);
    expect(wed!.gapMin).toBeLessThan(wed!.travelMin + 5);
  });

  it("estimates travel when static edge missing but coords exist", () => {
    const est = estimateTravel(
      resolveLocation("Royce"),
      resolveLocation("Ackerman"),
      "walk"
    );
    expect(est).toBeTruthy();
    expect(est!.durationMin).toBeGreaterThan(0);
  });
});
