import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { CATEGORIES, LEVELS } from "@/lib/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/skills/")({
  head: () => ({
    meta: [
      { title: "My Skills — HobbyPulse" },
      { name: "description", content: "Manage your hobbies and skills, levels, and statuses." },
      { property: "og:title", content: "My Skills — HobbyPulse" },
      { property: "og:description", content: "Manage your hobbies and skills, levels, and statuses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SkillsPage,
});

const statusColor: Record<string, string> = {
  ACTIVE: "bg-primary/15 text-primary",
  PAUSED: "bg-muted text-muted-foreground",
  COMPLETED: "bg-chart-2/15 text-chart-2",
};

function SkillsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Other");
  const [currentLevel, setCurrentLevel] = useState<string>("BEGINNER");
  const [targetLevel, setTargetLevel] = useState<string>("ADVANCED");
  const [targetDate, setTargetDate] = useState("");
  const [description, setDescription] = useState("");

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["skills", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("skills")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function createSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("skills").insert({
      user_id: user.id,
      name: name.trim(),
      category,
      current_level: currentLevel,
      target_level: targetLevel,
      target_date: targetDate || null,
      description: description.trim(),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Skill added!");
      setOpen(false);
      setName(""); setDescription(""); setTargetDate("");
      queryClient.invalidateQueries({ queryKey: ["skills", user.id] });
    }
  }

  async function deleteSkill(id: string) {
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Skill deleted");
      queryClient.invalidateQueries({ queryKey: ["skills", user?.id] });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">My Skills</h1>
          <p className="mt-1 text-muted-foreground">Every hobby you're building, in one place.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add skill</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add a hobby or skill</DialogTitle></DialogHeader>
            <form onSubmit={createSkill} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Guitar, Photography, Chess" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target date</Label>
                  <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Current level</Label>
                  <Select value={currentLevel} onValueChange={setCurrentLevel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target level</Label>
                  <Select value={targetLevel} onValueChange={setTargetLevel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What are you working toward?" />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create skill
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="mt-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : skills.length === 0 ? (
        <Card className="mt-8 border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">No skills yet. Add your first hobby to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((s) => (
            <Card key={s.id} className="group relative transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    <Link to="/skills/$skillId" params={{ skillId: s.id }} className="hover:text-primary">
                      {s.name}
                    </Link>
                  </CardTitle>
                  <Badge className={statusColor[s.status]}>{s.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{s.description || "No description"}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{s.category}</span>
                  <span>{s.current_level.toLowerCase()} → {s.target_level.toLowerCase()}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" asChild className="flex-1">
                    <Link to="/skills/$skillId" params={{ skillId: s.id }}>Open</Link>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteSkill(s.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
