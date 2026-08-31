import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertNotSuspended, moderate } from "./moderation.server";
import { criticalFriend } from "./ai.server";

export const askCriticalFriend = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({ focus: z.string().min(1).max(40), text: z.string().min(20).max(6000) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const suspended = await assertNotSuspended(supabase, userId);
    if (suspended) return { status: "suspended" as const, suspendedUntil: suspended.suspendedUntil };

    const verdict = await moderate(supabase, userId, "ai_critical_friend", data.text);
    if (verdict.status !== "clean") return verdict;

    const response = await criticalFriend(data.focus, data.text);
    await supabase
      .from("ai_feedback")
      .insert({ user_id: userId, focus: data.focus, prompt: data.text, response });

    return { status: "ok" as const, response };
  });

export const publishPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        spaceKey: z.string().min(1).max(60),
        body: z.string().min(5).max(2000),
        isAnonymous: z.boolean().optional().default(false),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const suspended = await assertNotSuspended(supabase, userId);
    if (suspended) return { status: "suspended" as const, suspendedUntil: suspended.suspendedUntil };

    const verdict = await moderate(supabase, userId, "community_post", data.body);
    if (verdict.status !== "clean") return verdict;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, nickname")
      .eq("id", userId)
      .maybeSingle();

    const { error } = await supabase.from("community_posts").insert({
      user_id: userId,
      space_key: data.spaceKey,
      body: data.body,
      author_name: profile?.nickname || profile?.display_name || "Scholar",
      is_anonymous: data.isAnonymous,
    });
    if (error) throw new Error(error.message);

    return { status: "ok" as const };
  });

export const submitChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ content: z.string().min(10).max(1200) }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const suspended = await assertNotSuspended(supabase, userId);
    if (suspended) return { status: "suspended" as const, suspendedUntil: suspended.suspendedUntil };

    const verdict = await moderate(supabase, userId, "practical_challenge", data.content);
    if (verdict.status !== "clean") return verdict;

    const { error } = await supabase
      .from("challenge_submissions")
      .insert({ user_id: userId, milestone_key: "challenge", content: data.content });
    if (error) throw new Error(error.message);

    await supabase
      .from("user_milestones")
      .upsert({ user_id: userId, milestone_key: "challenge" }, { onConflict: "user_id,milestone_key" });

    return { status: "ok" as const };
  });
