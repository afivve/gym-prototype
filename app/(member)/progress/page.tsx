"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Minus,
  Plus,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
  BarChart3,
  Activity,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getProfile } from "@/lib/mock/profile";
import {
  getMeasurements,
  addMeasurement,
  deleteMeasurement,
  calcBmi,
  type Measurement,
} from "@/lib/mock/measurements";
import { measurementSchema, type MeasurementInput } from "@/lib/validations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateId } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: number | undefined, unit = "kg"): string {
  if (v === undefined || v === null) return "—";
  return `${v}${unit}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

type Delta = { value: number; direction: "up" | "down" | "same" };

function getDelta(
  latest: number | undefined,
  prev: number | undefined,
): Delta | null {
  if (latest === undefined || prev === undefined) return null;
  const d = Math.round((latest - prev) * 10) / 10;
  if (d === 0) return { value: 0, direction: "same" };
  return { value: Math.abs(d), direction: d > 0 ? "up" : "down" };
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Kurus", color: "text-blue-400" };
  if (bmi < 25) return { label: "Normal", color: "text-emerald-400" };
  if (bmi < 30) return { label: "Gemuk", color: "text-amber-400" };
  return { label: "Obesitas", color: "text-red-400" };
}

// ─── Mini sparkline (CSS only) ────────────────────────────────────────────────

function Sparkline({
  data,
  color = "bg-primary",
}: {
  data: number[];
  color?: string;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.slice(-10); // last 10 points

  return (
    <div className="flex items-end gap-0.5 h-8">
      {points.map((v, i) => {
        const pct = ((v - min) / range) * 100;
        return (
          <div
            key={i}
            className={cn("w-1.5 rounded-sm opacity-70 transition-all", color)}
            style={{ height: `${Math.max(pct, 8)}%` }}
          />
        );
      })}
    </div>
  );
}

// ─── Delta Badge ──────────────────────────────────────────────────────────────

function DeltaBadge({
  delta,
  positive = "down", // "down" means weight loss = good (green)
}: {
  delta: Delta | null;
  positive?: "up" | "down";
}) {
  if (!delta) return null;
  if (delta.direction === "same")
    return (
      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> Stabil
      </span>
    );

  const isGood =
    delta.direction === positive ||
    (positive === "down" && delta.direction === "down");
  const Icon = delta.direction === "up" ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-xs font-medium",
        isGood ? "text-emerald-400" : "text-red-400",
      )}
    >
      <Icon className="h-3 w-3" />
      {delta.direction === "up" ? "+" : "-"}
      {delta.value}
    </span>
  );
}

// ─── Number Input Field ───────────────────────────────────────────────────────

function NumField({
  label,
  unit,
  placeholder,
  name,
  register,
  error,
  required,
}: {
  label: string;
  unit: string;
  placeholder: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        {label}
        {!required && (
          <span className="text-muted-foreground/50 font-normal">
            (opsional)
          </span>
        )}
      </label>
      <div className="relative">
        <Input
          {...register(name, { valueAsNumber: true })}
          type="number"
          step="0.1"
          placeholder={placeholder}
          className="pr-10 h-9 text-sm"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          {unit}
        </span>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const { currentUser } = useAuth();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [userHeight, setUserHeight] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!currentUser) return;
    setMeasurements(getMeasurements(currentUser.id));
    const p = getProfile(currentUser.id);
    if (p) setUserHeight(p.height);
  }, [currentUser]);

  useEffect(() => {
    load();
  }, [load]);

  const latest = measurements[measurements.length - 1];
  const prev = measurements[measurements.length - 2];

  const weightDelta = getDelta(latest?.weight, prev?.weight);
  const fatDelta = getDelta(latest?.bodyFat, prev?.bodyFat);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MeasurementInput>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  });

  const watchedWeight = watch("weight");
  const liveBmi =
    userHeight > 0 && watchedWeight > 0
      ? calcBmi(watchedWeight, userHeight)
      : null;

  const onSubmit = (data: MeasurementInput) => {
    if (!currentUser) return;
    const bmi =
      userHeight > 0 && data.weight > 0
        ? calcBmi(data.weight, userHeight)
        : undefined;

    addMeasurement({
      id: generateId("msr"),
      userId: currentUser.id,
      date: data.date,
      weight: data.weight,
      bodyFat: data.bodyFat,
      bmi,
      chest: data.chest,
      waist: data.waist,
      arm: data.arm,
      thigh: data.thigh,
      hip: data.hip,
      calf: data.calf,
      notes: data.notes,
    });

    load();
    reset({ date: new Date().toISOString().split("T")[0] });
    setDialogOpen(false);
    toast.success("Pengukuran berhasil disimpan!");
  };

  const handleDelete = (id: string) => {
    deleteMeasurement(id);
    load();
    toast.success("Data dihapus");
  };

  if (!currentUser) return null;

  const first = measurements[0];
  const weightData = measurements.map((m) => m.weight);
  const fatData = measurements
    .filter((m) => m.bodyFat !== undefined)
    .map((m) => m.bodyFat as number);

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Progress Tubuh</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Catat dan pantau perkembangan fisik kamu dari waktu ke waktu
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Catat Sekarang
        </Button>
      </div>

      {measurements.length === 0 ? (
        /* ── Empty state ──────────────────────────────────────── */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <BarChart3 className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Belum ada data pengukuran
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Mulai catat pengukuran tubuh pertama kamu untuk melihat
                progress.
              </p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="gap-2 mt-1">
              <Plus className="h-4 w-4" />
              Catat Pengukuran Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── A. Summary Cards ──────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Berat */}
            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Berat Badan
                  </p>
                  <Scale className="h-4 w-4 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-3xl font-bold tracking-tight">
                    {latest.weight}
                    <span className="text-base font-normal text-muted-foreground ml-1">
                      kg
                    </span>
                  </p>
                  <DeltaBadge delta={weightDelta} positive="down" />
                </div>
                <Sparkline data={weightData} color="bg-primary" />
              </CardContent>
            </Card>

            {/* Body Fat */}
            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Body Fat
                  </p>
                  <Activity className="h-4 w-4 text-muted-foreground/40" />
                </div>
                <div>
                  {latest.bodyFat !== undefined ? (
                    <>
                      <p className="text-3xl font-bold tracking-tight">
                        {latest.bodyFat}
                        <span className="text-base font-normal text-muted-foreground ml-1">
                          %
                        </span>
                      </p>
                      <DeltaBadge delta={fatDelta} positive="down" />
                    </>
                  ) : (
                    <p className="text-2xl font-bold text-muted-foreground/40">
                      —
                    </p>
                  )}
                </div>
                {fatData.length >= 2 && (
                  <Sparkline data={fatData} color="bg-amber-400" />
                )}
              </CardContent>
            </Card>

            {/* BMI */}
            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    BMI
                  </p>
                  <BarChart3 className="h-4 w-4 text-muted-foreground/40" />
                </div>
                <div>
                  {latest.bmi ? (
                    <>
                      <p className="text-3xl font-bold tracking-tight">
                        {latest.bmi}
                      </p>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          bmiCategory(latest.bmi).color,
                        )}
                      >
                        {bmiCategory(latest.bmi).label}
                      </span>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-muted-foreground/40">
                        —
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Isi tinggi di profil
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* First vs Latest */}
            {first && first.id !== latest.id && (
              <Card>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Total Progress
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Berat awal</p>
                    <p className="text-2xl font-bold tracking-tight">
                      {first.weight} kg
                    </p>
                    {(() => {
                      const total = getDelta(latest.weight, first.weight);
                      if (!total) return null;
                      const isLoss = total.direction === "down";
                      return (
                        <span
                          className={cn(
                            "flex items-center gap-0.5 text-sm font-semibold mt-0.5",
                            isLoss ? "text-emerald-400" : "text-red-400",
                          )}
                        >
                          {isLoss ? (
                            <TrendingDown className="h-4 w-4" />
                          ) : (
                            <TrendingUp className="h-4 w-4" />
                          )}
                          {isLoss ? "-" : "+"}
                          {total.value} kg total
                        </span>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── B. Weight Trend (CSS chart) ───────────────────── */}
          {measurements.length >= 2 && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Tren Berat Badan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {measurements.length} catatan tersimpan
                    </p>
                  </div>
                </div>

                {/* Bar chart — last 8 entries */}
                {(() => {
                  const pts = measurements.slice(-8);
                  const min = Math.min(...pts.map((p) => p.weight));
                  const max = Math.max(...pts.map((p) => p.weight));
                  const range = max - min || 1;
                  return (
                    <div className="flex items-end gap-2 h-28 mt-2">
                      {pts.map((m, i) => {
                        const pct = ((m.weight - min) / range) * 80 + 20;
                        const isLatest = i === pts.length - 1;
                        return (
                          <div
                            key={m.id}
                            className="flex flex-col items-center gap-1 flex-1 min-w-0"
                          >
                            <span className="text-[10px] text-muted-foreground font-medium truncate">
                              {m.weight}
                            </span>
                            <div
                              className="w-full flex items-end"
                              style={{ height: "72px" }}
                            >
                              <div
                                className={cn(
                                  "w-full rounded-t-md transition-all duration-300",
                                  isLatest ? "bg-primary" : "bg-primary/30",
                                )}
                                style={{ height: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-muted-foreground/60 truncate w-full text-center">
                              {fmtDateShort(m.date)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* ── C. History List ───────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Riwayat Pengukuran</h2>
              <span className="text-xs text-muted-foreground">
                {measurements.length} entri
              </span>
            </div>

            <div className="space-y-2">
              {[...measurements].reverse().map((m, idx) => {
                const isExpanded = expandedId === m.id;
                const isFirst = idx === measurements.length - 1;
                const circFields = [
                  { label: "Dada", value: m.chest, unit: "cm" },
                  { label: "Pinggang", value: m.waist, unit: "cm" },
                  { label: "Lengan", value: m.arm, unit: "cm" },
                  { label: "Paha", value: m.thigh, unit: "cm" },
                  { label: "Pinggul", value: m.hip, unit: "cm" },
                  { label: "Betis", value: m.calf, unit: "cm" },
                ].filter((f) => f.value !== undefined);

                return (
                  <Card
                    key={m.id}
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      idx === 0 && "border-primary/30",
                    )}
                  >
                    <CardContent className="p-0">
                      {/* Row header */}
                      <button
                        type="button"
                        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-accent/30 transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : m.id)}
                      >
                        {/* Date */}
                        <div className="flex flex-col items-center justify-center min-w-11 rounded-lg bg-muted p-2">
                          <span className="text-[10px] text-muted-foreground leading-none">
                            {new Date(m.date)
                              .toLocaleDateString("id-ID", { month: "short" })
                              .toUpperCase()}
                          </span>
                          <span className="text-base font-bold leading-tight">
                            {new Date(m.date).getDate()}
                          </span>
                        </div>

                        {/* Main stats */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-semibold">
                              {m.weight} kg
                            </span>
                            {m.bodyFat !== undefined && (
                              <Badge
                                variant="outline"
                                className="text-xs px-1.5 py-0"
                              >
                                {m.bodyFat}% fat
                              </Badge>
                            )}
                            {m.bmi && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs px-1.5 py-0",
                                  bmiCategory(m.bmi).color,
                                )}
                              >
                                BMI {m.bmi}
                              </Badge>
                            )}
                            {isFirst && idx === 0 && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-primary/15 text-primary border-primary/30">
                                Terbaru
                              </Badge>
                            )}
                          </div>
                          {m.notes && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {m.notes}
                            </p>
                          )}
                        </div>

                        {/* Expand chevron */}
                        <div className="flex items-center gap-2">
                          {circFields.length > 0 && (
                            <span className="text-xs text-muted-foreground hidden sm:block">
                              +{circFields.length} ukuran
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="border-t border-border/60 px-5 pb-4 pt-3 bg-muted/20 space-y-3">
                          <p className="text-xs text-muted-foreground">
                            {fmtDate(m.date)}
                          </p>
                          {circFields.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                              {circFields.map((f) => (
                                <div key={f.label} className="text-center">
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                    {f.label}
                                  </p>
                                  <p className="text-sm font-semibold mt-0.5">
                                    {f.value}
                                    <span className="text-xs font-normal text-muted-foreground ml-0.5">
                                      {f.unit}
                                    </span>
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                          {m.notes && (
                            <p className="text-xs text-muted-foreground border-l-2 border-border pl-2 italic">
                              {m.notes}
                            </p>
                          )}
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground gap-1.5 h-7"
                              onClick={() => handleDelete(m.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                              Hapus
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Input Dialog ────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Catat Pengukuran Baru</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                Tanggal
              </label>
              <Input {...register("date")} type="date" className="h-9" />
              {errors.date && (
                <p className="text-xs text-red-400">{errors.date.message}</p>
              )}
            </div>

            {/* Primary: weight */}
            <div className="p-4 rounded-xl border border-border space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Data Utama
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Berat Badan <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      {...register("weight", { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      placeholder="70"
                      className="pr-10 h-9 text-sm"
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

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Body Fat{" "}
                    <span className="text-muted-foreground/50">(opsional)</span>
                  </label>
                  <div className="relative">
                    <Input
                      {...register("bodyFat", { valueAsNumber: true })}
                      type="number"
                      step="0.1"
                      placeholder="20"
                      className="pr-8 h-9 text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      %
                    </span>
                  </div>
                  {errors.bodyFat && (
                    <p className="text-xs text-red-400">
                      {errors.bodyFat.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Live BMI preview */}
              {liveBmi !== null && (
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>BMI otomatis:</span>
                  <span
                    className={cn("font-semibold", bmiCategory(liveBmi).color)}
                  >
                    {liveBmi} — {bmiCategory(liveBmi).label}
                  </span>
                </div>
              )}
              {!userHeight && (
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Isi tinggi badan di Profil untuk kalkulasi BMI otomatis
                </p>
              )}
            </div>

            {/* Circumferences */}
            <div className="p-4 rounded-xl border border-border space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lingkar Tubuh{" "}
                <span className="text-muted-foreground/50 font-normal normal-case">
                  (semua opsional)
                </span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <NumField
                  label="Dada"
                  unit="cm"
                  placeholder="95"
                  name="chest"
                  register={register}
                  error={errors.chest?.message}
                />
                <NumField
                  label="Pinggang"
                  unit="cm"
                  placeholder="80"
                  name="waist"
                  register={register}
                  error={errors.waist?.message}
                />
                <NumField
                  label="Lengan"
                  unit="cm"
                  placeholder="32"
                  name="arm"
                  register={register}
                  error={errors.arm?.message}
                />
                <NumField
                  label="Paha"
                  unit="cm"
                  placeholder="55"
                  name="thigh"
                  register={register}
                  error={errors.thigh?.message}
                />
                <NumField
                  label="Pinggul"
                  unit="cm"
                  placeholder="90"
                  name="hip"
                  register={register}
                  error={errors.hip?.message}
                />
                <NumField
                  label="Betis"
                  unit="cm"
                  placeholder="35"
                  name="calf"
                  register={register}
                  error={errors.calf?.message}
                />
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
                placeholder='Contoh: "Setelah 2 minggu diet"'
                className={cn(
                  "w-full rounded-md border border-border bg-secondary/50 px-3 py-2.5 text-sm",
                  "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring resize-none",
                )}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  reset({ date: new Date().toISOString().split("T")[0] });
                  setDialogOpen(false);
                }}
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
