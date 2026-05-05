"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock,
  Dumbbell,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Banknote,
  Star,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  getPtSessionsByClient,
  updatePtSession,
  type PtSession,
} from "@/lib/mock/ptSessions";
import { getTrainerById } from "@/lib/mock/trainers";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function statusBadge(status: PtSession["status"]) {
  switch (status) {
    case "scheduled":
      return (
        <Badge className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
          Terjadwal
        </Badge>
      );
    case "completed":
      return (
        <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          Selesai
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="text-xs bg-muted/40 text-muted-foreground border-border/30">
          Dibatalkan
        </Badge>
      );
  }
}

function paymentBadge(payment: PtSession["paymentStatus"]) {
  if (payment === "paid") {
    return (
      <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
        Lunas
      </Badge>
    );
  }
  return (
    <Badge className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20">
      Belum Bayar
    </Badge>
  );
}

export default function PtSessionsPage() {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<PtSession[]>(() =>
    currentUser ? getPtSessionsByClient(currentUser.id) : [],
  );
  const [cancelTarget, setCancelTarget] = useState<PtSession | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | PtSession["status"]>(
    "all",
  );

  const stats = useMemo(() => {
    const upcoming = sessions.filter((s) => s.status === "scheduled").length;
    const completed = sessions.filter((s) => s.status === "completed").length;
    const totalSpent = sessions
      .filter((s) => s.status === "completed" && s.paymentStatus === "paid")
      .reduce((sum, s) => sum + s.price, 0);
    return { upcoming, completed, totalSpent };
  }, [sessions]);

  const filtered = useMemo(
    () =>
      filterStatus === "all"
        ? sessions
        : sessions.filter((s) => s.status === filterStatus),
    [sessions, filterStatus],
  );

  function handleCancel() {
    if (!cancelTarget) return;
    const updated = { ...cancelTarget, status: "cancelled" as const };
    updatePtSession(updated);
    setSessions((prev) =>
      prev.map((s) => (s.id === cancelTarget.id ? updated : s)),
    );
    toast.success("Sesi berhasil dibatalkan");
    setCancelTarget(null);
  }

  if (!currentUser) return null;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sesi PT Saya</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Riwayat dan jadwal sesi personal trainer
          </p>
        </div>
        <Button asChild size="sm" className="gap-1.5 shrink-0">
          <Link href="/trainers">
            <CalendarDays className="h-3.5 w-3.5" />
            Book Sesi Baru
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
              <CalendarDays className="h-4.5 w-4.5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.upcoming}</p>
              <p className="text-xs text-muted-foreground">Sesi Mendatang</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Sesi Selesai</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Banknote className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <p className="text-base font-bold leading-tight">
                {formatCurrency(stats.totalSpent)}
              </p>
              <p className="text-xs text-muted-foreground">Total Dibayar</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            { key: "all", label: "Semua" },
            { key: "scheduled", label: "Terjadwal" },
            { key: "completed", label: "Selesai" },
            { key: "cancelled", label: "Dibatalkan" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-all",
              filterStatus === key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {label}
            {key !== "all" && (
              <span className="ml-1.5 text-[10px] opacity-70">
                {sessions.filter((s) => s.status === key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Session List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Dumbbell className="h-10 w-10 text-muted-foreground/20 mb-3" />
          <p className="font-medium text-muted-foreground">
            {filterStatus === "all" ? "Belum ada sesi PT" : "Tidak ada sesi"}
          </p>
          {filterStatus === "all" && (
            <Button asChild variant="link" size="sm" className="mt-1">
              <Link href="/trainers">
                Cari trainer dan book sekarang
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((session) => {
            const trainer = getTrainerById(session.trainerId);
            const isPast =
              new Date(`${session.date}T${session.time}`) < new Date();
            return (
              <Card
                key={session.id}
                className={cn(session.status === "cancelled" && "opacity-60")}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    {/* Date column */}
                    <div className="shrink-0 text-center hidden sm:block">
                      <div className="rounded-xl bg-muted/40 px-3 py-2 min-w-13">
                        <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                          {new Date(
                            session.date + "T00:00:00",
                          ).toLocaleDateString("id-ID", {
                            month: "short",
                          })}
                        </p>
                        <p className="text-2xl font-bold leading-tight">
                          {new Date(session.date + "T00:00:00").getDate()}
                        </p>
                      </div>
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {statusBadge(session.status)}
                          {paymentBadge(session.paymentStatus)}
                        </div>
                        <span className="text-xs text-muted-foreground sm:hidden">
                          {formatDate(session.date)}
                        </span>
                      </div>

                      <p className="font-semibold">
                        {trainer?.name ?? "Trainer tidak ditemukan"}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.time} WIB · {session.durationMinutes} menit
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-400" />
                          {trainer?.specialties.join(", ")}
                        </span>
                      </div>

                      {session.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          "{session.notes}"
                        </p>
                      )}
                    </div>

                    {/* Price + action */}
                    <div className="shrink-0 text-right space-y-2">
                      <p className="font-bold text-primary">
                        {formatCurrency(session.price)}
                      </p>
                      {session.status === "scheduled" && !isPast && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs h-7 px-2.5"
                          onClick={() => setCancelTarget(session)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Batal
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Confirm Dialog */}
      <Dialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Batalkan Sesi?</DialogTitle>
            <DialogDescription>
              {cancelTarget && (
                <>
                  Sesi dengan{" "}
                  <strong>
                    {getTrainerById(cancelTarget.trainerId)?.name ?? "trainer"}
                  </strong>{" "}
                  pada{" "}
                  <strong>
                    {cancelTarget.date} pukul {cancelTarget.time}
                  </strong>{" "}
                  akan dibatalkan. Tindakan ini tidak dapat diurungkan.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Tidak
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Ya, Batalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
