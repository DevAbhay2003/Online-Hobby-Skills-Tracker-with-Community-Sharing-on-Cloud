import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Trash2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getSignedUrl } from "@/lib/upload";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";

export type FeedPost = Tables<"posts"> & {
  profiles: Pick<Tables<"profiles">, "username" | "display_name" | "avatar_url"> | null;
  skills: Pick<Tables<"skills">, "name" | "category"> | null;
  likes: Pick<Tables<"likes">, "user_id">[];
  comments: (Pick<Tables<"comments">, "id" | "content" | "created_at" | "user_id"> & {
    profiles: Pick<Tables<"profiles">, "username" | "display_name"> | null;
  })[];
};

export function PostCard({ post, currentUserId }: { post: FeedPost; currentUserId: string | undefined }) {
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    getSignedUrl(post.profiles?.avatar_url).then(setAvatarUrl);
    getSignedUrl(post.media_url).then(setMediaUrl);
  }, [post.profiles?.avatar_url, post.media_url]);

  const liked = !!currentUserId && post.likes.some((l) => l.user_id === currentUserId);

  async function toggleLike() {
    if (!currentUserId) {
      toast.error("Sign in to like posts");
      return;
    }
    if (liked) {
      await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUserId);
    } else {
      await supabase.from("likes").insert({ post_id: post.id, user_id: currentUserId });
    }
    queryClient.invalidateQueries({ queryKey: ["feed"] });
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId) {
      toast.error("Sign in to comment");
      return;
    }
    if (!commentText.trim()) return;
    const { error } = await supabase.from("comments").insert({
      post_id: post.id,
      user_id: currentUserId,
      content: commentText.trim(),
    });
    if (error) toast.error(error.message);
    else {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    }
  }

  async function deletePost() {
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) toast.error(error.message);
    else queryClient.invalidateQueries({ queryKey: ["feed"] });
  }

  async function deleteComment(id: string) {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) toast.error(error.message);
    else queryClient.invalidateQueries({ queryKey: ["feed"] });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              {avatarUrl && <AvatarImage src={avatarUrl} />}
              <AvatarFallback>{post.profiles?.display_name?.slice(0, 2).toUpperCase() ?? "??"}</AvatarFallback>
            </Avatar>
            <div>
              <Link to="/u/$username" params={{ username: post.profiles?.username ?? "" }} className="font-semibold hover:text-primary">
                {post.profiles?.display_name ?? "Unknown"}
              </Link>
              <p className="text-xs text-muted-foreground">
                @{post.profiles?.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.skills && <Badge variant="secondary">{post.skills.name}</Badge>}
            {currentUserId === post.user_id && (
              <Button size="icon" variant="ghost" onClick={deletePost}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap">{post.content}</p>

        {mediaUrl && (
          <img src={mediaUrl} alt="Post attachment" className="mt-4 max-h-96 w-full rounded-xl object-cover" />
        )}

        <div className="mt-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={toggleLike} className={liked ? "text-primary" : "text-muted-foreground"}>
            <Heart className={`mr-1.5 h-4 w-4 ${liked ? "fill-current" : ""}`} />
            {post.likes.length}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="text-muted-foreground">
            <MessageCircle className="mr-1.5 h-4 w-4" />
            {post.comments.length}
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-3 border-t pt-4">
            {post.comments.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-2">
                <p className="text-sm">
                  <span className="font-semibold">{c.profiles?.display_name ?? "Unknown"}</span>{" "}
                  <span className="text-muted-foreground">{c.content}</span>
                </p>
                {currentUserId === c.user_id && (
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => deleteComment(c.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            {currentUserId && (
              <form onSubmit={addComment} className="flex gap-2">
                <Input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment…" />
                <Button type="submit" size="icon" variant="secondary"><Send className="h-4 w-4" /></Button>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
