import { useMemo, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Accessibility,
  Bell,
  BookOpen,
  Bot,
  Folder,
  Heart,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Moon,
  Palette,
  Route as RouteIcon,
  Search,
  ShieldHalf,
  Sun,
  Sparkles,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { THEMES, themeSwatch, type ThemeKey } from "@/lib/appearance";
import {
  isSuspended,
  useApplyAppearance,
  useModules,
  useProfile,
  useResources,
  useSession,
  useSpaces,
  useUpdateProfile,
} from "@/hooks/useHub";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/journey", label: "My journey", icon: RouteIcon },
  { to: "/ai-friend", label: "AI Critical Friend", icon: Bot },
  { to: "/modules", label: "Modules", icon: BookOpen },
  { to: "/resources", label: "Resources", icon: Folder },
  { to: "/community", label: "Community", icon: Users },
  { to: "/wellbeing", label: "Wellbeing", icon: Heart },
  { to: "/support", label: "Support", icon: HelpCircle },
] as const;

export function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { session, ready, userId } = useSession();
  const navigate = useNavigate();
  const { data: profile } = useProfile(userId);
  const updateProfile = useUpdateProfile(userId);
  const [mobileNav, setMobileNav] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useApplyAppearance(profile);

  const enabled = !!userId;
  const { data: modules } = useModules(enabled);
  const { data: resources } = useResources(enabled);
  const { data: spaces } = useSpaces(enabled);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const items: { label: string; hint: string; to: string }[] = [
      ...(modules ?? []).map((m) => ({ label: m.title, hint: `Module · ${m.stage}`, to: "/modules" })),
      ...(resources ?? []).map((r) => ({ label: r.title, hint: `${r.kind} · ${r.meta}`, to: "/resources" })),
      ...(spaces ?? []).map((s) => ({ label: s.title, hint: "Community space", to: "/community" })),
      { label: "AI Critical Friend", hint: "Get rigorous feedback on a draft", to: "/ai-friend" },
      { label: "Accessibility controls", hint: "Text size, contrast, captions", to: "/support" },
      { label: "Wellbeing & support", hint: "Mindful moments, talk to someone", to: "/wellbeing" },
    ];
    return items.filter((i) => `${i.label} ${i.hint}`.toLowerCase().includes(q)).slice(0, 6);
  }, [query, modules, resources, spaces]);

  if (ready && !session) {
    navigate({ to: "/auth" });
    return null;
  }

  const suspended = isSuspended(profile);
  const warnings = profile?.warnings ?? 0;
  const initial = (profile?.display_name ?? "S").charAt(0).toUpperCase();

  const sidebar = (
    <div className="flex h-full w-64 shrink-0 flex-col justify-between bg-sidebar text-sidebar-foreground">
      <div>
        <div className="flex items-center gap-3 px-5 py-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-base font-bold text-sidebar-accent-foreground">
              Moodle Journey
            </p>
            <p className="text-xs text-sidebar-foreground/70">postgraduate support space</p>
          </div>
        </div>

        <p className="px-6 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/50">
          Your workspace
        </p>
        <nav className="space-y-1 px-3">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileNav(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2 px-3 pb-5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setPaletteOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl bg-sidebar-accent px-3 py-2 text-xs font-medium text-sidebar-accent-foreground"
          >
            <span className="flex items-center gap-2">
              <Palette className="h-3.5 w-3.5" /> Accent colour
            </span>
            <span
              className="h-3.5 w-3.5 rounded-full"
              style={{ background: ACCENTS[(profile?.accent as AccentKey) ?? "coral"]?.primary }}
            />
          </button>
          {paletteOpen && (
            <div className="absolute bottom-11 left-0 z-50 w-full rounded-xl border bg-popover p-3 shadow-xl">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Select accent
              </p>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(ACCENTS) as AccentKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    title={ACCENTS[key].label}
                    onClick={() => {
                      updateProfile.mutate({ accent: key });
                      setPaletteOpen(false);
                    }}
                    className="h-6 w-6 rounded-full border-2 border-card shadow"
                    style={{ background: ACCENTS[key].primary }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => updateProfile.mutate({ dark_mode: !profile?.dark_mode })}
          className="flex w-full items-center gap-2 rounded-xl bg-sidebar-accent px-3 py-2 text-xs font-medium text-sidebar-accent-foreground"
        >
          {profile?.dark_mode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          {profile?.dark_mode ? "Light mode" : "Dark mode"}
        </button>

        <div className="mt-3 flex items-center gap-3 border-t border-sidebar-border pt-4">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-sunshine font-display text-sm font-bold text-sunshine-foreground">
            {initial}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">
              {profile?.display_name ?? "Scholar"}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/70">{profile?.programme}</p>
          </div>
          <button
            type="button"
            title="Sign out"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
            className="text-sidebar-foreground/70 hover:text-primary"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen md:block">{sidebar}</aside>

      {mobileNav && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="h-full overflow-y-auto">{sidebar}</div>
          <button
            type="button"
            aria-label="Close navigation"
            className="flex-1 bg-ink/50"
            onClick={() => setMobileNav(false)}
          >
            <X className="ml-4 h-5 w-5 text-ink-foreground" />
          </button>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-8">
            <button
              type="button"
              className="md:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <p className="hidden text-sm text-muted-foreground sm:block">
              Moodle / <span className="font-semibold text-foreground">{title}</span>
            </p>

            <div className="relative ml-auto w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search modules, resources, spaces…"
                aria-label="Search the hub"
                className="w-full rounded-full border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              {results.length > 0 && (
                <ul className="absolute left-0 right-0 top-11 z-40 overflow-hidden rounded-2xl border bg-popover shadow-xl">
                  {results.map((r) => (
                    <li key={`${r.to}-${r.label}`}>
                      <Link
                        to={r.to}
                        onClick={() => setQuery("")}
                        className="block px-4 py-2.5 text-sm hover:bg-accent"
                      >
                        <span className="font-medium">{r.label}</span>
                        <span className="block text-xs text-muted-foreground">{r.hint}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <AccessibilityPanel />

            <button
              type="button"
              aria-label="Notifications"
              className="hidden h-9 w-9 place-items-center rounded-full border bg-card sm:grid"
            >
              <Bell className="h-4 w-4" />
            </button>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-sunshine font-display text-sm font-bold text-sunshine-foreground">
              {initial}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 border-t bg-sunshine/25 px-4 py-1.5 text-center text-[11px] text-foreground/80">
            <ShieldHalf className="h-3.5 w-3.5" />
            <span>
              <strong>Academic policy:</strong> zero vulgarity tolerance. 3 warnings trigger a 3-day
              suspension (7 then 14 days on repeat offences).
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                warnings === 0 ? "bg-mint text-mint-foreground" : "bg-destructive/15 text-destructive",
              )}
            >
              Warnings: {warnings}/3
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {suspended ? (
            <div className="mx-auto max-w-lg rounded-3xl border border-destructive/30 bg-card p-8 text-center shadow-sm">
              <TriangleAlert className="mx-auto h-8 w-8 text-destructive" />
              <h1 className="mt-3 font-display text-2xl font-bold">Account suspended</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your access is blocked under the language policy until{" "}
                {new Date(profile!.suspended_until!).toLocaleString()}. Wellbeing support is still
                available if you need to talk to someone.
              </p>
              <Button className="mt-5" onClick={() => supabase.auth.signOut()}>
                Sign out
              </Button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

export function AccessibilityPanel() {
  const { userId } = useSession();
  const { data: profile } = useProfile(userId);
  const update = useUpdateProfile(userId);
  const scale = profile?.text_scale ?? 100;

  const rows: { key: "captions" | "keyboard_nav" | "screen_reader" | "high_contrast"; label: string }[] = [
    { key: "captions", label: "Captions on videos" },
    { key: "keyboard_nav", label: "Keyboard navigation" },
    { key: "screen_reader", label: "Screen reader friendly" },
    { key: "high_contrast", label: "High contrast" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-xs font-semibold"
        >
          <Accessibility className="h-4 w-4" />
          <span className="hidden sm:inline">Accessibility</span>
        </button>
      </SheetTrigger>
      <SheetContent className="w-[22rem]">
        <SheetHeader>
          <SheetTitle className="font-display">Accessibility controls</SheetTitle>
        </SheetHeader>
        <p className="px-4 text-sm text-muted-foreground">Make the space work for you.</p>
        <div className="mt-4 space-y-1 px-4">
          {rows.map((row) => (
            <label
              key={row.key}
              className="flex items-center justify-between border-b py-3 text-sm last:border-b-0"
            >
              {row.label}
              <Switch
                checked={!!profile?.[row.key]}
                onCheckedChange={(checked) => update.mutate({ [row.key]: checked })}
              />
            </label>
          ))}
          <div className="flex items-center justify-between py-3 text-sm">
            Text size
            <div className="flex items-center gap-1">
              {[
                { label: "A-", value: 90 },
                { label: "A", value: 100 },
                { label: "A+", value: 115 },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update.mutate({ text_scale: option.value })}
                  className={cn(
                    "h-8 w-9 rounded-lg border text-xs font-semibold",
                    scale === option.value ? "bg-primary text-primary-foreground" : "bg-card",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
