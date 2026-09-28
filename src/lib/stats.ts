import type { Tables } from "@/integrations/supabase/types";

export type PracticeSession = Tables<"practice_sessions">;

/** Current streak: consecutive days ending today or yesterday with at least one session. */
export function computeStreak(sessions: PracticeSession[]): number {
  const days = new Set(sessions.map((s) => s.practiced_at));
  if (days.size === 0) return 0;
  const today = new Date();
  const toKey = (d: Date) => d.toISOString().slice(0, 10);
  let cursor = new Date(today);
  // Streak can start today or yesterday
  if (!days.has(toKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(toKey(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(toKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function totalMinutes(sessions: PracticeSession[]): number {
  return sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
}

export function minutesSince(sessions: PracticeSession[], daysAgo: number): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysAgo);
  const key = cutoff.toISOString().slice(0, 10);
  return sessions
    .filter((s) => s.practiced_at >= key)
    .reduce((sum, s) => sum + s.duration_minutes, 0);
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  earned: boolean;
}

export function computeBadges(
  sessions: PracticeSession[],
  streak: number,
  goalsCompleted: number
): Badge[] {
  const hours = totalMinutes(sessions) / 60;
  return [
    { id: "first", label: "First Steps", description: "Log your first practice session", earned: sessions.length > 0 },
    { id: "streak3", label: "Warming Up", description: "Reach a 3-day streak", earned: streak >= 3 },
    { id: "streak7", label: "On Fire", description: "Reach a 7-day streak", earned: streak >= 7 },
    { id: "streak30", label: "Unstoppable", description: "Reach a 30-day streak", earned: streak >= 30 },
    { id: "h10", label: "10 Hours", description: "Practice for 10 total hours", earned: hours >= 10 },
    { id: "h50", label: "50 Hours", description: "Practice for 50 total hours", earned: hours >= 50 },
    { id: "h100", label: "Century", description: "Practice for 100 total hours", earned: hours >= 100 },
    { id: "goal1", label: "Goal Getter", description: "Complete your first goal", earned: goalsCompleted >= 1 },
  ];
}

export const CATEGORIES = [
  "Music",
  "Coding",
  "Art",
  "Fitness",
  "Cooking",
  "Photography",
  "Language",
  "Writing",
  "Gaming",
  "Other",
] as const;

export const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
