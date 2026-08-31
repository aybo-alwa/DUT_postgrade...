export type ThemeKey =
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

type ThemeDef = { label: string; hue: number; chroma: number };

export const THEMES: Record<ThemeKey, ThemeDef> = {
  coral: { label: "Coral", hue: 30, chroma: 0.18 },
  red: { label: "Red", hue: 25, chroma: 0.21 },
  pink: { label: "Pink", hue: 350, chroma: 0.2 },
  orange: { label: "Orange", hue: 55, chroma: 0.17 },
  yellow: { label: "Yellow", hue: 90, chroma: 0.15 },
  blue: { label: "Blue", hue: 260, chroma: 0.19 },
  green: { label: "Green", hue: 150, chroma: 0.15 },
  purple: { label: "Purple", hue: 300, chroma: 0.19 },
  slate: { label: "Slate", hue: 265, chroma: 0.04 },
  ink: { label: "Ink", hue: 275, chroma: 0.13 },
};

/** Swatch colour used in pickers. */
export function themeSwatch(key: ThemeKey) {
  const t = THEMES[key] ?? THEMES.coral;
  return `oklch(0.62 ${t.chroma} ${t.hue})`;
}

export type AppearanceSettings = {
  accent: string;
  dark_mode: boolean;
  high_contrast: boolean;
  text_scale: number;
};

function lightTokens({ hue: h, chroma: c }: ThemeDef): Record<string, string> {
  const tint = Math.min(0.03, c * 0.16);
  return {
    "--background": "oklch(1 0 0)",
    "--foreground": `oklch(0.22 ${Math.min(0.06, c * 0.35)} ${h})`,
    "--card": "oklch(1 0 0)",
    "--card-foreground": `oklch(0.22 ${Math.min(0.06, c * 0.35)} ${h})`,
    "--popover": "oklch(1 0 0)",
    "--popover-foreground": `oklch(0.22 ${Math.min(0.06, c * 0.35)} ${h})`,
    "--primary": `oklch(0.62 ${c} ${h})`,
    "--primary-foreground": "oklch(0.99 0 0)",
    "--secondary": `oklch(0.96 ${tint} ${h})`,
    "--secondary-foreground": `oklch(0.28 ${Math.min(0.07, c * 0.4)} ${h})`,
    "--muted": `oklch(0.965 ${tint} ${h})`,
    "--muted-foreground": `oklch(0.5 ${Math.min(0.05, c * 0.3)} ${h})`,
    "--accent": `oklch(0.955 ${tint} ${h})`,
    "--accent-foreground": `oklch(0.28 ${Math.min(0.07, c * 0.4)} ${h})`,
    "--border": `oklch(0.9 ${tint} ${h})`,
    "--input": `oklch(0.9 ${tint} ${h})`,
    "--ring": `oklch(0.62 ${c} ${h})`,
    "--ink": `oklch(0.26 ${Math.min(0.1, c * 0.6)} ${h})`,
    "--ink-foreground": "oklch(0.99 0 0)",
    "--sunshine": `oklch(0.93 ${tint * 1.6} ${h})`,
    "--sunshine-foreground": `oklch(0.3 ${Math.min(0.08, c * 0.45)} ${h})`,
    "--mint": `oklch(0.95 ${tint * 1.4} ${h})`,
    "--mint-foreground": `oklch(0.3 ${Math.min(0.08, c * 0.45)} ${h})`,
    "--soft": `oklch(0.96 ${tint * 1.5} ${h})`,
    "--sidebar": `oklch(0.3 ${Math.min(0.11, c * 0.7)} ${h})`,
    "--sidebar-foreground": `oklch(0.9 ${Math.min(0.03, c * 0.2)} ${h})`,
    "--sidebar-primary": `oklch(0.62 ${c} ${h})`,
    "--sidebar-primary-foreground": "oklch(0.99 0 0)",
    "--sidebar-accent": `oklch(0.26 ${Math.min(0.1, c * 0.6)} ${h})`,
    "--sidebar-accent-foreground": "oklch(0.98 0 0)",
    "--sidebar-border": `oklch(0.4 ${Math.min(0.1, c * 0.6)} ${h})`,
    "--sidebar-ring": `oklch(0.62 ${c} ${h})`,
    "--chart-1": `oklch(0.62 ${c} ${h})`,
    "--chart-2": `oklch(0.45 ${c * 0.8} ${(h + 30) % 360})`,
    "--chart-3": `oklch(0.75 ${c * 0.7} ${(h + 60) % 360})`,
    "--chart-4": `oklch(0.55 ${c * 0.6} ${(h + 300) % 360})`,
    "--chart-5": `oklch(0.7 ${c * 0.5} ${(h + 180) % 360})`,
  };
}

