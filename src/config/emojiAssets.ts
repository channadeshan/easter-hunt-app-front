/**
 * emojiAssets.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Fill in your own image URLs below. These are the only values the app reads.
 *
 * RULES:
 *  - Every `url` must be a publicly accessible image URL (http/https) or a
 *    path relative to the app's /public folder (e.g. "/emojis/chick.png").
 *  - The `label` is shown as a tooltip and used for accessibility (alt text).
 *  - Add or remove entries freely — the pickers render whatever is here.
 *  - The FIRST entry in each list is used as the default selection.
 *
 * EXAMPLE entry:
 *   { label: 'Golden Chick', url: 'https://your-cdn.com/images/chick.png' }
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface EmojiAsset {
  /** Tooltip text and image alt — describe what the image shows */
  label: string;
  /** Full image URL or /public-relative path — FILL THESE IN */
  url: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICIPANT AVATARS
// Shown in the Join page so players can pick their avatar before entering.
// Replace every placeholder URL with your actual image URL.
// ─────────────────────────────────────────────────────────────────────────────
export const PARTICIPANT_AVATARS: EmojiAsset[] = [
  {
    label: "Avatar 1",
    url: "https://images.unsplash.com/photo-1740252117027-4275d3f84385?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGNhcnRvb24lMjB1c2VyJTIwYXZhdGFyfGVufDB8fDB8fHwy",
  },
  {
    label: "Avatar 2",
    url: "https://images.unsplash.com/photo-1740252117044-2af197eea287?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGNhcnRvb24lMjB1c2VyJTIwYXZhdGFyfGVufDB8fDB8fHwy",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EGG ICONS
// Shown in the Admin "Create Egg" form so each egg gets a distinct icon.
// Replace every placeholder URL with your actual image URL.
// ─────────────────────────────────────────────────────────────────────────────
export const EGG_EMOJIS: EmojiAsset[] = [
  {
    label: "Egg Icon 1",
    url: "https://images.emojiterra.com/microsoft/fluent-emoji/15.1/1024px/1f95a_color.png",
  },
  {
    label: "Egg Icon 2",
    url: "https://res.cloudinary.com/dlr1glkjt/image/upload/v1774989062/Untitled_design_5_f32zgf.png",
  },
  {
    label: "Egg Icon 3",
    url: "https://res.cloudinary.com/dlr1glkjt/image/upload/v1774989061/Untitled_design_4_wzj4as.png",
  },
  {
    label: "Egg Icon 4",
    url: "https://res.cloudinary.com/dlr1glkjt/image/upload/v1774989061/Untitled_design_3_un3ism.png",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — used internally by the app, no need to edit these.
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the first asset in the pool (used as the default selection). */
export function defaultAsset(pool: EmojiAsset[]): EmojiAsset {
  return pool[0];
}

/** Returns the label for a given URL, or a fallback string. */
export function labelForUrl(url: string, pool: EmojiAsset[]): string {
  return pool.find((e) => e.url === url)?.label ?? "Unknown";
}
