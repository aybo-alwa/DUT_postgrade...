import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { applyAppearance } from "@/lib/appearance";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, ready, userId: session?.user.id ?? null };
}

export type Profile = {
  id: string;
  display_name: string;
  programme: string;
  warnings: number;
  offenses: number;
  suspended_until: string | null;
  accent: string;
  dark_mode: boolean;
  high_contrast: boolean;
  text_scale: number;
  captions: boolean;
  keyboard_nav: boolean;
  screen_reader: boolean;
};

export function useProfile(userId: string | null) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile | null> => {
      if (!userId) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (error) throw error;
      if (data) return data as Profile;

      const { data: user } = await supabase.auth.getUser();
      const fallbackName =
        (user.user?.user_metadata?.["display_name"] as string | undefined) ||
        user.user?.email?.split("@")[0] ||
        "Scholar";
      const { data: created, error: insertError } = await supabase
        .from("profiles")
        .insert({ id: userId, display_name: fallbackName })
        .select("*")
        .single();
      if (insertError) throw insertError;
      return created as Profile;
    },
  });
}

export function useApplyAppearance(profile: Profile | null | undefined) {
  useEffect(() => {
    if (!profile) return;
    applyAppearance({
      accent: profile.accent,
      dark_mode: profile.dark_mode,
      high_contrast: profile.high_contrast,
      text_scale: profile.text_scale,
    });
  }, [profile?.accent, profile?.dark_mode, profile?.high_contrast, profile?.text_scale, profile]);
}

export function useUpdateProfile(userId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      if (!userId) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", userId)
        .select("*")
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => queryClient.setQueryData(["profile", userId], data),
  });
}

export type Milestone = {
  key: string;
  title: string;
  subtitle: string;
  position: number;
  requires_challenge: boolean;
  challenge_prompt: string | null;
  unlock_rule: string | null;
};

export function useMilestones(enabled: boolean) {
  return useQuery({
    queryKey: ["milestones"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("milestones").select("*").order("position");
      if (error) throw error;
      return (data ?? []) as Milestone[];
    },
  });
}

export function useCompletedMilestones(userId: string | null) {
  return useQuery({
    queryKey: ["user_milestones", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_milestones")
        .select("milestone_key, completed_at")
        .order("completed_at");
      if (error) throw error;
      return (data ?? []) as { milestone_key: string; completed_at: string }[];
    },
  });
}

export function useModules(enabled: boolean) {
  return useQuery({
    queryKey: ["modules"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("modules").select("*").order("position");
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        slug: string;
        title: string;
        stage: string;
        summary: string;
        duration: string;
        locked: boolean;
        unlock_rule: string | null;
      }[];
    },
  });
}

export function useResources(enabled: boolean) {
  return useQuery({
    queryKey: ["resources"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("resources").select("*").order("position");
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        title: string;
        kind: string;
        meta: string;
        reason: string | null;
        category: string;
      }[];
    },
  });
}

export function useSpaces(enabled: boolean) {
  return useQuery({
    queryKey: ["spaces"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.from("community_spaces").select("*").order("position");
      if (error) throw error;
      return (data ?? []) as { key: string; title: string; description: string }[];
    },
  });
}

export function usePosts(enabled: boolean, spaceKey: string | null) {
  return useQuery({
    queryKey: ["posts", spaceKey],
    enabled,
    queryFn: async () => {
      let query = supabase
        .from("community_posts")
        .select("id, body, author_name, is_anonymous, created_at, space_key, user_id")
        .order("created_at", { ascending: false })
        .limit(50);
      if (spaceKey) query = query.eq("space_key", spaceKey);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        body: string;
        author_name: string;
        is_anonymous: boolean;
        created_at: string;
        space_key: string;
        user_id: string;
      }[];
    },
  });
}

export function useAiHistory(userId: string | null) {
  return useQuery({
    queryKey: ["ai_feedback", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_feedback")
        .select("id, focus, prompt, response, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        focus: string;
        prompt: string;
        response: string;
        created_at: string;
      }[];
    },
  });
}

export function useChallengeSubmissions(userId: string | null) {
  return useQuery({
    queryKey: ["challenges", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenge_submissions")
        .select("id, content, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as { id: string; content: string; created_at: string }[];
    },
  });
}

export function isSuspended(profile: Profile | null | undefined) {
  if (!profile?.suspended_until) return false;
  return new Date(profile.suspended_until) > new Date();
}
