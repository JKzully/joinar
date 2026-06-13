import test from "node:test";
import assert from "node:assert/strict";

import {
  BASKETBALL_POSITIONS,
  normalizePosition,
  normalizePositions,
} from "../lib/basketball/positions.mjs";

test("basketball positions use one canonical database value", () => {
  assert.deepEqual(
    BASKETBALL_POSITIONS.map((position) => position.value),
    [
      "point_guard",
      "shooting_guard",
      "small_forward",
      "power_forward",
      "center",
    ]
  );
});

test("legacy abbreviations normalize before writes and filtering", () => {
  assert.equal(normalizePosition("PG"), "point_guard");
  assert.equal(normalizePosition("center"), "center");
  assert.deepEqual(
    normalizePositions(["PG", "point_guard", "SF"]),
    ["point_guard", "small_forward"]
  );
});
