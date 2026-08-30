import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { askCriticalFriend } from "@/lib/hub.functions";
import { useAiHistory, useSession } from "@/hooks/useHub";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const FOCUS_OPTIONS = ["Methodology", "Epistemology", "Tone", "Counter-arguments", "Structure"];

export const Route = createFileRoute("/ai-friend")({
  head: () => ({
    meta: [
      { title: "AI Critical Friend — rigorous research feedback" },
      {
        name: "description",
        content:
          "Paste a draft paragraph and get structured feedback on methodology, epistemology, tone, counter-arguments or structure.",
      },
      { property: "og:title", content: "AI Critical Friend — rigorous research feedback" },
      {
        property: "og:description",
        content: "Structured strengths, risks and next steps for your postgraduate writing.",
      },
    ],
  }),
  component: AiFriendPage,
});

function AiFriendPage() {
  const { userId } = useSession();
  const queryClient = useQueryClient();
  const { data: history } = useAiHistory(userId);
  const ask = useServerFn(askCriticalFriend);
  const [focus, setFocus] = useState(FOCUS_OPTIONS[0]!);
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  const run = useMutation({
    mutationFn: async () => ask({ data: { focus, text: text.trim() } }),
    onSuccess: (result) => {
      if (result.status === "ok") {
        setAnswer(result.response);
        queryClient.invalidateQueries({ queryKey: ["ai_feedback", userId] });
      } else if (result.status === "suspended") {
        toast.error("Your account is suspended under the language policy.");
      } else {
        toast.error(result.message);
      }
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "The Critical Friend is unavailable"),
  });

  return (
    <AppShell title="AI Critical Friend">
      <header className="rounded-3xl bg-sidebar p-6 text-sidebar-foreground sm:p-8">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Bot className="h-5 w-5" />
        </span>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-sidebar-accent-foreground sm:text-3xl">
          AI Critical Friend
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-sidebar-foreground/80">
          Rigorous, specific and kind. Choose a lens, paste your writing, and get strengths, risks
          and concrete next steps — never a rubber stamp.
        </p>
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border bg-card p-6">
          <p className="text-sm font-semibold">Feedback lens</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {FOCUS_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFocus(option)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold",
                  focus === option ? "bg-primary text-primary-foreground" : "bg-card",
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <Textarea
            className="mt-4"
            rows={12}
            placeholder="Paste a paragraph from your proposal, methodology chapter or abstract (minimum 20 characters)…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {text.trim().length} characters
              {text.trim().length < 20 ? " — 20 needed before feedback unlocks" : ""}
            </span>
            <Button
              disabled={text.trim().length < 20 || run.isPending || !userId}
              onClick={() => run.mutate()}
            >
              <Sparkles className="h-4 w-4" />
              {run.isPending ? "Thinking…" : "Get feedback"}
            </Button>
          </div>
          {!userId && (
            <p className="mt-3 rounded-2xl bg-secondary/60 p-3 text-xs text-muted-foreground">
              You need to be signed in for the Critical Friend to read your draft.{" "}
              <Link to="/auth" className="font-semibold text-primary underline">
                Sign in
              </Link>
            </p>
          )}
        </section>

        <section className="rounded-3xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Feedback</h2>
          {answer ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Your feedback will appear here, organised into strengths, risks, sharpening actions
              and one question to sit with.
            </p>
          )}
        </section>
      </div>

      {!!history?.length && (
        <section className="mt-6 rounded-3xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Recent feedback</h2>
          <ul className="mt-3 space-y-3">
            {history.map((item) => (
              <li key={item.id} className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  {item.focus} · {new Date(item.created_at).toLocaleDateString()}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.prompt}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{item.response}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
