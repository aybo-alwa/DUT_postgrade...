export type AccentKey =
  | "coral"
  | "red"
  | "pink"
  | "orange"
  | "yellow"
  | "blue"
  | "green"
  | "purple"
  | "slate"
  | "ink";

export const ACCENTS: Record<AccentKey, { label: string; primary: string; foreground: string }> = {
  coral: { label: "Coral", primary: "oklch(0.66 0.18 30)", foreground: "oklch(0.99 0.01 90)" },
  red: { label: "Red", primary: "oklch(0.6 0.22 25)", foreground: "oklch(0.99 0.01 90)" },
  pink: { label: "Pink", primary: "oklch(0.65 0.22 350)", foreground: "oklch(0.99 0.01 90)" },
  orange: { label: "Orange", primary: "oklch(0.72 0.18 55)", foreground: "oklch(0.2 0.04 60)" },
  yellow: { label: "Yellow", primary: "oklch(0.83 0.15 90)", foreground: "oklch(0.24 0.05 275)" },
  blue: { label: "Blue", primary: "oklch(0.55 0.2 260)", foreground: "oklch(0.99 0.01 90)" },
  green: { label: "Green", primary: "oklch(0.6 0.16 150)", foreground: "oklch(0.99 0.01 90)" },
  purple: { label: "Purple", primary: "oklch(0.58 0.2 300)", foreground: "oklch(0.99 0.01 90)" },
  slate: { label: "Slate", primary: "oklch(0.62 0.03 265)", foreground: "oklch(0.15 0.03 275)" },
  ink: { label: "Ink", primary: "oklch(0.33 0.13 275)", foreground: "oklch(0.97 0.02 88)" },
};

export type AppearanceSettings = {
  accent: string;
  dark_mode: boolean;
  high_contrast: boolean;
  text_scale: number;
};

export function applyAppearance(settings: AppearanceSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const accent = ACCENTS[(settings.accent as AccentKey) ?? "coral"] ?? ACCENTS.coral;

  root.style.setProperty("--primary", accent.primary);
  root.style.setProperty("--primary-foreground", accent.foreground);
  root.style.setProperty("--ring", accent.primary);
  root.classList.toggle("dark", settings.dark_mode);
  root.classList.toggle("high-contrast", settings.high_contrast);
  root.style.fontSize = `${Math.min(140, Math.max(85, settings.text_scale || 100))}%`;
}
