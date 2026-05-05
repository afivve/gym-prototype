"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Flame,
  Dumbbell,
  Activity,
  Zap,
  Heart,
  Camera,
  User,
  Ruler,
  Weight,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getProfile, saveProfile } from "@/lib/mock/profile";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Goal options ─────────────────────────────────────────────────────────────
const GOALS = [
  {
    value: "fat_loss",
    label: "Fat Loss",
    desc: "Turunkan lemak tubuh",
    icon: Flame,
    color: "text-red-400",
    active: "border-red-500/60 bg-red-500/10 text-red-400",
  },
  {
    value: "muscle_gain",
    label: "Muscle Gain",
    desc: "Bangun massa otot",
    icon: Dumbbell,
    color: "text-orange-400",
    active: "border-orange-500/60 bg-orange-500/10 text-orange-400",
  },
  {
    value: "maintenance",
    label: "Maintenance",
    desc: "Jaga kondisi tubuh",
    icon: Activity,
    color: "text-blue-400",
    active: "border-blue-500/60 bg-blue-500/10 text-blue-400",
  },
  {
    value: "strength",
    label: "Strength",
    desc: "Tingkatkan kekuatan",
    icon: Zap,
    color: "text-yellow-400",
    active: "border-yellow-500/60 bg-yellow-500/10 text-yellow-400",
  },
  {
    value: "rehab",
    label: "Rehab / Postur",
    desc: "Pemulihan & postur",
    icon: Heart,
    color: "text-pink-400",
    active: "border-pink-500/60 bg-pink-500/10 text-pink-400",
  },
] as const;

