import { createFileRoute } from "@tanstack/react-router";
import { Accessibility, LifeBuoy, ShieldHalf } from "lucide-react";

import { AppShell, AccessibilityPanel } from "@/components/app/AppShell";
import { useProfile, useSession, useUpdateProfile } from "@/hooks/useHub";
import { ACCENTS, type AccentKey } from "@/lib/appearance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support & accessibility settings" },
      {
        name: "description",
        content:
          "Adjust accessibility settings, update your researcher profile and read the academic decorum policy and FAQs.",
      },
      { property: "og:title", content: "Support & accessibility settings" },
      {
        property: "og:description",
        content: "Accessibility controls, profile settings and answers to common questions.",
      },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const { userId } = useSession();
  const { data: profile } = useProfile(userId);
  const update = useUpdateProfile(userId);

  return (
    <AppShell title="Support">
      <header className="rounded-3xl border bg-card p-6 sm:p-8">
        <LifeBuoy className="h-6 w-6 text-primary" />
        <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">Support & settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Tune the space to suit you, then get answers to the questions researchers ask most.
        </p>
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Your profile</h2>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                defaultValue={profile?.display_name ?? ""}
                onBlur={(e) =>
                  e.target.value.trim() && update.mutate({ display_name: e.target.value.trim() })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="programme">Programme</Label>
              <Input
                id="programme"
                defaultValue={profile?.programme ?? ""}
                onBlur={(e) =>
                  e.target.value.trim() && update.mutate({ programme: e.target.value.trim() })
                }
              />
            </div>
            <div>
              <Label>Accent colour</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Object.keys(ACCENTS) as AccentKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    title={ACCENTS[key].label}
                    onClick={() => update.mutate({ accent: key })}
                    className={`h-8 w-8 rounded-full border-2 ${
                      profile?.accent === key ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ background: ACCENTS[key].primary }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border bg-card p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold">
            <Accessibility className="h-4 w-4" /> Accessibility
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Captions, keyboard navigation, screen-reader mode, high contrast and text size all live
            in one panel — and follow you across devices.
          </p>
          <div className="mt-4">
            <AccessibilityPanel />
          </div>

          <div className="mt-6 rounded-2xl bg-sunshine/25 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldHalf className="h-4 w-4" /> Standing so far
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Warnings: {profile?.warnings ?? 0}/3 · Past suspensions: {profile?.offenses ?? 0}
            </p>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-3xl border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Frequently asked</h2>
        <Accordion type="single" collapsible className="mt-2">
          <AccordionItem value="policy">
            <AccordionTrigger>How does the language policy work?</AccordionTrigger>
            <AccordionContent>
              Every community post, challenge submission and AI Critical Friend prompt is checked for
              vulgar or abusive language. Each breach is a warning; the third warning suspends your
              account for 3 days, and repeat offences escalate to 7 then 14 days.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="unlock">
            <AccordionTrigger>Why is a module locked?</AccordionTrigger>
            <AccordionContent>
              Modules unlock as their matching milestone is completed, so the guidance always matches
              the stage you're actually at.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="ai">
            <AccordionTrigger>Is the AI Critical Friend marking my work?</AccordionTrigger>
            <AccordionContent>
              No. It gives structured formative feedback — strengths, risks, sharpening actions and a
              question to think about. Your supervisor and examiners remain the authority.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="anon">
            <AccordionTrigger>Is anonymous posting really anonymous?</AccordionTrigger>
            <AccordionContent>
              Your name is hidden from other researchers. Moderation records still link posts to
              accounts so the decorum policy can be enforced fairly.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </AppShell>
  );
}
