import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { uploadFile, getSignedUrl } from "@/lib/upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — HobbyPulse" },
      { name: "description", content: "Edit your display name, bio, interests, and profile picture." },
      { property: "og:title", content: "My Profile — HobbyPulse" },
      { property: "og:description", content: "Edit your display name, bio, interests, and profile picture." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio ?? "");
      setInterests((profile.interests ?? []).join(", "));
      getSignedUrl(profile.avatar_url).then(setAvatarUrl);
    }
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        bio: bio.trim(),
        interests: interests.split(",").map((i) => i.trim()).filter(Boolean),
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile saved");
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    }
  }

  async function changeAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || !user) return;
    setBusy(true);
    try {
      const path = await uploadFile(user.id, f, "profile");
      const { error } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
      if (error) throw error;
      setAvatarUrl(await getSignedUrl(path));
      toast.success("Profile picture updated");
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold">My Profile</h1>
      <p className="mt-1 text-muted-foreground">How the community sees you.</p>

      <Card className="mt-6">
        <CardHeader><CardTitle>Profile details</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {avatarUrl && <AvatarImage src={avatarUrl} />}
              <AvatarFallback className="text-xl">{displayName.slice(0, 2).toUpperCase() || "??"}</AvatarFallback>
            </Avatar>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent">
              <Upload className="h-4 w-4" /> Change picture
              <input type="file" accept="image/*" className="hidden" onChange={changeAvatar} />
            </label>
          </div>

          <form onSubmit={save} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={profile?.username ?? ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Display name</Label>
              <Input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people what you're into." />
            </div>
            <div className="space-y-2">
              <Label>Interests (comma-separated)</Label>
              <Input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="guitar, photography, chess" />
            </div>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