function darkTokens({ hue: h, chroma: c }: ThemeDef): Record<string, string> {
  const tint = Math.min(0.05, c * 0.3);
  return {
    "--background": `oklch(0.17 ${tint} ${h})`,
    "--foreground": `oklch(0.96 ${Math.min(0.02, c * 0.1)} ${h})`,
    "--card": `oklch(0.23 ${tint} ${h})`,
    "--card-foreground": `oklch(0.96 ${Math.min(0.02, c * 0.1)} ${h})`,
    "--popover": `oklch(0.23 ${tint} ${h})`,
    "--popover-foreground": `oklch(0.96 ${Math.min(0.02, c * 0.1)} ${h})`,
    "--primary": `oklch(0.68 ${c} ${h})`,
    "--primary-foreground": `oklch(0.16 ${tint} ${h})`,
    "--secondary": `oklch(0.28 ${tint} ${h})`,
    "--secondary-foreground": `oklch(0.96 ${Math.min(0.02, c * 0.1)} ${h})`,
    "--muted": `oklch(0.28 ${tint} ${h})`,
    "--muted-foreground": `oklch(0.76 ${Math.min(0.03, c * 0.2)} ${h})`,
    "--accent": `oklch(0.29 ${tint} ${h})`,
    "--accent-foreground": `oklch(0.96 ${Math.min(0.02, c * 0.1)} ${h})`,
    "--border": "oklch(1 0 0 / 14%)",
    "--input": "oklch(1 0 0 / 18%)",
    "--ring": `oklch(0.68 ${c} ${h})`,
    "--ink": `oklch(0.14 ${tint} ${h})`,
    "--ink-foreground": `oklch(0.96 ${Math.min(0.02, c * 0.1)} ${h})`,
    "--sunshine": `oklch(0.4 ${tint * 1.4} ${h})`,
    "--sunshine-foreground": `oklch(0.97 ${Math.min(0.02, c * 0.1)} ${h})`,
    "--mint": `oklch(0.32 ${tint * 1.3} ${h})`,
    "--mint-foreground": `oklch(0.95 ${Math.min(0.03, c * 0.15)} ${h})`,
    "--soft": `oklch(0.3 ${tint * 1.3} ${h})`,
    "--sidebar": `oklch(0.14 ${tint} ${h})`,
    "--sidebar-foreground": `oklch(0.9 ${Math.min(0.02, c * 0.12)} ${h})`,
    "--sidebar-primary": `oklch(0.68 ${c} ${h})`,
    "--sidebar-primary-foreground": `oklch(0.16 ${tint} ${h})`,
    "--sidebar-accent": `oklch(0.22 ${tint} ${h})`,
    "--sidebar-accent-foreground": `oklch(0.97 ${Math.min(0.02, c * 0.1)} ${h})`,
    "--sidebar-border": "oklch(1 0 0 / 14%)",
    "--sidebar-ring": `oklch(0.68 ${c} ${h})`,
    "--chart-1": `oklch(0.68 ${c} ${h})`,
    "--chart-2": `oklch(0.6 ${c * 0.8} ${(h + 30) % 360})`,
    "--chart-3": `oklch(0.78 ${c * 0.7} ${(h + 60) % 360})`,
    "--chart-4": `oklch(0.62 ${c * 0.6} ${(h + 300) % 360})`,
    "--chart-5": `oklch(0.72 ${c * 0.5} ${(h + 180) % 360})`,
  };
}

export function applyAppearance(settings: AppearanceSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const theme = THEMES[(settings.accent as ThemeKey) ?? "coral"] ?? THEMES.coral;

  root.classList.toggle("dark", settings.dark_mode);
  root.classList.toggle("high-contrast", settings.high_contrast);

  const tokens = settings.dark_mode ? darkTokens(theme) : lightTokens(theme);

  if (settings.high_contrast) {
    // High contrast owns the palette; clear inline overrides so the class wins.
    Object.keys(tokens).forEach((name) => root.style.removeProperty(name));
  } else {
    Object.entries(tokens).forEach(([name, value]) => root.style.setProperty(name, value));
  }

  root.style.fontSize = `${Math.min(140, Math.max(85, settings.text_scale || 100))}%`;
}
