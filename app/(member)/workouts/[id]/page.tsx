"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Dumbbell,
  Zap,
  Trophy,
  Trash2,
  FileText,
} from "lucide-react";
import {
  getWorkoutById,
  deleteWorkout,
  calcVolume,
  type WorkoutSession,
} from "@/lib/mock/workouts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
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
        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold",
        cls,
      )}
    >
      {program}
    </span>
  );
}

export default function WorkoutDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const w = getWorkoutById(params.id);
    setWorkout(w);
    setLoaded(true);
  }, [params.id]);

  if (!loaded) return null;

  if (!workout) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href="/workouts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-muted-foreground">Workout tidak ditemukan.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/workouts">Kembali ke daftar</Link>
        </Button>
      </div>
    );
  }

  const totalVolume = calcVolume(workout.exercises);
  const maxWeightExercise = workout.exercises.reduce(
    (max, e) => (e.weight > (max?.weight ?? -1) ? e : max),
    workout.exercises[0],
  );

  const handleDelete = () => {
    deleteWorkout(workout.id);
    toast.success("Workout dihapus");
    router.push("/workouts");
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 mt-0.5"
          >
            <Link href="/workouts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="space-y-2">
            <ProgramTag program={workout.program} />
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {fmtDate(workout.date)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-8 text-muted-foreground hover:text-red-400 hover:bg-red-400/5 shrink-0"
          onClick={handleDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Hapus
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <Dumbbell className="h-4 w-4 text-muted-foreground/50 mx-auto" />
            <p className="text-2xl font-bold">{workout.exercises.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Exercise
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <Clock className="h-4 w-4 text-muted-foreground/50 mx-auto" />
            <p className="text-2xl font-bold">{workout.duration}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Menit
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <Zap className="h-4 w-4 text-amber-400/60 mx-auto" />
            <p className="text-2xl font-bold">
              {totalVolume >= 1000
                ? `${(totalVolume / 1000).toFixed(1)}t`
                : totalVolume.toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Volume (kg)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Highlight: heaviest exercise */}
      {maxWeightExercise && maxWeightExercise.weight > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
              <Trophy className="h-4 w-4 text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Berat Tertinggi
              </p>
              <p className="text-sm font-semibold truncate mt-0.5">
                {maxWeightExercise.name}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-amber-400">
                {maxWeightExercise.weight}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  kg
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {maxWeightExercise.sets}×{maxWeightExercise.reps}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {workout.notes && (
        <Card>
          <CardContent className="p-4 flex gap-3">
            <FileText className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground italic">
              {workout.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Exercise list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Exercise Log</h2>
        <div className="space-y-2">
          {workout.exercises.map((ex, i) => {
            const vol = ex.sets * ex.reps * ex.weight;
            const isHeaviest = ex === maxWeightExercise;
            return (
              <Card
                key={i}
                className={cn(
                  "overflow-hidden transition-colors",
                  isHeaviest && "border-amber-500/20",
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {ex.name}
                        </p>
                        {ex.notes && (
                          <p className="text-xs text-muted-foreground truncate">
                            {ex.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    {isHeaviest && (
                      <Badge className="text-[9px] h-4 px-1.5 bg-amber-500/15 text-amber-400 border-amber-500/30 shrink-0">
                        Terberat
                      </Badge>
                    )}
                  </div>

                  {/* Sets / Reps / Weight chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 rounded-lg bg-muted/60 px-3 py-1.5">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">
                        Sets
                      </span>
                      <span className="text-sm font-bold ml-1">{ex.sets}</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-muted/60 px-3 py-1.5">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">
                        Reps
                      </span>
                      <span className="text-sm font-bold ml-1">{ex.reps}</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-muted/60 px-3 py-1.5">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase">
                        Berat
                      </span>
                      <span className="text-sm font-bold ml-1">
                        {ex.weight}
                        <span className="text-xs font-normal text-muted-foreground">
                          {" "}
                          kg
                        </span>
                      </span>
                    </div>
                    {vol > 0 && (
                      <div className="flex items-center gap-1 rounded-lg border border-border/40 px-3 py-1.5 ml-auto">
                        <Zap className="h-2.5 w-2.5 text-muted-foreground/50" />
                        <span className="text-[10px] text-muted-foreground">
                          {vol.toLocaleString("id-ID")} kg
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
