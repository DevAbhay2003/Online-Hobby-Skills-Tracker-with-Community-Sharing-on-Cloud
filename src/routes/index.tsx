import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Flame, Target, TrendingUp, Users, Award, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HobbyPulse — Track Hobbies, Build Streaks, Share Progress" },
      {
        name: "description",
        content:
          "Log practice sessions for any hobby or skill, watch your streaks grow, complete goals, and share milestones with a community that keeps you accountable.",
      },
      { property: "og:title", content: "HobbyPulse — Track Hobbies, Build Streaks, Share Progress" },
      {
        property: "og:description",
        content:
          "Log practice sessions for any hobby or skill, watch your streaks grow, complete goals, and share milestones with a community that keeps you accountable.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Flame, title: "Streaks that stick", text: "Log a session a day and watch your flame grow. Miss a day, feel the sting." },
  { icon: Target, title: "Goals & milestones", text: "Set hour targets, break them into milestones, and track progress to 100%." },
  { icon: TrendingUp, title: "Real analytics", text: "Weekly trends, hours per skill, and goal completion — all charted automatically." },
  { icon: Users, title: "Community feed", text: "Share wins, like and comment, follow people on the same journey." },
  { icon: Award, title: "Badges", text: "Earn badges for streaks, total hours, and completed goals." },
  { icon: Camera, title: "Proof uploads", text: "Attach photos of your work to posts and your profile." },
];

function Landing() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard" });
  }, [loading, session, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <Flame className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold">HobbyPulse</span>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/auth">Get started</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="py-20 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 glow-flame">
            <Flame className="h-9 w-9 text-primary animate-pulse-flame" />
          </div>
          <h1 className="mx-auto max-w-3xl font-display text-5xl font-bold leading-tight md:text-6xl">
            Your hobbies deserve <span className="text-gradient-flame">momentum</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Most people quit hobbies because there's no structure or accountability.
            HobbyPulse gives you logging, streaks, goals, and a community — the full motivation loop.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/auth">Start tracking free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/feed">Peek at the community</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 pb-24 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 transition-colors hover:border-primary/50">
              <f.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        HobbyPulse — a cloud-backed hobby & skills tracker with community sharing.
      </footer>
    </div>
  );
}
