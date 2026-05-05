"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import {
  getWorkouts,
  deleteWorkout,
  calcVolume,
  type WorkoutSession,
} from "@/lib/mock/workouts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Plus,
  Clock,
  ChevronRight,
  Flame,
  Trash2,
  BarChart2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ProgramTag({ program }: { program: string }) {
  const colors: Record<string, string> = {
    "Push Day": "text-red-400 bg-red-400/10 border-red-400/20",
    "Pull Day": "text-blue-400 bg-blue-400/10 border-blue-400/20",
    "Leg Day": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    "Upper Body": "text-amber-400 bg-amber-400/10 border-amber-400/20",
    "Lower Body": "text-violet-400 bg-violet-400/10 border-violet-400/20",
    "Full Body": "text-orange-400 bg-orange-400/10 border-orange-400/20",
    Cardio: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    Core: "text-pink-400 bg-pink-400/10 border-pink-400/20",
  };
  const cls =
    colors[program] ?? "text-muted-foreground bg-muted/40 border-border/40";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        cls,
      )}
    >
      {program}
    </span>
  );
}

export default function WorkoutsPage() {
  const { currentUser } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);

  const load = useCallback(() => {
    if (!currentUser) return;
    setWorkouts(getWorkouts(currentUser.id));
  }, [currentUser]);

  useEffect(() => {
    load();
  }, [load]);

  const latest = workouts[0];

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteWorkout(id);
    load();
  };

  if (!currentUser) return null;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Log Workout</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Catat setiap sesi latihan kamu dan pantau perkembangan kekuatan
          </p>
        </div>
        <Button asChild className="gap-2 shrink-0">
          <Link href="/workouts/new">
            <Plus className="h-4 w-4" />
            Workout Baru
          </Link>
        </Button>
      </div>

      {workouts.length === 0 ? (
        /* Empty state */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-24 text-center gap-5">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Dumbbell className="h-9 w-9 text-primary/60" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                <Plus className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-lg font-bold">Belum ada workout tercatat</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Catat sesi pertama kamu sekarang. Setiap rep dihitung.
              </p>
            </div>
            <Button asChild className="gap-2 mt-1">
              <Link href="/workouts/new">
                <Plus className="h-4 w-4" />
                Mulai Workout
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* A. Latest workout highlight */}
          <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 via-transparent to-transparent">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Workout Terakhir
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 min-w-0">
                  <ProgramTag program={latest.program} />
                  <p className="text-xs text-muted-foreground">
                    {fmtDate(latest.date)}
                  </p>
                  {latest.notes && (
                    <p className="text-sm text-muted-foreground/80 italic truncate max-w-xs">
                      {latest.notes}
                    </p>
                  )}
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 h-8"
                >
                  <Link href={`/workouts/${latest.id}`}>
                    Detail <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-5 pt-1 border-t border-border/60">
                <div className="flex items-center gap-1.5 text-sm">
                  <Dumbbell className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-semibold">
                    {latest.exercises.length}
                  </span>
                  <span className="text-muted-foreground">exercise</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-semibold">{latest.duration}</span>
                  <span className="text-muted-foreground">menit</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-semibold">
                    {calcVolume(latest.exercises).toLocaleString("id-ID")}
                  </span>
                  <span className="text-muted-foreground">kg volume</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* B. History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Riwayat Workout</h2>
              <span className="text-xs text-muted-foreground">
                {workouts.length} sesi
              </span>
            </div>

            <div className="space-y-2">
              {workouts.map((w, idx) => (
                <Link key={w.id} href={`/workouts/${w.id}`}>
                  <Card
                    className={cn(
                      "group transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-black/5 cursor-pointer",
                      idx === 0 && "border-primary/20",
                    )}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      {/* Icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <Dumbbell className="h-4.5 w-4.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ProgramTag program={w.program} />
                          {idx === 0 && (
                            <Badge className="text-[9px] h-4 px-1.5 bg-primary/15 text-primary border-primary/30">
                              Terbaru
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{fmtDate(w.date)}</span>
                          <span>·</span>
                          <span>{w.exercises.length} exercise</span>
                          <span>·</span>
                          <span>{w.duration} mnt</span>
                        </div>
                      </div>

                      {/* Volume + actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          {calcVolume(w.exercises).toLocaleString("id-ID")} kg
                        </div>
                        <button
                          type="button"
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-400/10 hover:text-red-400 text-muted-foreground"
                          onClick={(e) => handleDelete(w.id, e)}
                          aria-label="Hapus workout"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
