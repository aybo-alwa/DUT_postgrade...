import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Bot, CheckCircle2, Circle, Heart, Users } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import {
  useCompletedMilestones,
  useMilestones,
  useModules,
  useProfile,
  useResources,
  useSession,
} from "@/hooks/useHub";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Research Journey Hub" },
      {
        name: "description",
        content:
          "Your postgraduate dashboard: milestone progress, recommended resources, wellbeing check-ins and community activity.",
      },
      { property: "og:title", content: "Dashboard — Research Journey Hub" },
      {
        property: "og:description",
        content: "See your research milestones, modules and recommended resources at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { userId } = useSession();
  const { data: profile } = useProfile(userId);
  const { data: milestones } = useMilestones(!!userId);
  const { data: completed } = useCompletedMilestones(userId);
  const { data: modules } = useModules(!!userId);
  const { data: resources } = useResources(!!userId);

  const doneKeys = new Set((completed ?? []).map((c) => c.milestone_key));
  const total = milestones?.length ?? 0;
  const percent = total ? Math.round((doneKeys.size / total) * 100) : 0;
  const next = (milestones ?? []).find((m) => !doneKeys.has(m.key));

  return (
    <AppShell title="Dashboard">
      <section className="rounded-3xl bg-sidebar p-7 text-sidebar-foreground sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/60">
          {profile?.programme ?? "Postgraduate researcher"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-sidebar-accent-foreground sm:text-4xl">
          Hi {profile?.display_name?.split(" ")[0] ?? "there"}, welcome to your research journey
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sidebar-foreground/80">
          Everything is paced for you — milestones unlock as you go, and support is one click away
          whenever the work feels heavy.
        </p>

        <div className="mt-6 max-w-md rounded-2xl bg-sidebar-accent p-5">
          <div className="flex items-center justify-between text-sm font-semibold text-sidebar-accent-foreground">
            <span>Journey progress</span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} className="mt-3" />
          <p className="mt-3 text-xs text-sidebar-foreground/70">
            {next ? `Next up: ${next.title}` : "All milestones complete. Outstanding."}
          </p>
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <section className="rounded-3xl border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">My research journey</h2>
            <Link to="/journey" className="text-sm font-semibold text-primary hover:underline">
              Open journey
            </Link>
          </div>
          <ol className="mt-4 space-y-3">
            {(milestones ?? []).slice(0, 5).map((milestone) => {
              const done = doneKeys.has(milestone.key);
              return (
                <li key={milestone.key} className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-4">
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-semibold">{milestone.title}</p>
                    <p className="text-sm text-muted-foreground">{milestone.subtitle}</p>
                  </div>
                </li>
              );
            })}
            {!milestones?.length && (
              <li className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                Your milestones will appear here.
              </li>
            )}
          </ol>
        </section>

        <div className="space-y-5">
          <section className="rounded-3xl border bg-card p-6">
            <h2 className="font-display text-lg font-bold">Recommended for you</h2>
            <ul className="mt-3 space-y-3">
              {(resources ?? []).slice(0, 3).map((resource) => (
                <li key={resource.id} className="rounded-2xl bg-secondary/60 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                    {resource.kind}
                  </p>
                  <p className="font-semibold">{resource.title}</p>
                  <p className="text-xs text-muted-foreground">{resource.meta}</p>
                </li>
              ))}
            </ul>
            <Link
              to="/resources"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              All resources <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>

          <section className="rounded-3xl bg-mint p-6 text-mint-foreground">
            <Heart className="h-5 w-5" />
            <h2 className="mt-2 font-display text-lg font-bold">Wellbeing check-in</h2>
            <p className="mt-1 text-sm">
              A five-minute reset can rescue a whole writing afternoon.
            </p>
            <Link to="/wellbeing" className="mt-3 inline-block text-sm font-bold underline">
              Take a mindful moment
            </Link>
          </section>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <QuickCard
          to="/ai-friend"
          icon={<Bot className="h-5 w-5" />}
          title="AI Critical Friend"
          body="Paste a paragraph and get structured, rigorous feedback."
        />
        <QuickCard
          to="/modules"
          icon={<BookOpen className="h-5 w-5" />}
          title={`${modules?.length ?? 0} modules`}
          body="Stage-by-stage guidance from proposal to defence."
        />
        <QuickCard
          to="/community"
          icon={<Users className="h-5 w-5" />}
          title="Research community"
          body="Moderated spaces for peers, writing groups and questions."
        />
      </div>
    </AppShell>
  );
}

function QuickCard({
  to,
  icon,
  title,
  body,
}: {
  to: "/ai-friend" | "/modules" | "/community";
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link to={to} className="rounded-3xl border bg-card p-6 transition-shadow hover:shadow-md">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/12 text-primary">
        {icon}
      </span>
      <p className="mt-3 font-display font-bold">{title}</p>
      <p className="text-sm text-muted-foreground">{body}</p>
    </Link>
  );
}
