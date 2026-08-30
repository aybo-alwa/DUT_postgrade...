import { createFileRoute } from "@tanstack/react-router";
import { Clock, Lock } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { useCompletedMilestones, useModules, useSession } from "@/hooks/useHub";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/modules")({
  head: () => ({
    meta: [
      { title: "Modules — staged postgraduate research training" },
      {
        name: "description",
        content:
          "Stage-by-stage research modules from proposal writing to ethics, data analysis and the viva, unlocked as your journey progresses.",
      },
      { property: "og:title", content: "Modules — staged postgraduate research training" },
      {
        property: "og:description",
        content: "Research training modules that unlock as you complete your milestones.",
      },
    ],
  }),
  component: ModulesPage,
});

function ModulesPage() {
  const { userId } = useSession();
  const { data: modules } = useModules(!!userId);
  const { data: completed } = useCompletedMilestones(userId);
  const doneKeys = new Set((completed ?? []).map((c) => c.milestone_key));

  return (
    <AppShell title="Modules">
      <header className="rounded-3xl border bg-card p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Research modules</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Short, practical modules paced to your stage. A locked module opens as soon as its
          matching milestone is complete.
        </p>
      </header>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(modules ?? []).map((module) => {
          const locked = module.locked && !!module.unlock_rule && !doneKeys.has(module.unlock_rule);
          return (
            <article
              key={module.id}
              className={`flex flex-col rounded-3xl border bg-card p-6 ${locked ? "opacity-70" : ""}`}
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                {module.stage}
              </p>
              <h2 className="mt-1 font-display text-lg font-bold">{module.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{module.summary}</p>
              <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {module.duration}
              </p>
              <Button className="mt-4" variant={locked ? "secondary" : "default"} disabled={locked}>
                {locked ? (
                  <>
                    <Lock className="h-4 w-4" /> Complete the milestone first
                  </>
                ) : (
                  "Open module"
                )}
              </Button>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
