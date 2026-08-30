import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldHalf } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app/AppShell";
import { publishPost } from "@/lib/hub.functions";
import { usePosts, useSession, useSpaces } from "@/hooks/useHub";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Research community — moderated peer spaces" },
      {
        name: "description",
        content:
          "Ask questions, share progress and join writing groups in moderated postgraduate research spaces with an academic decorum policy.",
      },
      { property: "og:title", content: "Research community — moderated peer spaces" },
      {
        property: "og:description",
        content: "Moderated peer spaces for postgraduate researchers, with optional anonymity.",
      },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const { userId } = useSession();
  const queryClient = useQueryClient();
  const { data: spaces } = useSpaces(!!userId);
  const [spaceKey, setSpaceKey] = useState<string | null>(null);
  const { data: posts } = usePosts(!!userId, spaceKey);
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const post = useServerFn(publishPost);

  useEffect(() => {
    if (!spaceKey && spaces?.length) setSpaceKey(spaces[0]!.key);
  }, [spaces, spaceKey]);

  const send = useMutation({
    mutationFn: async () => {
      if (!spaceKey) throw new Error("Pick a space first");
      return post({ data: { spaceKey, body: body.trim(), isAnonymous: anonymous } });
    },
    onSuccess: (result) => {
      if (result.status === "ok") {
        setBody("");
        toast.success("Posted to the community.");
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      } else if (result.status === "suspended") {
        toast.error("Your account is suspended under the language policy.");
      } else {
        toast.error(result.message);
      }
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not post"),
  });

  const activeSpace = spaces?.find((s) => s.key === spaceKey);

  return (
    <AppShell title="Community">
      <header className="rounded-3xl border bg-card p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Research community</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Peer spaces for the parts of research nobody warns you about. Every post passes through the
          decorum check before it goes live.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(spaces ?? []).map((space) => (
            <button
              key={space.key}
              type="button"
              onClick={() => setSpaceKey(space.key)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                spaceKey === space.key ? "bg-primary text-primary-foreground" : "bg-card",
              )}
            >
              {space.title}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div>
          <section className="rounded-3xl border bg-card p-6">
            <p className="font-display font-bold">{activeSpace?.title ?? "Share something"}</p>
            <p className="text-sm text-muted-foreground">{activeSpace?.description}</p>
            <Textarea
              className="mt-4"
              rows={4}
              placeholder="Ask a question, share a win, or offer help…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={anonymous} onCheckedChange={setAnonymous} />
                Post anonymously
              </label>
              <Button
                disabled={body.trim().length < 5 || send.isPending || !spaceKey}
                onClick={() => send.mutate()}
              >
                {send.isPending ? "Posting…" : "Post"}
              </Button>
            </div>
          </section>

          <ul className="mt-5 space-y-4">
            {(posts ?? []).map((item) => (
              <li key={item.id} className="rounded-3xl border bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-sunshine font-display text-sm font-bold text-sunshine-foreground">
                    {item.is_anonymous ? "?" : item.author_name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {item.is_anonymous ? "Anonymous scholar" : item.author_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{item.body}</p>
              </li>
            ))}
            {!posts?.length && (
              <li className="rounded-3xl border bg-card p-6 text-sm text-muted-foreground">
                No posts in this space yet — be the first.
              </li>
            )}
          </ul>
        </div>

        <aside className="h-fit rounded-3xl bg-mint p-6 text-mint-foreground">
          <ShieldHalf className="h-5 w-5" />
          <p className="mt-2 font-display font-bold">Community ground rules</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>• Critique arguments, never people.</li>
            <li>• Zero tolerance for vulgar or abusive language.</li>
            <li>• Three warnings trigger a suspension (3, then 7, then 14 days).</li>
            <li>• Anonymity is for vulnerability, not for cruelty.</li>
          </ul>
        </aside>
      </div>
    </AppShell>
  );
}