// ─── Level options ─────────────────────────────────────────────────────────────
const LEVELS = [
  {
    value: "beginner",
    label: "Pemula",
    desc: "Baru mulai berolahraga",
    dot: "bg-emerald-500",
    active: "border-emerald-500/60 bg-emerald-500/10",
  },
  {
    value: "intermediate",
    label: "Menengah",
    desc: "Aktif 3–5x seminggu",
    dot: "bg-amber-400",
    active: "border-amber-500/60 bg-amber-500/10",
  },
  {
    value: "advanced",
    label: "Mahir",
    desc: "Latihan intensif rutin",
    dot: "bg-red-500",
    active: "border-red-500/60 bg-red-500/10",
  },
] as const;

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name ?? "",
      age: undefined,
      gender: undefined,
      height: undefined,
      weight: undefined,
      goal: undefined,
      level: undefined,
      injuryNotes: "",
      progressPhoto: "",
    },
  });

  const watchedGoal = watch("goal");
  const watchedLevel = watch("level");
  const watchedGender = watch("gender");

  // Load existing profile
  useEffect(() => {
    if (!currentUser) return;
    const existing = getProfile(currentUser.id);
    if (existing) {
      setIsEditMode(true);
      reset({
        name: existing.name,
        age: existing.age,
        gender: existing.gender,
        height: existing.height,
        weight: existing.weight,
        goal: existing.goal,
        level: existing.level,
        injuryNotes: existing.injuryNotes,
        progressPhoto: existing.progressPhoto,
      });
      if (existing.progressPhoto) setPhotoPreview(existing.progressPhoto);
    }
  }, [currentUser, reset]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setValue("progressPhoto", result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: ProfileInput) => {
    if (!currentUser) return;
    saveProfile({
      userId: currentUser.id,
      name: data.name,
      age: data.age,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      goal: data.goal,
      level: data.level,
      injuryNotes: data.injuryNotes ?? "",
      progressPhoto: data.progressPhoto ?? "",
      updatedAt: new Date().toISOString(),
    });
    setIsEditMode(true);
    toast.success("Profil fitness berhasil disimpan!");
  };

  const handleReset = () => {
    if (!currentUser) return;
    reset({
      name: currentUser.name,
      age: undefined,
      gender: undefined,
      height: undefined,
      weight: undefined,
      goal: undefined,
      level: undefined,
      injuryNotes: "",
      progressPhoto: "",
    });
    setPhotoPreview("");
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Fitness</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isEditMode
            ? "Perbarui data dan tujuan fitness kamu"
            : "Lengkapi profil untuk pengalaman yang lebih personal"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Section 1: Informasi Dasar ─────────────────────────── */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Informasi Dasar
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Nama */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Nama Lengkap
                </label>
                <Input
                  {...register("name")}
                  placeholder="Masukkan nama lengkap"
                />
                {errors.name && (
                  <p className="text-xs text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* Umur */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Umur
                </label>
                <div className="relative">
                  <Input
                    {...register("age", { valueAsNumber: true })}
                    type="number"
                    placeholder="25"
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    thn
                  </span>
                </div>
                {errors.age && (
                  <p className="text-xs text-red-400">{errors.age.message}</p>
                )}
              </div>

              {/* Jenis Kelamin */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Jenis Kelamin
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "male", label: "Laki-laki" },
                    { value: "female", label: "Perempuan" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setValue("gender", opt.value as "male" | "female", {
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        watchedGender === opt.value
                          ? "border-primary/60 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-xs text-red-400">
                    {errors.gender.message}
                  </p>
                )}
              </div>

              {/* Tinggi */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                  Tinggi Badan
                </label>
                <div className="relative">
                  <Input
                    {...register("height", { valueAsNumber: true })}
                    type="number"
                    placeholder="170"
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    cm
                  </span>
                </div>
                {errors.height && (
                  <p className="text-xs text-red-400">
                    {errors.height.message}
                  </p>
                )}
              </div>

              {/* Berat */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Weight className="h-3.5 w-3.5 text-muted-foreground" />
                  Berat Badan Awal
                </label>
                <div className="relative">
                  <Input
                    {...register("weight", { valueAsNumber: true })}
                    type="number"
                    placeholder="65"
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    kg
                  </span>
                </div>
                {errors.weight && (
                  <p className="text-xs text-red-400">
                    {errors.weight.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Section 2: Tujuan Fitness ──────────────────────────── */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Tujuan Fitness
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {GOALS.map((goal) => {
                const Icon = goal.icon;
                const isActive = watchedGoal === goal.value;
                return (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() =>
                      setValue("goal", goal.value as ProfileInput["goal"], {
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "group relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-200",
                      isActive
                        ? goal.active
                        : "border-border text-muted-foreground hover:border-border/80 hover:bg-accent/30",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive
                          ? goal.color
                          : "text-muted-foreground/50 group-hover:text-muted-foreground",
                      )}
                    />
                    <div>
                      <p
                        className={cn(
                          "text-sm font-semibold leading-tight",
                          isActive ? "" : "text-foreground",
                        )}
                      >
                        {goal.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {goal.desc}
                      </p>
                    </div>
                    {isActive && (
                      <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-current opacity-80" />
                    )}
                  </button>
                );
              })}
            </div>
            {errors.goal && (
              <p className="text-xs text-red-400">{errors.goal.message}</p>
            )}
          </CardContent>
        </Card>

        {/* ── Section 3: Level Latihan ───────────────────────────── */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Level Latihan
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {LEVELS.map((lvl) => {
                const isActive = watchedLevel === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() =>
                      setValue("level", lvl.value as ProfileInput["level"], {
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "flex flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-200",
                      isActive
                        ? lvl.active
                        : "border-border hover:border-border/80 hover:bg-accent/30",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn("h-2.5 w-2.5 rounded-full", lvl.dot)}
                      />
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          isActive ? "text-foreground" : "text-foreground",
                        )}
                      >
                        {lvl.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {lvl.desc}
                    </p>
                  </button>
                );
              })}
            </div>
            {errors.level && (
              <p className="text-xs text-red-400">{errors.level.message}</p>
            )}
          </CardContent>
        </Card>

        {/* ── Section 4: Riwayat Cedera ──────────────────────────── */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Riwayat Cedera / Pantangan
              </h2>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Catatan Cedera
                </label>
                <span className="text-xs text-muted-foreground">Opsional</span>
              </div>
              <textarea
                {...register("injuryNotes")}
                rows={3}
                placeholder='Contoh: "Cedera lutut kanan, tidak boleh squat berat"'
                className={cn(
                  "w-full rounded-md border border-border bg-secondary/50 px-3 py-2.5 text-sm",
                  "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring",
                  "resize-none transition-colors",
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Section 5: Foto Progress ───────────────────────────── */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Foto Progress Awal
              </h2>
              <span className="ml-auto text-xs text-muted-foreground">
                Opsional
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />

            {photoPreview ? (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-xl border border-border aspect-video max-w-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Preview foto progress"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Ganti Foto
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => {
                      setPhotoPreview("");
                      setValue("progressPhoto", "");
                    }}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border",
                  "py-10 text-center transition-colors hover:border-primary/40 hover:bg-primary/5",
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Upload foto progress
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    PNG, JPG hingga 10MB
                  </p>
                </div>
              </button>
            )}
          </CardContent>
        </Card>

        {/* ── Actions ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 pb-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            className="text-muted-foreground"
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-36">
            {isSubmitting
              ? "Menyimpan..."
              : isEditMode
                ? "Perbarui Profil"
                : "Simpan Profil"}
          </Button>
        </div>
      </form>
    </div>
  );
}
