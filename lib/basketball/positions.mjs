export const BASKETBALL_POSITIONS = [
  { value: "point_guard", label: "Point Guard", abbr: "PG" },
  { value: "shooting_guard", label: "Shooting Guard", abbr: "SG" },
  { value: "small_forward", label: "Small Forward", abbr: "SF" },
  { value: "power_forward", label: "Power Forward", abbr: "PF" },
  { value: "center", label: "Center", abbr: "C" },
];

const LEGACY_POSITION_VALUES = {
  PG: "point_guard",
  SG: "shooting_guard",
  SF: "small_forward",
  PF: "power_forward",
  C: "center",
};

export function normalizePosition(value) {
  return LEGACY_POSITION_VALUES[value] || value;
}

export function normalizePositions(values = []) {
  return [...new Set(values.map(normalizePosition).filter(Boolean))];
}
