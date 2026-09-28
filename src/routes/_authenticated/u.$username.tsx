import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Flame, Clock, UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { getSignedUrl } from "@/lib/upload";
import { computeStreak, totalMinutes } from "@/lib/stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/u/$username")({
  head: () => ({
    meta: [
      { title: "Member profile — HobbyPulse" },
      { name: "description", content: "View a community member's skills, streak, and practice stats." },
      { property: "og:title", content: "Member profile — HobbyPulse" },
      { property: "og:description", content: "View a community member's skills, streak, and practice stats." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicProfile,
});

function PublicProfile() {
  const { username } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (profile) getSignedUrl(profile.avatar_url).then(setAvatarUrl);
  }, [profile]);

  const { data: skills = [] } = useQuery({
    queryKey: ["public-skills", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase.from("skills").select("*").eq("user_id", profile!.id);
      return data ?? [];
    },
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["public-sessions", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const { data } = await supabase.from("practice_sessions").select("*").eq("user_id", profile!.id);
      return data ?? [];
    },
  });

  const { data: follow } = useQuery({
    queryKey: ["follow", user?.id, profile?.id],
    enabled: !!user && !!profile && user.id !== profile.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user!.id)
        .eq("following_id", profile!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: counts } = useQuery({
    queryKey: ["follow-counts", profile?.id],
    enabled: !!profile,
    queryFn: async () => {
      const [followers, following] = await Promise.all([
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", profile!.id),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", profile!.id),
      ]);
      return { followers: followers.count ?? 0, following: following.count ?? 0 };
    },
  });

  async function toggleFollow() {
    if (!user || !profile) return;
    if (follow) {
      await supabase.from("follows").delete().eq("id", follow.id);
    } else {
      const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.id });
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    queryClient.invalidateQueries({ queryKey: ["follow", user.id, profile.id] });
    queryClient.invalidateQueries({ queryKey: ["follow-counts", profile.id] });
  }

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!profile) {
    return <p className="py-24 text-center text-muted-foreground">No member found with that username.</p>;
  }

  const streak = computeStreak(sessions);
  const hours = (totalMinutes(sessions) / 60).toFixed(1);

  return (
    <div className="max-w-3xl">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-start gap-5">
            <Avatar className="h-24 w-24">
              {avatarUrl && <AvatarImage src={avatarUrl} />}
              <AvatarFallback className="text-2xl">{profile.display_name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold">{profile.display_name}</h1>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              {profile.bio && <p className="mt-3">{profile.bio}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {(profile.interests ?? []).map((i) => <Badge key={i} variant="secondary">{i}</Badge>)}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {counts?.followers ?? 0} followers · {counts?.following ?? 0} following
              </p>
            </div>
            {user && user.id !== profile.id && (
              <Button variant={follow ? "outline" : "default"} onClick={toggleFollow}>
                {follow ? <><UserMinus className="mr-2 h-4 w-4" /> Unfollow</> : <><UserPlus className="mr-2 h-4 w-4" /> Follow</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Streak</CardTitle>
            <Flame className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><p className="font-display text-3xl font-bold">{streak} days</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total practice</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent><p className="font-display text-3xl font-bold">{hours} hrs</p></CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No public skills yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s.id} variant="secondary" className="px-3 py-1.5 text-sm">
                  {s.name} · {s.current_level.toLowerCase()}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
