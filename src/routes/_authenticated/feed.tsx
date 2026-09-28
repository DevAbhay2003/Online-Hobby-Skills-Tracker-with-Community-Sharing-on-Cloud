import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, ImagePlus, Search, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";
import { CATEGORIES } from "@/lib/stats";
import { PostCard, type FeedPost } from "@/components/post-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/feed")({
  head: () => ({
    meta: [
      { title: "Community Feed — HobbyPulse" },
      { name: "description", content: "See what other people are practicing, celebrate milestones, and cheer each other on." },
      { property: "og:title", content: "Community Feed — HobbyPulse" },
      { property: "og:description", content: "See what other people are practicing, celebrate milestones, and cheer each other on." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Feed,
});

function Feed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [skillId, setSkillId] = useState<string>("none");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"recent" | "liked">("recent");

  const { data: mySkills = [] } = useQuery({
    queryKey: ["skills", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("skills").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, profiles(username, display_name, avatar_url), skills(name, category), likes(user_id), comments(id, content, created_at, user_id, profiles(username, display_name))"
        )
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as FeedPost[];
    },
  });

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !content.trim()) return;
    setBusy(true);
    try {
      let mediaPath: string | null = null;
      if (file) mediaPath = await uploadFile(user.id, file, "posts");
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: content.trim(),
        skill_id: skillId === "none" ? null : skillId,
        media_url: mediaPath,
      });
      if (error) throw error;
      toast.success("Posted!");
      setContent(""); setFile(null); setSkillId("none");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post");
    } finally {
      setBusy(false);
    }
  }

  let visible = posts.filter((p) => {
    const matchesSearch =
      !search ||
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.skills?.name.toLowerCase().includes(search.toLowerCase()) ||
      p.profiles?.display_name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === "all" || p.skills?.category === category;
    return matchesSearch && matchesCat;
  });
  if (sort === "liked") visible = [...visible].sort((a, b) => b.likes.length - a.likes.length);

  const trending = Object.entries(
    posts.reduce<Record<string, number>>((acc, p) => {
      if (p.skills?.name) acc[p.skills.name] = (acc[p.skills.name] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Community</h1>
      <p className="mt-1 text-muted-foreground">Share a win, cheer someone on.</p>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <form onSubmit={createPost} className="space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you practice today?"
              rows={3}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Select value={skillId} onValueChange={setSkillId}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Tag a skill" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No skill</SelectItem>
                  {mySkills.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
                <ImagePlus className="h-4 w-4" />
                {file ? file.name.slice(0, 20) : "Add image"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
              <Button type="submit" className="ml-auto" disabled={busy || !content.trim()}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Share
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts, skills, people…" />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as "recent" | "liked")}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="liked">Most liked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading && <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            {!isLoading && visible.length === 0 && (
              <Card className="border-dashed"><CardContent className="py-16 text-center text-muted-foreground">No posts yet — be the first to share.</CardContent></Card>
            )}
            {visible.map((p) => <PostCard key={p.id} post={p} currentUserId={user?.id} />)}
          </div>
        </div>

        <aside>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-primary" /> Trending skills</CardTitle></CardHeader>
            <CardContent>
              {trending.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing trending yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {trending.map(([name, count]) => (
                    <Badge key={name} variant="secondary">{name} · {count}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
