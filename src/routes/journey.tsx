import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Circle, Lock, PenLine } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { submitChallenge } from "@/lib/hub.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  useChallengeSubmissions,
  useCompletedMilestones,
  useMilestones,
  useSession,
} from "@/hooks/useHub";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "My research journey — milestones & challenges" },
      {
        name: "description",
        content:
          "Work through your postgraduate milestones, complete practical challenges and unlock the next stage of your research.",
      },
      { property: "og:title", content: "My research journey — milestones & challenges" },
      {
        property: "og:description",
        content: "Milestone tracking and practical challenges for postgraduate researchers.",
      },
    ],
  }),
  component: JourneyPage,
});

function JourneyPage() {
  const { userId } = useSession();
  const queryClient = useQueryClient();
  const { data: milestones } = useMilestones(!!userId);
  const { data: completed } = useCompletedMilestones(userId);
  const { data: submissions } = useChallengeSubmissions(userId);
  const submit = useServerFn(submitChallenge);
  const [draft, setDraft] = useState("");

  const doneKeys = new Set((completed ?? []).map((c) => c.milestone_key));
  const total = milestones?.length ?? 0;
  const percent = total ? Math.round((doneKeys.size / total) * 100) : 0;

  const toggle = useMutation({
    mutationFn: async ({ key, done }: { key: string; done: boolean }) => {
      if (!userId) throw new Error("Not signed in");
      if (done) {
        const { error } = await supabase
          .from("user_milestones")
          .delete()
          .eq("user_id", userId)
          .eq("milestone_key", key);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_milestones")
          .upsert({ user_id: userId, milestone_key: key }, { onConflict: "user_id,milestone_key" });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user_milestones", userId] }),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update"),
  });

  const challenge = useMutation({
    mutationFn: async (content: string) => submit({ data: { content } }),
    onSuccess: (result) => {
      if (result.status === "ok") {
        toast.success("Challenge submitted. Nice work.");
        setDraft("");
        queryClient.invalidateQueries({ queryKey: ["challenges", userId] });
        queryClient.invalidateQueries({ queryKey: ["user_milestones", userId] });
      } else if (result.status === "suspended") {
        toast.error("Your account is suspended under the language policy.");
      } else {
        toast.error(result.message);
      }
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Submission failed"),
  });

  return (
    <AppShell title="My journey">
      <header className="rounded-3xl border bg-card p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">My research journey</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Tick a milestone when it's genuinely done. Locked stages open once the milestone before
          them is complete.
        </p>
        <div className="mt-5 flex items-center gap-4">
          <Progress value={percent} className="max-w-sm" />
          <span className="text-sm font-semibold">
            {doneKeys.size}/{total} complete
          </span>
        </div>
      </header>

      <ol className="mt-6 space-y-4">
        {(milestones ?? []).map((milestone, index) => {
          const done = doneKeys.has(milestone.key);
          const previous = milestones?.[index - 1];
          const locked = !!previous && !doneKeys.has(previous.key) && !done;

          return (
            <li
              key={milestone.key}
              className={`rounded-3xl border bg-card p-6 ${locked ? "opacity-60" : ""}`}
            >
              <div className="flex flex-wrap items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary font-display font-bold">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-bold">{milestone.title}</p>
                  <p className="text-sm text-muted-foreground">{milestone.subtitle}</p>

                  {milestone.requires_challenge && !locked && (
                    <div className="mt-4 rounded-2xl bg-sunshine/25 p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <PenLine className="h-4 w-4" /> Practical challenge
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {milestone.challenge_prompt}
                      </p>
                      <Textarea
                        className="mt-3 bg-card"
                        rows={4}
                        placeholder="Write your response here (minimum 10 characters)…"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                      />
                      <Button
                        className="mt-3"
                        disabled={draft.trim().length < 10 || challenge.isPending}
                        onClick={() => challenge.mutate(draft.trim())}
                      >
                        {challenge.isPending ? "Submitting…" : "Submit challenge"}
                      </Button>
                    </div>
                  )}
                </div>

                <Button
                  variant={done ? "secondary" : "default"}
                  disabled={locked || toggle.isPending}
                  onClick={() => toggle.mutate({ key: milestone.key, done })}
                >
                  {locked ? (
                    <>
                      <Lock className="h-4 w-4" /> Locked
                    </>
                  ) : done ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Completed
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4" /> Mark complete
                    </>
                  )}
                </Button>
              </div>
            </li>
          );
        })}
      </ol>

      {!!submissions?.length && (
        <section className="mt-8 rounded-3xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Your challenge submissions</h2>
          <ul className="mt-3 space-y-3">
            {submissions.map((item) => (
              <li key={item.id} className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleString()}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{item.content}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
