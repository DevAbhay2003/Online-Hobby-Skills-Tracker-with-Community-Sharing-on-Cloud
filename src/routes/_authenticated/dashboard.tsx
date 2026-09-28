import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Clock, Target, Award, Plus, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { computeStreak, computeBadges, totalMinutes, minutesSince } from "@/lib/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — HobbyPulse" },
      { name: "description", content: "Your practice stats, streaks, goals, and analytics." },
      { property: "og:title", content: "Dashboard — HobbyPulse" },
      { property: "og:description", content: "Your practice stats, streaks, goals, and analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const CHART_COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
  "var(--chart-4)", "var(--chart-5)", "var(--destructive)",
];

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--popover-foreground)",
};

function Dashboard() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
  });

  const { data: skills = [] } = useQuery({
    queryKey: ["skills", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("skills").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("practice_sessions")
        .select("*")
        .eq("user_id", user!.id)
        .order("practiced_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["goals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("goals").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const streak = computeStreak(sessions);
  const hours = (totalMinutes(sessions) / 60).toFixed(1);
  const weekHours = (minutesSince(sessions, 7) / 60).toFixed(1);
  const goalsCompleted = goals.filter((g) => g.status === "COMPLETED").length;
  const badges = computeBadges(sessions, streak, goalsCompleted);
  const activeSkills = skills.filter((s) => s.status === "ACTIVE");

  // Practice hours by skill
  const hoursBySkill = skills
    .map((s) => ({
      name: s.name,
      hours: +(sessions.filter((x) => x.skill_id === s.id).reduce((a, x) => a + x.duration_minutes, 0) / 60).toFixed(1),
    }))
    .filter((d) => d.hours > 0);

  // Weekly trend: last 14 days
  const trend = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      minutes: sessions.filter((s) => s.practiced_at === key).reduce((a, s) => a + s.duration_minutes, 0),
    };
  });

  // Skill distribution by category
  const catMap = new Map<string, number>();
  for (const s of skills) catMap.set(s.category, (catMap.get(s.category) ?? 0) + 1);
  const distribution = Array.from(catMap, ([name, value]) => ({ name, value }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Welcome{profile ? `, ${profile.display_name}` : ""}
          </h1>
          <p className="mt-1 text-muted-foreground">Here's your momentum at a glance.</p>
        </div>
        <Button asChild>
          <Link to="/skills"><Plus className="mr-2 h-4 w-4" /> Add skill</Link>
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current streak</CardTitle>
            <Flame className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">{streak} <span className="text-base font-normal text-muted-foreground">days</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total practice</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">{hours} <span className="text-base font-normal text-muted-foreground">hrs</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This week</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">{weekHours} <span className="text-base font-normal text-muted-foreground">hrs</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Goals completed</CardTitle>
            <Target className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-bold">{goalsCompleted} <span className="text-base font-normal text-muted-foreground">/ {goals.length}</span></p>
          </CardContent>
        </Card>
      </div>

      {sessions.length === 0 && (
        <Card className="mt-8 border-dashed">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">No practice logged yet. Add a skill and log your first session to start your streak.</p>
            <Button className="mt-4" asChild><Link to="/skills">Add your first skill</Link></Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Weekly practice trend</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="minutes" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Hours by skill</CardTitle></CardHeader>
          <CardContent className="h-64">
            {hoursBySkill.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Log sessions to see this chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursBySkill}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="hours" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Skill distribution</CardTitle></CardHeader>
          <CardContent className="h-64">
            {distribution.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Add skills to see this chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribution} dataKey="value" nameKey="name" outerRadius={90} label>
                    {distribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`rounded-xl border p-3 ${b.earned ? "border-primary/40 bg-primary/5" : "opacity-40"}`}
                  title={b.description}
                >
                  <p className="text-sm font-semibold">{b.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{b.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Active skills</CardTitle></CardHeader>
        <CardContent>
          {activeSkills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active skills yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeSkills.map((s) => (
                <Link key={s.id} to="/skills/$skillId" params={{ skillId: s.id }}>
                  <UIBadge variant="secondary" className="cursor-pointer px-3 py-1.5 text-sm hover:bg-accent">
                    {s.name} · {s.current_level.toLowerCase()}
                  </UIBadge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
