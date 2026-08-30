import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Pause, Play, Wind } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wellbeing")({
  head: () => ({
    meta: [
      { title: "Wellbeing & support — pace your research sustainably" },
      {
        name: "description",
        content:
          "Breathing resets, burnout signals and counselling contacts for postgraduate researchers who need to slow down without falling behind.",
      },
      { property: "og:title", content: "Wellbeing & support — pace your research sustainably" },
      {
        property: "og:description",
        content: "Mindful moments, burnout signals and someone to talk to.",
      },
    ],
  }),
  component: WellbeingPage,
});

const PHASES = [
  { label: "Breathe in", seconds: 4 },
  { label: "Hold", seconds: 4 },
  { label: "Breathe out", seconds: 6 },
];

function WellbeingPage() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(PHASES[0]!.seconds);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => {
      setCount((current) => {
        if (current > 1) return current - 1;
        setPhase((p) => {
          const nextPhase = (p + 1) % PHASES.length;
          setCount(PHASES[nextPhase]!.seconds);
          return nextPhase;
        });
        return PHASES[(phase + 1) % PHASES.length]!.seconds;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running, phase]);

  return (
    <AppShell title="Wellbeing">
      <header className="rounded-3xl bg-mint p-6 text-mint-foreground sm:p-8">
        <Heart className="h-6 w-6" />
        <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">Wellbeing & support</h1>
        <p className="mt-2 max-w-2xl text-sm">
          A research degree is a long game. Protecting your head is part of the method, not a
          distraction from it.
        </p>
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border bg-card p-6 text-center">
          <p className="flex items-center justify-center gap-2 font-display text-lg font-bold">
            <Wind className="h-4 w-4" /> Mindful moment
          </p>
          <div className="mx-auto mt-6 grid h-40 w-40 place-items-center rounded-full bg-primary/12">
            <div>
              <p className="font-display text-3xl font-extrabold text-primary">{count}</p>
              <p className="text-sm text-muted-foreground">{PHASES[phase]!.label}</p>
            </div>
          </div>
          <Button
            className="mt-6"
            onClick={() => {
              setRunning((r) => !r);
              if (!running) {
                setPhase(0);
                setCount(PHASES[0]!.seconds);
              }
            }}
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Pause" : "Start 4-4-6 breathing"}
          </Button>
        </section>

        <section className="rounded-3xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Signals worth taking seriously</h2>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li className="rounded-2xl bg-secondary/60 p-4">
              <strong className="text-foreground">Avoidance.</strong> Opening the document and
              closing it again for days on end.
            </li>
            <li className="rounded-2xl bg-secondary/60 p-4">
              <strong className="text-foreground">Sleep drift.</strong> Working late because the
              guilt is louder than the tiredness.
            </li>
            <li className="rounded-2xl bg-secondary/60 p-4">
              <strong className="text-foreground">Isolation.</strong> Going weeks without talking to
              another researcher.
            </li>
            <li className="rounded-2xl bg-secondary/60 p-4">
              <strong className="text-foreground">Flat affect.</strong> A milestone lands and you
              feel nothing at all.
            </li>
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-3xl border bg-card p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <MessageCircle className="h-4 w-4" /> Talk to someone
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Student counselling",
              body: "Free, confidential sessions with counsellors who know research pressure.",
            },
            {
              title: "Supervisor check-in",
              body: "Book a short, agenda-light conversation about scope and pacing.",
            },
            {
              title: "Peer writing group",
              body: "Company while you write beats motivation every time.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl bg-secondary/60 p-4">
              <p className="font-semibold">{card.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{card.body}</p>
            </div>
          ))}
        </div>
        <Link
          to="/community"
          className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Find a peer space →
        </Link>
      </section>
    </AppShell>
  );
}
