import type { SupabaseClient } from "@supabase/supabase-js";

const VULGAR_WORDS = [
  "badword",
  "fuck",
  "fucking",
  "shit",
  "bitch",
  "asshole",
  "crap",
  "bastard",
  "damn",
  "cunt",
  "dick",
  "pussy",
  "slut",
  "whore",
  "idiot",
  "stupid",
];

export function containsVulgarity(text: string | null | undefined): boolean {
  if (!text) return false;
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  return clean.split(/\s+/).some((word) => VULGAR_WORDS.includes(word));
}

export type ModerationResult =
  | { status: "clean" }
  | { status: "suspended"; message: string; suspendedUntil: string }
  | { status: "warned"; message: string; warnings: number };

function suspensionDays(offenses: number): number {
  if (offenses >= 3) return 14;
  if (offenses === 2) return 7;
  return 3;
}

/** Blocks the action when the account is currently suspended. */
export async function assertNotSuspended(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ suspendedUntil: string } | null> {
  const { data } = await supabase
    .from("profiles")
    .select("suspended_until")
    .eq("id", userId)
    .maybeSingle();

  const until = data?.suspended_until as string | null | undefined;
  if (until && new Date(until) > new Date()) return { suspendedUntil: until };

  if (until) {
    await supabase.from("profiles").update({ suspended_until: null }).eq("id", userId);
  }
  return null;
}

/**
 * Applies the academic-decorum policy: 3 warnings trigger an escalating
 * suspension (3 / 7 / 14 days).
 */
export async function moderate(
  supabase: SupabaseClient,
  userId: string,
  surface: string,
  text: string,
): Promise<ModerationResult> {
  if (!containsVulgarity(text)) return { status: "clean" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("warnings, offenses")
    .eq("id", userId)
    .maybeSingle();

  const warnings = (profile?.warnings ?? 0) + 1;
  const snippet = text.slice(0, 240);

  if (warnings >= 3) {
    const offenses = (profile?.offenses ?? 0) + 1;
    const days = suspensionDays(offenses);
    const until = new Date();
    until.setDate(until.getDate() + days);

    await supabase
      .from("profiles")
      .update({ warnings: 0, offenses, suspended_until: until.toISOString() })
      .eq("id", userId);

    await supabase.from("moderation_events").insert({
      user_id: userId,
      surface,
      snippet,
      action: `suspended_${days}_days`,
    });

    return {
      status: "suspended",
      suspendedUntil: until.toISOString(),
      message: `Third warning reached. Your account is suspended for ${days} days (until ${until.toDateString()}).`,
    };
  }

  await supabase.from("profiles").update({ warnings }).eq("id", userId);
  await supabase.from("moderation_events").insert({
    user_id: userId,
    surface,
    snippet,
    action: `warning_${warnings}`,
  });

  return {
    status: "warned",
    warnings,
    message: `Warning ${warnings}/3: vulgar or abusive language breaches the academic decorum policy. Three warnings trigger a multi-day suspension.`,
  };
}
