import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { useResources, useSession } from "@/hooks/useHub";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — reading, templates and toolkits" },
      {
        name: "description",
        content:
          "Curated postgraduate research resources: methodology guides, writing templates, referencing toolkits and recommended reading.",
      },
      { property: "og:title", content: "Resources — reading, templates and toolkits" },
      {
        property: "og:description",
        content: "Curated guides, templates and toolkits for your research stage.",
      },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { userId } = useSession();
  const { data: resources } = useResources(!!userId);
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...new Set((resources ?? []).map((r) => r.category))],
    [resources],
  );
  const visible = (resources ?? []).filter((r) => category === "All" || r.category === category);

  return (
    <AppShell title="Resources">
      <header className="rounded-3xl border bg-card p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Recommended resources</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Picked to match where you are in the journey — not an endless library.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                category === item ? "bg-primary text-primary-foreground" : "bg-card",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((resource) => (
          <article key={resource.id} className="rounded-3xl border bg-card p-6">
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
              {resource.kind}
            </p>
            <h2 className="mt-1 font-display text-lg font-bold">{resource.title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{resource.meta}</p>
            {resource.reason && (
              <p className="mt-4 flex items-start gap-2 rounded-2xl bg-sunshine/25 p-3 text-xs">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{resource.reason}</span>
              </p>
            )}
          </article>
        ))}
        {!visible.length && (
          <p className="text-sm text-muted-foreground">No resources in this category yet.</p>
        )}
      </div>
    </AppShell>
  );
}
