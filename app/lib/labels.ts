/**
 * Strip leading emoji + space from category group labels stored in
 * `IDEA_CATEGORY_GROUPS`. The data file keeps emojis for backward
 * compatibility, but the new UI is icon/text only.
 */
export function cleanLabel(label: string): string {
  // Remove leading emoji-like chars (and any following whitespace)
  return label.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]+\s*/u, "").trim();
}
