import { describe, expect, it } from "vitest";
import * as utils from "@/src/utils/utils";

describe("utils module", () => {
  it("can be imported as an object module", () => {
    expect(typeof utils).toBe("object");
  });
});
