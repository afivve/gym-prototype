"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  Dumbbell,
  Clock,
  Zap,
  GripVertical,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { addWorkout, calcVolume, PROGRAM_TEMPLATES } from "@/lib/mock/workouts";
import { workoutSchema, type WorkoutInput } from "@/lib/validations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateId, cn } from "@/lib/utils";

const EXERCISE_SUGGESTIONS = [
  "Bench Press",
  "Incline Bench Press",
  "Push Up",
  "Cable Fly",
  "Overhead Press",
  "Lateral Raise",
  "Deadlift",
  "Barbell Row",
  "Pull Up",
  "Lat Pulldown",
  "Seated Row",
  "Bicep Curl",
  "Hammer Curl",
  "Tricep Pushdown",
  "Skull Crusher",
  "Squat",
  "Leg Press",
  "Romanian Deadlift",
  "Leg Extension",
  "Leg Curl",
  "Calf Raise",
  "Hip Thrust",
  "Plank",
  "Crunch",
  "Russian Twist",
  "Treadmill",
  "Jump Rope",
  "Rowing Machine",
];

// ─── Exercise Card ─────────────────────────────────────────────────────────────

function ExerciseCard({
  index,
  control,
  register,
  errors,
  onRemove,
  canRemove,
}: {
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [nameFocus, setNameFocus] = useState(false);
  const nameValue = control._formValues?.exercises?.[index]?.name ?? "";
  const suggestions = EXERCISE_SUGGESTIONS.filter(
    (s) =>
      nameValue.length > 0 &&
      s.toLowerCase().includes(nameValue.toLowerCase()) &&
      s.toLowerCase() !== nameValue.toLowerCase(),
  ).slice(0, 4);

  return (
    <Card
      className={cn(
        "overflow-hidden border transition-all duration-200",
        errors?.exercises?.[index]
          ? "border-red-500/30"
          : "border-border/60 hover:border-border",
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Card header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground/30" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Exercise {index + 1}
            </span>
          </div>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/40 hover:bg-red-400/10 hover:text-red-400 transition-colors"
              aria-label="Hapus exercise"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Exercise name with suggestions */}
        <div className="relative">
          <Input
            {...register(`exercises.${index}.name`)}
            placeholder="Bench Press"
            className={cn(
              "h-10 font-medium",
              errors?.exercises?.[index]?.name && "border-red-500/50",
            )}
            autoComplete="off"
            onFocus={() => setNameFocus(true)}
            onBlur={() => setTimeout(() => setNameFocus(false), 150)}
          />
          {errors?.exercises?.[index]?.name && (
            <p className="text-xs text-red-400 mt-1">
              {errors.exercises[index].name.message}
            </p>
          )}
          {/* Autocomplete dropdown */}
          {nameFocus && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg border border-border bg-card shadow-xl shadow-black/20 overflow-hidden">
              {suggestions.map((s) => (
                <Controller
                  key={s}
                  control={control}
                  name={`exercises.${index}.name`}
                  render={({ field }) => (
                    <button
                      type="button"
                      className="w-full px-3 py-2.5 text-left text-sm hover:bg-accent/50 transition-colors"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        field.onChange(s);
                        setNameFocus(false);
                      }}
                    >
                      {s}
                    </button>
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sets / Reps / Weight row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Sets
            </label>
            <Input
              {...register(`exercises.${index}.sets`, { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="3"
              className={cn(
                "h-9 text-center font-semibold text-sm",
                errors?.exercises?.[index]?.sets && "border-red-500/50",
              )}
            />
            {errors?.exercises?.[index]?.sets && (
              <p className="text-[10px] text-red-400">
                {errors.exercises[index].sets.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Reps
            </label>
            <Input
              {...register(`exercises.${index}.reps`, { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="10"
              className={cn(
                "h-9 text-center font-semibold text-sm",
                errors?.exercises?.[index]?.reps && "border-red-500/50",
              )}
            />
            {errors?.exercises?.[index]?.reps && (
              <p className="text-[10px] text-red-400">
                {errors.exercises[index].reps.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Berat (kg)
            </label>
            <Input
              {...register(`exercises.${index}.weight`, {
                valueAsNumber: true,
              })}
              type="number"
              min={0}
              step={0.5}
              placeholder="60"
              className={cn(
                "h-9 text-center font-semibold text-sm",
                errors?.exercises?.[index]?.weight && "border-red-500/50",
              )}
            />
            {errors?.exercises?.[index]?.weight && (
              <p className="text-[10px] text-red-400">
                {errors.exercises[index].weight.message}
              </p>
            )}
          </div>
        </div>

        {/* Volume inline hint */}
        <Controller
          control={control}
          name={`exercises.${index}`}
          render={({ field }) => {
            const e = field.value;
            if (
              !e?.sets ||
              !e?.reps ||
              !e?.weight ||
              isNaN(e.sets * e.reps * e.weight)
            )
              return <></>;
            const vol = e.sets * e.reps * e.weight;
            if (!vol) return <></>;
            return (
              <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                <Zap className="h-2.5 w-2.5" />
                Volume: {vol.toLocaleString("id-ID")} kg
              </p>
            );
          }}
        />
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function NewWorkoutPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [programOpen, setProgramOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkoutInput>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      program: "",
      duration: undefined,
      notes: "",
      exercises: [
        {
          name: "",
          sets: undefined,
          reps: undefined,
          weight: undefined,
          notes: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises",
  });

  const watchedExercises = watch("exercises");
  const liveVolume = watchedExercises.reduce((sum, e) => {
    const v = (e.sets ?? 0) * (e.reps ?? 0) * (e.weight ?? 0);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  const onSubmit = (data: WorkoutInput) => {
    if (!currentUser) return;
    addWorkout({
      id: generateId("wkt"),
      userId: currentUser.id,
      date: data.date,
      program: data.program,
      duration: data.duration ?? 0,
      notes: data.notes,
      exercises: data.exercises,
    });
    toast.success("Workout berhasil disimpan!");
    router.push("/workouts");
  };

  if (!currentUser) return null;

  const selectedProgram = watch("program");

  return (
    <div className="p-6 lg:p-8 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
        >
          <Link href="/workouts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workout Baru</h1>
          <p className="text-sm text-muted-foreground">
            Catat sesi latihan kamu hari ini
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Session Info Card */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Info Sesi
            </p>

            {/* Program selector */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Program <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Input
                  {...register("program")}
                  placeholder="Push Day, Pull Day, Leg Day..."
                  className={cn(
                    "h-10 pr-9",
                    errors.program && "border-red-500/50",
                  )}
                  onFocus={() => setProgramOpen(true)}
                  onBlur={() => setTimeout(() => setProgramOpen(false), 150)}
                  autoComplete="off"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                {programOpen && (
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg border border-border bg-card shadow-xl shadow-black/20 overflow-hidden">
                    <div className="grid grid-cols-2 gap-px p-1">
                      {PROGRAM_TEMPLATES.filter(
                        (t) =>
                          !selectedProgram ||
                          t
                            .toLowerCase()
                            .includes(selectedProgram.toLowerCase()),
                      ).map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={cn(
                            "px-3 py-2 text-left text-sm rounded-md hover:bg-accent/50 transition-colors",
                            selectedProgram === t &&
                              "bg-primary/10 text-primary font-medium",
                          )}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setValue("program", t, { shouldValidate: true });
                            setProgramOpen(false);
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {errors.program && (
                <p className="text-xs text-red-400">{errors.program.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Tanggal
                </label>
                <Input {...register("date")} type="date" className="h-10" />
                {errors.date && (
                  <p className="text-xs text-red-400">{errors.date.message}</p>
                )}
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Durasi
                </label>
                <div className="relative">
                  <Input
                    {...register("duration", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    placeholder="60"
                    className="h-10 pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> mnt
                  </span>
                </div>
                {errors.duration && (
                  <p className="text-xs text-red-400">
                    {errors.duration.message}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-foreground">
                  Catatan
                </label>
                <span className="text-xs text-muted-foreground">Opsional</span>
              </div>
              <textarea
                {...register("notes")}
                rows={2}
                placeholder='Contoh: "Fokus koneksi otot, hindari momentum"'
                className={cn(
                  "w-full rounded-md border border-border bg-secondary/50 px-3 py-2.5 text-sm",
                  "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring resize-none",
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Exercise List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Exercise</h2>
              {errors.exercises?.root && (
                <p className="text-xs text-red-400 mt-0.5">
                  {errors.exercises.root.message}
                </p>
              )}
              {typeof errors.exercises?.message === "string" && (
                <p className="text-xs text-red-400 mt-0.5">
                  {errors.exercises.message}
                </p>
              )}
            </div>
            {liveVolume > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Dumbbell className="h-3 w-3" />
                Total:{" "}
                <span className="font-semibold text-foreground">
                  {liveVolume.toLocaleString("id-ID")} kg
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            {fields.map((field, index) => (
              <ExerciseCard
                key={field.id}
                index={index}
                control={control}
                register={register}
                errors={errors}
                onRemove={() => remove(index)}
                canRemove={fields.length > 1}
              />
            ))}
          </div>

          <button
            type="button"
            className={cn(
              "w-full flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-border/60",
              "text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5",
              "transition-all duration-200",
            )}
            onClick={() =>
              append({
                name: "",
                sets: undefined as unknown as number,
                reps: undefined as unknown as number,
                weight: undefined as unknown as number,
                notes: "",
              })
            }
          >
            <Plus className="h-4 w-4" />
            Tambah Exercise
          </button>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/workouts")}
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="flex-1 gap-2"
            disabled={isSubmitting}
          >
            <Dumbbell className="h-4 w-4" />
            {isSubmitting ? "Menyimpan..." : "Simpan Workout"}
          </Button>
        </div>
      </form>
    </div>
  );
}
