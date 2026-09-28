import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Loader2, Plus, Target, Clock, CheckCircle2, Circle, Trash2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/skills/$skillId")({
  head: () => ({
    meta: [
      { title: "Skill details — HobbyPulse" },
      { name: "description", content: "Log practice sessions, set goals, and track milestones for this skill." },
      { property: "og:title", content: "Skill details — HobbyPulse" },
      { property: "og:description", content: "Log practice sessions, set goals, and track milestones for this skill." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SkillDetail,
});

function SkillDetail() {
  const { skillId } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [logOpen, setLogOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [duration, setDuration] = useState("30");
  const [activity, setActivity] = useState("");
  const [notes, setNotes] = useState("");
  const [practicedAt, setPracticedAt] = useState(() => new Date().toISOString().slice(0, 10));

  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("10");
  const [goalUnit, setGoalUnit] = useState("hours");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goalMilestones, setGoalMilestones] = useState("");

  const { data: skill } = useQuery({
    queryKey: ["skill", skillId],
    queryFn: async () => {
      const { data } = await supabase.from("skills").select("*").eq("id", skillId).single();
      return data;
    },
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["skill-sessions", skillId],
    queryFn: async () => {
      const { data } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("skill_id", skillId)
        .order("practiced_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["skill-goals", skillId],
    queryFn: async () => {
      const { data } = await supabase
        .from("goals")
        .select("*, milestones(*)")
        .eq("skill_id", skillId)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function logSession(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const mins = parseInt(duration, 10);
    const { error } = await supabase.from("practice_sessions").insert({
      user_id: user.id,
      skill_id: skillId,
      duration_minutes: mins,
      activity: activity.trim(),
      notes: notes.trim(),
      practiced_at: practicedAt,
    });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    // Auto-update goal progress for goals measured in hours/minutes/sessions
    for (const g of goals) {
      if (g.status !== "ACTIVE") continue;
      let delta = 0;
      if (g.unit === "hours") delta = mins / 60;
      else if (g.unit === "minutes") delta = mins;
      else if (g.unit === "sessions") delta = 1;
      if (delta === 0) continue;
      const newValue = Number(g.current_value) + delta;
      const completed = newValue >= Number(g.target_value);
      await supabase
        .from("goals")
        .update({ current_value: newValue, status: completed ? "COMPLETED" : "ACTIVE" })
        .eq("id", g.id);
      // Auto-achieve milestones
      for (const m of (g as typeof g & { milestones: { id: string; target_value: number; achieved: boolean }[] }).milestones ?? []) {
        if (!m.achieved && newValue >= Number(m.target_value)) {
          await supabase.from("milestones").update({ achieved: true, achieved_at: new Date().toISOString() }).eq("id", m.id);
        }
      }
      if (completed) toast.success(`Goal completed: ${g.title}! 🎉`);
    }
    setBusy(false);
    toast.success("Session logged!");
    setLogOpen(false);
    setActivity(""); setNotes("");
    queryClient.invalidateQueries({ queryKey: ["skill-sessions", skillId] });
    queryClient.invalidateQueries({ queryKey: ["skill-goals", skillId] });
    queryClient.invalidateQueries({ queryKey: ["sessions", user.id] });
    queryClient.invalidateQueries({ queryKey: ["goals", user.id] });
  }

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { data: goal, error } = await supabase
      .from("goals")
      .insert({
        skill_id: skillId,
        user_id: user.id,
        title: goalTitle.trim(),
        target_value: parseFloat(goalTarget),
        unit: goalUnit,
        deadline: goalDeadline || null,
      })
      .select()
      .single();
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    const milestoneValues = goalMilestones
      .split(",")
      .map((v) => parseFloat(v.trim()))
      .filter((v) => !isNaN(v) && v > 0)
      .sort((a, b) => a - b);
    if (milestoneValues.length > 0) {
      await supabase.from("milestones").insert(
        milestoneValues.map((v) => ({
          goal_id: goal.id,
          title: `${v} ${goalUnit}`,
          target_value: v,
        }))
      );
    }
    setBusy(false);
    toast.success("Goal created!");
    setGoalOpen(false);
    setGoalTitle(""); setGoalMilestones("");
    queryClient.invalidateQueries({ queryKey: ["skill-goals", skillId] });
  }

  async function deleteGoal(id: string) {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) toast.error(error.message);
    else queryClient.invalidateQueries({ queryKey: ["skill-goals", skillId] });
  }

  async function shareWin() {
    if (!user || !skill) return;
    const totalHrs = (sessions.reduce((a, s) => a + s.duration_minutes, 0) / 60).toFixed(1);
    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      skill_id: skillId,
      content: `I've logged ${totalHrs} hours of ${skill.name} practice across ${sessions.length} sessions! 💪`,
    });
    if (error) toast.error(error.message);
    else toast.success("Shared to the community feed!");
  }

  if (!skill) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const totalHrs = (sessions.reduce((a, s) => a + s.duration_minutes, 0) / 60).toFixed(1);

  return (
    <div>
      <Button variant="ghost" size="sm" asChild>
        <Link to="/skills"><ArrowLeft className="mr-2 h-4 w-4" /> All skills</Link>
      </Button>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold">{skill.name}</h1>
            <Badge variant="secondary">{skill.category}</Badge>
            <Badge variant="outline">{skill.status}</Badge>
          </div>
          <p className="mt-2 text-muted-foreground">{skill.description}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {skill.current_level.toLowerCase()} → {skill.target_level.toLowerCase()} · {totalHrs} hrs total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={shareWin}><Share2 className="mr-2 h-4 w-4" /> Share progress</Button>
          <Dialog open={logOpen} onOpenChange={setLogOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Log practice</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log a practice session</DialogTitle></DialogHeader>
              <form onSubmit={logSession} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input type="number" min={1} required value={duration} onChange={(e) => setDuration(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" required value={practicedAt} onChange={(e) => setPracticedAt(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Activity</Label>
                  <Input required value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="e.g. Practiced barre chords" />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What went well? What to improve?" />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Log session
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Goals</CardTitle>
              <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
                <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="mr-1 h-4 w-4" /> New goal</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create a goal</DialogTitle></DialogHeader>
                  <form onSubmit={createGoal} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input required value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder="e.g. Practice 30 hours" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Target value</Label>
                        <Input type="number" min={1} step="any" required value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Select value={goalUnit} onValueChange={setGoalUnit}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hours">hours</SelectItem>
                            <SelectItem value="minutes">minutes</SelectItem>
                            <SelectItem value="sessions">sessions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Deadline (optional)</Label>
                      <Input type="date" value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Milestones (comma-separated values)</Label>
                      <Input value={goalMilestones} onChange={(e) => setGoalMilestones(e.target.value)} placeholder="e.g. 5, 10, 20, 30" />
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create goal
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {goals.length === 0 && <p className="text-sm text-muted-foreground">No goals yet. Set one to track progress.</p>}
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((Number(g.current_value) / Number(g.target_value)) * 100));
              const ms = ((g as typeof g & { milestones?: { id: string; title: string; target_value: number; achieved: boolean }[] }).milestones ?? [])
                .slice()
                .sort((a, b) => Number(a.target_value) - Number(b.target_value));
              return (
                <div key={g.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{g.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {Number(g.current_value).toFixed(1)} / {Number(g.target_value)} {g.unit}
                        {g.deadline ? ` · due ${g.deadline}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={g.status === "COMPLETED" ? "default" : "secondary"}>{g.status}</Badge>
                      <Button size="icon" variant="ghost" onClick={() => deleteGoal(g.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={pct} className="mt-3" />
                  <p className="mt-1 text-right text-xs text-muted-foreground">{pct}%</p>
                  {ms.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ms.map((m) => (
                        <span key={m.id} className="flex items-center gap-1 text-xs text-muted-foreground">
                          {m.achieved ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <Circle className="h-3.5 w-3.5" />}
                          {m.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Practice log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions logged yet.</p>}
            {sessions.slice(0, 20).map((s) => (
              <div key={s.id} className="rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{s.activity}</p>
                  <Badge variant="secondary">{s.duration_minutes} min</Badge>
                </div>
                {s.notes && <p className="mt-1 text-sm text-muted-foreground">{s.notes}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{s.practiced_at}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
