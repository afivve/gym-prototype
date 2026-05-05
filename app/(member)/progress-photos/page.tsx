"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Camera,
  Plus,
  Trash2,
  Calendar,
  ChevronsLeftRight,
  ImageOff,
  Upload,
  X,
  Lock,
  Globe,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  getPhotos,
  addPhoto,
  deletePhoto,
  type ProgressPhoto,
  type PhotoVisibility,
} from "@/lib/mock/progressPhotos";
import {
  progressPhotoSchema,
  type ProgressPhotoInput,
} from "@/lib/validations";
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
import { generateId, cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ANGLE_LABEL: Record<"front" | "side" | "back", string> = {
  front: "Front",
  side: "Side",
  back: "Back",
};

// ─── PhotoSlot — display only ─────────────────────────────────────────────────

function PhotoSlot({
  angle,
  value,
}: {
  angle: "front" | "side" | "back";
  value?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-muted/40 border border-border/40">
        {value ? (
          <img src={value} alt={angle} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/25">
            <ImageOff className="h-6 w-6" />
            <span className="text-[10px]">Tidak ada foto</span>
          </div>
        )}
      </div>
      <p className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
        {ANGLE_LABEL[angle]}
      </p>
    </div>
  );
}

// ─── PhotoUploadZone — drag & drop input ──────────────────────────────────────

function PhotoUploadZone({
  angle,
  value,
  onChange,
  required,
  hasError,
}: {
  angle: "front" | "side" | "back";
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hasError?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function processFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diperbolehkan");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange((e.target?.result as string) ?? "");
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload ${ANGLE_LABEL[angle]}`}
        className={cn(
          "relative aspect-3/4 rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden group cursor-pointer outline-none",
          dragging
            ? "border-primary bg-primary/8 scale-[1.02]"
            : value
              ? "border-border/40 hover:border-primary/40"
              : hasError
                ? "border-red-500/50 bg-red-500/5"
                : "border-border/40 hover:border-primary/40 hover:bg-muted/30",
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) processFile(file);
        }}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={angle}
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
              <Upload className="h-5 w-5" />
              <span className="text-xs font-medium">Ganti foto</span>
            </div>
            {/* Remove button */}
            <button
              type="button"
              aria-label="Hapus foto"
              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 group-hover:bg-muted transition-colors">
              <Camera className="h-4.5 w-4.5" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold">
                {ANGLE_LABEL[angle]}
                {required && <span className="text-red-400 ml-0.5">*</span>}
              </p>
              <p className="text-[10px] mt-0.5 opacity-70 leading-tight">
                Klik atau drag
              </p>
            </div>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── BeforeAfterSlider ────────────────────────────────────────────────────────

function BeforeAfterSlider({
  before,
  after,
}: {
  before: string;
  after: string;
}) {
  const [pct, setPct] = useState(50);

  return (
    <div className="relative aspect-3/4 overflow-hidden rounded-xl select-none bg-muted">
      {/* Before layer (full width, behind) */}
      <img
        src={before}
        alt="before"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      {/* After layer — clipped from the right, revealing from left */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        <img
          src={after}
          alt="after"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-[0_0_10px_rgba(0,0,0,0.6)] z-10 pointer-events-none"
        style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
      >
        {/* Drag handle */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-9 w-9 rounded-full bg-white shadow-xl flex items-center justify-center">
          <ChevronsLeftRight
            className="h-4 w-4 text-zinc-800"
            strokeWidth={2.5}
          />
        </div>
      </div>
      {/* Invisible range input covering full area */}
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => setPct(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
        aria-label="Perbandingan before after"
      />
      {/* Labels */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
        <span className="bg-black/65 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          Before
        </span>
      </div>
      <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
        <span className="bg-primary/85 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          After
        </span>
      </div>
    </div>
  );
}

// ─── SimpleSideBySide — for side & back comparison ───────────────────────────

function SideBySide({
  label,
  before,
  after,
}: {
  label: string;
  before: string;
  after: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        <div className="relative aspect-3/4 rounded-xl overflow-hidden">
          <img
            src={before}
            alt={`before ${label}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2">
            <span className="bg-black/65 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
              Before
            </span>
          </div>
        </div>
        <div className="relative aspect-3/4 rounded-xl overflow-hidden">
          <img
            src={after}
            alt={`after ${label}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 right-2">
            <span className="bg-primary/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
              After
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VisibilityBadge ──────────────────────────────────────────────────────────

function VisibilityBadge({ v }: { v: PhotoVisibility }) {
  return v === "private" ? (
    <Badge variant="outline" className="gap-1 text-xs">
      <Lock className="h-2.5 w-2.5" /> Privat
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="gap-1 text-xs text-emerald-400 border-emerald-500/30"
    >
      <Globe className="h-2.5 w-2.5" /> Publik
    </Badge>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProgressPhotosPage() {
  const { currentUser } = useAuth();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [beforeId, setBeforeId] = useState("");
  const [afterId, setAfterId] = useState("");

  // Photo state outside RHF (FileReader is async)
  const [frontPhoto, setFrontPhoto] = useState("");
  const [sidePhoto, setSidePhoto] = useState("");
  const [backPhoto, setBackPhoto] = useState("");
  const [visibility, setVisibility] = useState<PhotoVisibility>("private");
  const [frontError, setFrontError] = useState(false);

  const load = useCallback(() => {
    if (!currentUser) return;
    setPhotos(getPhotos(currentUser.id));
  }, [currentUser]);

  useEffect(() => {
    load();
  }, [load]);

  // Set comparison defaults when photos become available
  useEffect(() => {
    if (photos.length >= 2) {
      setBeforeId((prev) => prev || photos[0].id);
      setAfterId((prev) => prev || photos[photos.length - 1].id);
    }
  }, [photos]);

  const latest = photos[photos.length - 1];
  const detailPhoto = photos.find((p) => p.id === detailId) ?? null;
  const beforePhoto = photos.find((p) => p.id === beforeId) ?? null;
  const afterPhoto = photos.find((p) => p.id === afterId) ?? null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProgressPhotoInput>({
    resolver: zodResolver(progressPhotoSchema),
    defaultValues: { date: new Date().toISOString().split("T")[0] },
  });

  function resetUpload() {
    reset({ date: new Date().toISOString().split("T")[0] });
    setFrontPhoto("");
    setSidePhoto("");
    setBackPhoto("");
    setVisibility("private");
    setFrontError(false);
  }

  const onSubmit = (data: ProgressPhotoInput) => {
    if (!currentUser) return;
    if (!frontPhoto) {
      setFrontError(true);
      toast.error("Foto depan (Front) wajib diupload");
      return;
    }
    setFrontError(false);
    addPhoto({
      id: generateId("photo"),
      userId: currentUser.id,
      date: data.date,
      front: frontPhoto,
      side: sidePhoto || undefined,
      back: backPhoto || undefined,
      visibility,
      notes: data.notes,
    });
    load();
    resetUpload();
    setUploadOpen(false);
    toast.success("Foto progress berhasil disimpan!");
  };

  const handleDelete = (id: string) => {
    deletePhoto(id);
    load();
    setDetailId(null);
    if (beforeId === id) setBeforeId(photos.find((p) => p.id !== id)?.id ?? "");
    if (afterId === id)
      setAfterId(photos.findLast((p) => p.id !== id)?.id ?? "");
    toast.success("Foto dihapus");
  };

  if (!currentUser) return null;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Foto Progress</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Abadikan transformasi tubuh kamu dari waktu ke waktu
          </p>
        </div>
        <Button
          onClick={() => {
            resetUpload();
            setUploadOpen(true);
          }}
          className="gap-2 shrink-0"
        >
          <Camera className="h-4 w-4" />
          Upload Foto
        </Button>
      </div>

      {photos.length === 0 ? (
        /* ── Empty State ──────────────────────────────────────── */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-24 text-center gap-5">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Camera className="h-9 w-9 text-primary/60" />
              </div>
              <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                <Plus className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-lg font-bold">
                Mulai dokumentasi transformasi kamu
              </p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Upload foto pertama kamu sekarang. Lihat perubahan dramatis
                tubuh kamu dalam hitungan minggu.
              </p>
            </div>
            <Button
              onClick={() => {
                resetUpload();
                setUploadOpen(true);
              }}
              className="gap-2 mt-1"
            >
              <Camera className="h-4 w-4" />
              Upload Foto Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── A. Latest Progress ──────────────────────────────── */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Progress Terkini</p>
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(latest.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <VisibilityBadge v={latest.visibility} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => setDetailId(latest.id)}
                  >
                    Detail
                  </Button>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <PhotoSlot angle="front" value={latest.front} />
                  <PhotoSlot angle="side" value={latest.side} />
                  <PhotoSlot angle="back" value={latest.back} />
                </div>
                {latest.notes && (
                  <p className="text-sm text-muted-foreground border-l-2 border-border pl-3 italic">
                    {latest.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── B. Before vs After ──────────────────────────────── */}
          {photos.length >= 2 && (
            <Card>
              <CardContent className="p-5 space-y-5">
                {/* Section header */}
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15">
                    <ChevronsLeftRight className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Before vs After</p>
                    <p className="text-xs text-muted-foreground">
                      Drag slider untuk membandingkan perubahan
                    </p>
                  </div>
                </div>

                {/* Date selectors */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Before
                    </label>
                    <select
                      value={beforeId}
                      onChange={(e) => setBeforeId(e.target.value)}
                      className="w-full h-9 rounded-md border border-border bg-secondary/50 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {photos.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          disabled={p.id === afterId}
                        >
                          {fmtDateShort(p.date)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      After
                    </label>
                    <select
                      value={afterId}
                      onChange={(e) => setAfterId(e.target.value)}
                      className="w-full h-9 rounded-md border border-border bg-secondary/50 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {photos.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                          disabled={p.id === beforeId}
                        >
                          {fmtDateShort(p.date)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Comparison visuals */}
                {beforePhoto && afterPhoto && (
                  <div className="space-y-4">
                    {/* Front — slider */}
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Front — Drag untuk compare
                      </p>
                      <BeforeAfterSlider
                        before={beforePhoto.front}
                        after={afterPhoto.front}
                      />
                    </div>

                    {/* Side + Back — side by side */}
                    {(beforePhoto.side && afterPhoto.side) ||
                    (beforePhoto.back && afterPhoto.back) ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {beforePhoto.side && afterPhoto.side && (
                          <SideBySide
                            label="Side"
                            before={beforePhoto.side}
                            after={afterPhoto.side}
                          />
                        )}
                        {beforePhoto.back && afterPhoto.back && (
                          <SideBySide
                            label="Back"
                            before={beforePhoto.back}
                            after={afterPhoto.back}
                          />
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── C. Timeline ─────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Semua Foto Progress</h2>
              <span className="text-xs text-muted-foreground">
                {photos.length} entri
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...photos].reverse().map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  className="text-left group focus:outline-none"
                  onClick={() => setDetailId(p.id)}
                >
                  <Card
                    className={cn(
                      "overflow-hidden transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-black/10",
                      idx === 0 && "border-primary/30",
                    )}
                  >
                    <CardContent className="p-2 space-y-0">
                      {/* 3-photo thumbnails */}
                      <div className="grid grid-cols-3 gap-0.5 rounded-lg overflow-hidden">
                        {(["front", "side", "back"] as const).map((angle) => (
                          <div
                            key={angle}
                            className="aspect-3/4 overflow-hidden bg-muted/50"
                          >
                            {p[angle] ? (
                              <img
                                src={p[angle]}
                                alt={angle}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageOff className="h-3 w-3 text-muted-foreground/25" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Card footer */}
                      <div className="flex items-center justify-between pt-2 px-1 pb-1">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {fmtDateShort(p.date)}
                          </p>
                          {p.notes && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              {p.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {idx === 0 && (
                            <Badge className="text-[9px] px-1.5 py-0 h-4 bg-primary/15 text-primary border-primary/30 font-semibold">
                              Terbaru
                            </Badge>
                          )}
                          {p.visibility === "private" ? (
                            <Lock className="h-2.5 w-2.5 text-muted-foreground/40" />
                          ) : (
                            <Globe className="h-2.5 w-2.5 text-emerald-400/60" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Upload Dialog ──────────────────────────────────────── */}
      <Dialog
        open={uploadOpen}
        onOpenChange={(open) => {
          if (!open) resetUpload();
          setUploadOpen(open);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              Upload Foto Progress
            </DialogTitle>
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

            {/* Photo upload zones */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Foto Tubuh
                </p>
                {frontError && (
                  <p className="text-xs text-red-400">
                    Foto depan wajib diupload
                  </p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <PhotoUploadZone
                  angle="front"
                  value={frontPhoto}
                  onChange={(v) => {
                    setFrontPhoto(v);
                    if (v) setFrontError(false);
                  }}
                  required
                  hasError={frontError}
                />
                <PhotoUploadZone
                  angle="side"
                  value={sidePhoto}
                  onChange={setSidePhoto}
                />
                <PhotoUploadZone
                  angle="back"
                  value={backPhoto}
                  onChange={setBackPhoto}
                />
              </div>
              <p className="text-[10px] text-muted-foreground/60">
                Foto front wajib. Side dan back opsional. Drag & drop atau klik
                untuk upload.
              </p>
            </div>

            {/* Visibility toggle */}
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">Visibilitas</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border text-sm font-medium transition-all",
                    visibility === "private"
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground/40",
                  )}
                  onClick={() => setVisibility("private")}
                >
                  <Lock className="h-3.5 w-3.5" />
                  Privat
                </button>
                <button
                  type="button"
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border text-sm font-medium transition-all",
                    visibility === "public"
                      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400"
                      : "border-border text-muted-foreground hover:border-muted-foreground/40",
                  )}
                  onClick={() => setVisibility("public")}
                >
                  <Globe className="h-3.5 w-3.5" />
                  Publik
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/60">
                Privat hanya terlihat oleh kamu. Publik bisa ditampilkan di
                leaderboard.
              </p>
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
                placeholder='Contoh: "Minggu ke-4 program cutting"'
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
                  resetUpload();
                  setUploadOpen(false);
                }}
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Foto"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Detail Dialog ──────────────────────────────────────── */}
      <Dialog
        open={!!detailId}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {detailPhoto && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between pr-6">
                  <span className="text-base">{fmtDate(detailPhoto.date)}</span>
                  <VisibilityBadge v={detailPhoto.visibility} />
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-3 mt-1">
                <PhotoSlot angle="front" value={detailPhoto.front} />
                <PhotoSlot angle="side" value={detailPhoto.side} />
                <PhotoSlot angle="back" value={detailPhoto.back} />
              </div>

              {detailPhoto.notes && (
                <p className="text-sm text-muted-foreground border-l-2 border-border pl-3 italic mt-1">
                  {detailPhoto.notes}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground gap-1.5 h-7 hover:text-red-400 hover:bg-red-400/5"
                  onClick={() => handleDelete(detailPhoto.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  Hapus Foto
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    setBeforeId(photos[0]?.id ?? "");
                    setAfterId(detailPhoto.id);
                    setDetailId(null);
                    // Scroll to comparison section
                    document
                      .querySelector("[data-comparison]")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Bandingkan
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
