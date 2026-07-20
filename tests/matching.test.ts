import { describe, expect, it } from "vitest";

import { getCompanionForMood, matchCompanionToNeed } from "../lib/companions/matching";

describe("matchCompanionToNeed", () => {
  it("routes listening to Claire", () => {
    expect(matchCompanionToNeed("someone_to_listen").companion.id).toBe("claire");
  });

  it("adapts motivation to mood", () => {
    expect(matchCompanionToNeed("motivation", "low").companion.id).toBe("mateo");
    expect(matchCompanionToNeed("motivation", "good").companion.id).toBe("maya");
  });

  it("routes story to Daniel and advice to Mateo", () => {
    expect(matchCompanionToNeed("story").companion.id).toBe("daniel");
    expect(matchCompanionToNeed("advice").companion.id).toBe("mateo");
  });

  it("just_chat pick is deterministic for a given hour", () => {
    expect(matchCompanionToNeed("just_chat", undefined, 0).companion.id).toBe("maya");
    expect(matchCompanionToNeed("just_chat", undefined, 2).companion.id).toBe("claire");
    expect(matchCompanionToNeed("just_chat", undefined, 5).companion.id).toBe("mateo");
    // negative/large hours wrap safely
    expect(matchCompanionToNeed("just_chat", undefined, -1).companion.id).toBe("daniel");
  });
});

describe("getCompanionForMood", () => {
  it("leads with a warm companion when low", () => {
    expect(getCompanionForMood("low")[0].companion.id).toBe("claire");
  });
  it("leads with Maya when good", () => {
    expect(getCompanionForMood("good")[0].companion.id).toBe("maya");
  });
});
