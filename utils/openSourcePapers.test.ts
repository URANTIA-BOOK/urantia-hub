import { describe, expect, it } from "vitest";
import { OPEN_SOURCE_PAPERS_URL } from "@/utils/config";

describe("open source papers link", () => {
  it("points at the language-tree map", () => {
    expect(OPEN_SOURCE_PAPERS_URL).toBe(
      "https://github.com/urantia-hub/urantia-data-sources/blob/main/languages/README.md"
    );
  });
});
