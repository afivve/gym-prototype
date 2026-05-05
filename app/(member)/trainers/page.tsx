"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Star,
  Dumbbell,
  Clock,
  CalendarPlus,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getTrainers, type Trainer } from "@/lib/mock/trainers";
import { addPtSession } from "@/lib/mock/ptSessions";
import { bookPtSchema, type BookPtInput } from "@/lib/validations";
import { formatCurrency, generateId, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const TIME_SLOTS = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const SPECIALTY_COLORS: Record<string, string> = {
  "Strength Training": "bg-red-500/10 text-red-400 border-red-500/20",
  Powerlifting: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Weight Loss": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Cardio: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Nutrition: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  "Functional Training":
    "bg-violet-500/10 text-violet-400 border-violet-500/20",
  HIIT: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Calisthenics: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Yoga: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Flexibility: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Recovery: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

function specialtyColor(s: string): string {
  return (
    SPECIALTY_COLORS[s] ?? "bg-muted/40 text-muted-foreground border-border/30"
  );
}

function TrainerAvatar({
  name,
  size = "lg",
}: {
  name: string;
  size?: "lg" | "sm";
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary",
        size === "lg" ? "h-16 w-16 text-lg" : "h-10 w-10 text-sm",
      )}
    >
      {initials}
    </div>
  );
}

export default function TrainersPage() {
  const { currentUser } = useAuth();
  const [trainers] = useState<Trainer[]>(() => getTrainers());
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null,
  );
  const [bookingTrainer, setBookingTrainer] = useState<Trainer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    trainers.forEach((t) => t.specialties.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [trainers]);

  const filtered = useMemo(() => {
    return trainers.filter((t) => {
      const matchSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.specialties.some((s) =>
          s.toLowerCase().includes(search.toLowerCase()),
        );
      const matchSpecialty =
        !selectedSpecialty || t.specialties.includes(selectedSpecialty);
      return matchSearch && matchSpecialty;
    });
  }, [trainers, search, selectedSpecialty]);

  const form = useForm<BookPtInput>({
    resolver: zodResolver(bookPtSchema),
    defaultValues: { date: "", time: "", notes: "" },
  });

  const today = new Date().toISOString().split("T")[0];

  function openBooking(trainer: Trainer) {
    form.reset({ date: "", time: "", notes: "" });
    setBookingTrainer(trainer);
  }

  function onSubmit(data: BookPtInput) {
    if (!currentUser || !bookingTrainer) return;
    setIsSubmitting(true);
    setTimeout(() => {
      addPtSession({
        id: generateId("pts"),
        trainerId: bookingTrainer.id,
        clientId: currentUser.id,
        date: data.date,
        time: data.time,
        durationMinutes: 60,
        price: bookingTrainer.pricePerSession,
        status: "scheduled",
        paymentStatus: "unpaid",
        notes: data.notes ?? undefined,
        createdAt: new Date().toISOString(),
      });
      toast.success("Sesi berhasil dibooking!", {
        description: `${bookingTrainer.name} — ${data.date} pukul ${data.time}`,
      });
      setIsSubmitting(false);
      setBookingTrainer(null);
    }, 500);
  }

  if (!currentUser) return null;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Personal Trainer</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Pilih trainer terbaik dan booking sesi latihan pribadi
        </p>
      </div>

      {/* Search & Specialty Filter */}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            placeholder="Cari trainer atau spesialisasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSpecialty(null)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-all",
              !selectedSpecialty
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            Semua
          </button>
          {allSpecialties.map((s) => (
            <button
              key={s}
              onClick={() =>
                setSelectedSpecialty(selectedSpecialty === s ? null : s)
              }
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                selectedSpecialty === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Trainer Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Dumbbell className="h-10 w-10 text-muted-foreground/20 mb-3" />
          <p className="text-muted-foreground text-sm">
            Tidak ada trainer ditemukan
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((trainer) => (
            <Card
              key={trainer.id}
              className="group transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <CardContent className="p-5 space-y-4">
                {/* Top row: avatar + name + rating */}
                <div className="flex items-start gap-4">
                  <TrainerAvatar name={trainer.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-base truncate">
                        {trainer.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold text-amber-400">
                          {trainer.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {trainer.totalSessionsCompleted} sesi selesai
                    </p>
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1.5">
                  {trainer.specialties.map((s) => (
                    <span
                      key={s}
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                        specialtyColor(s),
                      )}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {trainer.description}
                </p>

                {/* Footer: price + book button */}
                <div className="flex items-center justify-between pt-1 border-t border-border/30">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Harga per sesi
                    </p>
                    <p className="font-bold text-primary text-base">
                      {formatCurrency(trainer.pricePerSession)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() => openBooking(trainer)}
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                    Book Sesi
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog
        open={!!bookingTrainer}
        onOpenChange={(open) => {
          if (!open) setBookingTrainer(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Sesi Personal Trainer</DialogTitle>
            {bookingTrainer && (
              <DialogDescription asChild>
                <div className="flex items-center gap-3 mt-3">
                  <TrainerAvatar name={bookingTrainer.name} size="sm" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {bookingTrainer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {bookingTrainer.specialties.join(" · ")}
                    </p>
                  </div>
                  <span className="ml-auto font-bold text-primary text-sm">
                    {formatCurrency(bookingTrainer.pricePerSession)}
                  </span>
                </div>
              </DialogDescription>
            )}
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-2"
            >
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal</FormLabel>
                    <FormControl>
                      <Input type="date" min={today} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu Sesi</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">Pilih waktu...</option>
                        {TIME_SLOTS.map((t) => (
                          <option key={t} value={t}>
                            {t} WIB
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Catatan{" "}
                      <span className="text-muted-foreground font-normal">
                        (opsional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={2}
                        placeholder="Tujuan latihan, kondisi fisik, dll..."
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Summary */}
              {form.watch("date") && form.watch("time") && bookingTrainer && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trainer</span>
                    <span className="font-medium">{bookingTrainer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jadwal</span>
                    <span className="font-medium">
                      {form.watch("date")} · {form.watch("time")} WIB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durasi</span>
                    <span className="font-medium">60 menit</span>
                  </div>
                  <div className="flex justify-between border-t border-primary/20 pt-1 mt-1">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(bookingTrainer.pricePerSession)}
                    </span>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBookingTrainer(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-1.5"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                  Konfirmasi Booking
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
