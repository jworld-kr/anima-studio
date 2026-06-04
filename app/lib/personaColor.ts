/**
 * Deterministic color from a persona id.
 * The palette is intentionally muted so that no persona color
 * overpowers the Anima UI itself.
 */
const PALETTE = [
  "#82926f", // sage
  "#b89580", // clay
  "#6b8aa8", // slate blue
  "#c9a961", // gold
  "#a37e8b", // dusty rose
  "#7a8b6d", // moss
  "#9a8aa8", // lavender
  "#8b7a6e", // bark
];

export function personaColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function personaInitial(name: string): string {
  if (!name) return "·";
  const trimmed = name.trim();
  // For Korean/CJK, take first character.
  return trimmed[0] ?? "·";
}
