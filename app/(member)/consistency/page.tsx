"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useApp } from "@/contexts/app-context";
import { getWorkouts } from "@/lib/mock/workouts";
import {
  getTotalAttendance,
  getCurrentStreak,
  getLongestStreak,
  getMonthlyWorkouts,
  getFavoriteHour,
  getHeatmapData,
  getWeeklyData,
  toDateStr,
  todayStr,
} from "@/lib/mock/consistency";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  CalendarDays,
  BarChart2,
  Clock,
  Trophy,
  Zap,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Streak milestone definitions ─────────────────────────────────────────────

const MILESTONES = [
  { days: 3, label: "Warming Up", icon: "🔥", color: "text-amber-400" },
  { days: 7, label: "7 Day Streak", icon: "⚡", color: "text-yellow-400" },
  { days: 14, label: "2 Week Warrior", icon: "💪", color: "text-orange-400" },
  { days: 30, label: "Consistency King", icon: "👑", color: "text-primary" },
];

function getNextMilestone(streak: number) {
  return MILESTONES.find((m) => m.days > streak) ?? null;
}

function getEarnedMilestones(streak: number) {
  return MILESTONES.filter((m) => m.days <= streak);
}

// ─── Motivational copy ────────────────────────────────────────────────────────

function getMotivation(
  streak: number,
  trainedToday: boolean,
): { text: string; sub: string } {
  if (!trainedToday && streak === 0) {
    return {
      text: "Yuk mulai hari ini! 💪",
      sub: "Setiap perjalanan dimulai dari langkah pertama.",
    };
  }
  if (!trainedToday && streak > 0) {
    return {
      text: `Jaga streak ${streak} hari kamu! 🔥`,
      sub: "Kamu belum latihan hari ini — streak terancam!",
    };
  }
  if (streak >= 30) {
    return {
      text: "Kamu adalah MESIN! 👑",
      sub: `${streak} hari berturut-turut. Tidak ada yang bisa menghentikanmu.`,
    };
  }
  if (streak >= 14) {
    return {
      text: "Kamu sedang on fire! 🔥",
      sub: `${streak} hari streak. Konsistensimu luar biasa.`,
    };
  }
  if (streak >= 7) {
    return {
      text: "Luar biasa! Satu minggu penuh! ⚡",
      sub: "Kamu membuktikan komitmenmu. Terus jaga ini.",
    };
  }
  return {
    text: "Tetap semangat! 💪",
    sub: `${streak} hari berturut-turut. Kamu sedang membangun kebiasaan.`,
  };
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────

function HeatmapGrid({ data }: { data: { date: string; count: number }[] }) {
  const today = todayStr();

  // Group into 13 columns (weeks), 7 rows (days Mon–Sun)
  // Pad so the first entry falls on its weekday
  const firstDate = data[0]?.date;
  const firstDow = firstDate
    ? (new Date(firstDate + "T00:00:00").getDay() + 6) % 7 // Mon=0
    : 0;

  const padded = [...Array.from({ length: firstDow }, () => null), ...data];

  // Split into columns of 7
  const cols: ((typeof data)[number] | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    cols.push(padded.slice(i, i + 7));
  }

  function cellColor(count: number): string {
    if (count === 0) return "bg-muted/40 border-border/20";
    if (count === 1) return "bg-emerald-800/60 border-emerald-700/30";
    if (count === 2) return "bg-emerald-600/70 border-emerald-500/40";
    return "bg-emerald-400/80 border-emerald-300/50";
  }

  const DOW_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-0.5 mr-0.5 shrink-0">
          {DOW_LABELS.map((d) => (
            <div
              key={d}
              className="h-3.5 w-6 flex items-center text-[9px] text-muted-foreground/40 font-medium"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Heatmap columns */}
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-0.5 shrink-0">
            {Array.from({ length: 7 }, (_, ri) => {
              const cell = col[ri] ?? null;
              if (!cell) {
                return <div key={ri} className="h-3.5 w-3.5 rounded-sm" />;
              }
              const isToday = cell.date === today;
              return (
                <div
                  key={ri}
                  title={`${cell.date}: ${cell.count} aktivitas`}
                  className={cn(
                    "h-3.5 w-3.5 rounded-sm border transition-all duration-150 hover:scale-125 hover:z-10",
                    cellColor(cell.count),
                    isToday &&
                      "ring-1 ring-primary ring-offset-1 ring-offset-background",
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Kurang aktif</span>
        <div className="flex items-center gap-0.5">
          {[0, 1, 2, 3].map((n) => (
            <div
              key={n}
              className={cn("h-3 w-3 rounded-sm border", cellColor(n))}
            />
          ))}
        </div>
        <span>Sangat aktif</span>
      </div>
    </div>
  );
}

// ─── Weekly bar chart ─────────────────────────────────────────────────────────

function WeeklyBars({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const lastIdx = data.length - 1;

  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => {
        const pct = (d.count / max) * 100;
        const isLast = i === lastIdx;
        return (
          <div
            key={d.label}
            className="flex-1 flex flex-col items-center gap-1 min-w-0"
          >
            <span className="text-[9px] text-muted-foreground/60 font-medium">
              {d.count > 0 ? d.count : ""}
            </span>
            <div className="w-full flex items-end" style={{ height: "64px" }}>
              <div
                className={cn(
                  "w-full rounded-t-md transition-all duration-300",
                  d.count === 0
                    ? "bg-muted/30"
                    : isLast
                      ? "bg-emerald-400"
                      : "bg-emerald-800/60",
                )}
                style={{ height: `${Math.max(pct, d.count > 0 ? 8 : 2)}%` }}
              />
            </div>
            <span
              className={cn(
                "text-[9px] truncate w-full text-center",
                isLast
                  ? "text-emerald-400 font-semibold"
                  : "text-muted-foreground/50",
              )}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  large,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  large?: boolean;
}) {
  return (
    <Card className={cn(large && "sm:col-span-2 lg:col-span-1")}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <Icon className={cn("h-4 w-4", accent, "opacity-50")} />
        </div>
        <p className={cn("text-3xl font-bold tracking-tight", accent)}>
          {value}
        </p>
        {sub && (
          <p className="text-xs text-muted-foreground leading-tight">{sub}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ConsistencyPage() {
  const { currentUser } = useAuth();
  const { getUserCheckIns } = useApp();

  const checkIns = useMemo(
    () => (currentUser ? getUserCheckIns(currentUser.id) : []),
    [currentUser, getUserCheckIns],
  );

  const workouts = useMemo(
    () => (currentUser ? getWorkouts(currentUser.id) : []),
    [currentUser],
  );

  const streak = useMemo(
    () => getCurrentStreak(checkIns, workouts),
    [checkIns, workouts],
  );
  const longestStreak = useMemo(
    () => getLongestStreak(checkIns, workouts),
    [checkIns, workouts],
  );
  const totalDays = useMemo(
    () => getTotalAttendance(checkIns, workouts),
    [checkIns, workouts],
  );
  const monthlyWorkouts = useMemo(
    () => getMonthlyWorkouts(workouts),
    [workouts],
  );
  const favoriteHour = useMemo(() => getFavoriteHour(checkIns), [checkIns]);
  const heatmap = useMemo(
    () => getHeatmapData(checkIns, workouts, 91),
    [checkIns, workouts],
  );
  const weekly = useMemo(
    () => getWeeklyData(checkIns, workouts, 8),
    [checkIns, workouts],
  );

  const trainedToday = useMemo(() => {
    const today = todayStr();
    return (
      checkIns.some((c) => toDateStr(c.checkedInAt) === today) ||
      workouts.some((w) => w.date.slice(0, 10) === today)
    );
  }, [checkIns, workouts]);

  const motivation = getMotivation(streak, trainedToday);
  const earnedBadges = getEarnedMilestones(streak);
  const nextMilestone = getNextMilestone(streak);

  if (!currentUser) return null;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl">
      {/* ── Header ────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Konsistensi</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Pantau kebiasaan latihan dan jaga momentum kamu
        </p>
      </div>

      {/* ── Motivation Banner ─────────────────────────────────── */}
      <Card
        className={cn(
          "border overflow-hidden",
          streak >= 7
            ? "border-amber-500/30 bg-linear-to-br from-amber-500/8 via-transparent to-transparent"
            : trainedToday
              ? "border-emerald-500/30 bg-linear-to-br from-emerald-500/8 via-transparent to-transparent"
              : "border-primary/20 bg-linear-to-br from-primary/5 via-transparent to-transparent",
        )}
      >
        <CardContent className="p-5 flex items-center gap-5">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl",
              streak >= 7 ? "bg-amber-500/15" : "bg-primary/10",
            )}
          >
            {streak >= 30
              ? "👑"
              : streak >= 14
                ? "🔥"
                : streak >= 7
                  ? "⚡"
                  : streak > 0
                    ? "💪"
                    : "🏋️"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base">{motivation.text}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {motivation.sub}
            </p>
          </div>
          {!trainedToday && (
            <Button asChild size="sm" className="shrink-0 gap-1.5">
              <Link href="/workouts/new">
                Latihan Sekarang
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ── A. Summary Cards ──────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Streak */}
        <Card className={cn(streak >= 7 && "border-amber-500/20")}>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Streak
              </p>
              <Flame
                className={cn(
                  "h-4 w-4 opacity-60",
                  streak >= 7 ? "text-amber-400" : "text-primary",
                )}
              />
            </div>
            <div>
              <p
                className={cn(
                  "text-3xl font-bold tracking-tight",
                  streak >= 7 ? "text-amber-400" : "text-primary",
                )}
              >
                {streak}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  hari
                </span>
              </p>
              {streak > 0 && longestStreak > streak && (
                <p className="text-xs text-muted-foreground mt-1">
                  Terpanjang: {longestStreak} hari
                </p>
              )}
              {streak > 0 && streak === longestStreak && (
                <p className="text-xs text-emerald-400 mt-1 font-medium">
                  ✓ Rekor pribadi!
                </p>
              )}
            </div>
            {/* Streak progress to next milestone */}
            {nextMilestone && streak > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Menuju {nextMilestone.days} hari</span>
                  <span>
                    {streak}/{nextMilestone.days}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      streak >= 14 ? "bg-amber-400" : "bg-primary",
                    )}
                    style={{
                      width: `${Math.min((streak / nextMilestone.days) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <StatCard
          icon={CalendarDays}
          label="Total Hadir"
          value={totalDays}
          sub="Hari aktif keseluruhan"
          accent="text-blue-400"
        />

        <StatCard
          icon={BarChart2}
          label="Workout Bulan Ini"
          value={monthlyWorkouts}
          sub={new Date().toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          })}
          accent="text-emerald-400"
        />

        <StatCard
          icon={Clock}
          label="Jam Favorit"
          value={favoriteHour ?? "—"}
          sub={favoriteHour ? "Waktu latihan terbanyak" : "Belum ada data"}
          accent="text-violet-400"
        />
      </div>

      {/* ── Badges ────────────────────────────────────────────── */}
      {(earnedBadges.length > 0 || nextMilestone) && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Pencapaian</h2>
          <div className="flex flex-wrap gap-2">
            {MILESTONES.map((m) => {
              const earned = streak >= m.days;
              return (
                <div
                  key={m.days}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 transition-all",
                    earned
                      ? "border-amber-500/30 bg-amber-500/10"
                      : "border-border/40 bg-muted/20 opacity-40",
                  )}
                >
                  <span className={earned ? "grayscale-0" : "grayscale"}>
                    {m.icon}
                  </span>
                  <div>
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        earned ? m.color : "text-muted-foreground",
                      )}
                    >
                      {m.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {m.days} hari
                    </p>
                  </div>
                  {earned && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── B. Activity Heatmap ───────────────────────────────── */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">
                Aktivitas 13 Minggu Terakhir
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Check-in + workout yang tercatat
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-semibold text-emerald-400">
                {totalDays}
              </span>
              <span>hari aktif</span>
            </div>
          </div>
          <HeatmapGrid data={heatmap} />
        </CardContent>
      </Card>

      {/* ── C. Weekly Summary ─────────────────────────────────── */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Aktivitas per Minggu</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                8 minggu terakhir
              </p>
            </div>
            {weekly.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Rata-rata{" "}
                <span className="font-semibold text-foreground">
                  {(
                    weekly.reduce((s, w) => s + w.count, 0) / weekly.length
                  ).toFixed(1)}
                </span>{" "}
                / minggu
              </div>
            )}
          </div>
          <WeeklyBars data={weekly} />
        </CardContent>
      </Card>

      {/* ── Longest streak callout (if meaningful) ───────────── */}
      {longestStreak >= 3 && (
        <Card className="border-violet-500/20 bg-linear-to-r from-violet-500/5 to-transparent">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15">
              <Trophy className="h-5 w-5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                Rekor Terpanjang
              </p>
              <p className="text-sm font-bold mt-0.5">
                {longestStreak} hari berturut-turut
              </p>
            </div>
            {streak < longestStreak && (
              <Badge
                variant="outline"
                className="text-xs text-violet-400 border-violet-500/30 shrink-0"
              >
                {longestStreak - streak} hari lagi untuk menyamai
              </Badge>
            )}
            {streak >= longestStreak && streak > 0 && (
              <Badge className="text-xs bg-violet-500/15 text-violet-400 border-violet-500/30 shrink-0">
                Rekor aktif!
              </Badge>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
