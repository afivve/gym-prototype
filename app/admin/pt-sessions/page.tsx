"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CalendarDays,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Banknote,
  ChevronDown,
} from "lucide-react";
import { useApp } from "@/contexts/app-context";
import {
  getAllPtSessions,
  addPtSession,
  updatePtSession,
  deletePtSession,
  type PtSession,
} from "@/lib/mock/ptSessions";
import { getAllTrainers } from "@/lib/mock/trainers";
import {
  ptSessionAdminSchema,
  type PtSessionAdminInput,
} from "@/lib/validations";
import { formatCurrency, formatDate, generateId, cn } from "@/lib/utils";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default function AdminPtSessionsPage() {
  const { users } = useApp();
  const members = useMemo(
    () => users.filter((u) => u.role === "member"),
    [users],
  );
  const trainers = useMemo(() => getAllTrainers(), []);

  const [sessions, setSessions] = useState<PtSession[]>(() =>
    getAllPtSessions(),
  );
  const [filterStatus, setFilterStatus] = useState<"all" | PtSession["status"]>(
    "all",
  );
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PtSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = useMemo(() => {
    const scheduled = sessions.filter((s) => s.status === "scheduled").length;
    const completed = sessions.filter((s) => s.status === "completed").length;
    const revenue = sessions
      .filter((s) => s.paymentStatus === "paid")
      .reduce((sum, s) => sum + s.price, 0);
    return { scheduled, completed, revenue };
  }, [sessions]);

  const filtered = useMemo(
    () =>
      filterStatus === "all"
        ? sessions
        : sessions.filter((s) => s.status === filterStatus),
    [sessions, filterStatus],
  );

  function getUserName(id: string) {
    return users.find((u) => u.id === id)?.name ?? "Unknown";
  }

  function getTrainerName(id: string) {
    return trainers.find((t) => t.id === id)?.name ?? "Unknown";
  }

  const form = useForm<PtSessionAdminInput>({
    resolver: zodResolver(ptSessionAdminSchema),
    defaultValues: {
      trainerId: "",
      clientId: "",
      date: "",
      time: "",
      durationMinutes: 60,
      price: 0,
      notes: "",
    },
  });

  // auto-fill price when trainer changes
  const watchedTrainerId = form.watch("trainerId");
  useMemo(() => {
    if (watchedTrainerId) {
      const trainer = trainers.find((t) => t.id === watchedTrainerId);
      if (trainer)
        form.setValue("price", trainer.pricePerSession, {
          shouldValidate: false,
        });
    }
  }, [watchedTrainerId, trainers, form]);

  function openAdd() {
    form.reset({
      trainerId: "",
      clientId: "",
      date: "",
      time: "",
      durationMinutes: 60,
      price: 0,
      notes: "",
    });
    setFormOpen(true);
  }

  function onSubmit(data: PtSessionAdminInput) {
    setIsSubmitting(true);
    setTimeout(() => {
      const session: PtSession = {
        id: generateId("pts"),
        ...data,
        status: "scheduled",
        paymentStatus: "unpaid",
        notes: data.notes ?? undefined,
        createdAt: new Date().toISOString(),
      };
      addPtSession(session);
      setSessions(getAllPtSessions());
      toast.success("Sesi PT berhasil dijadwalkan");
      setIsSubmitting(false);
      setFormOpen(false);
    }, 400);
  }

  function handleStatusChange(session: PtSession, status: PtSession["status"]) {
    const updated = { ...session, status };
    updatePtSession(updated);
    setSessions((prev) => prev.map((s) => (s.id === session.id ? updated : s)));
    toast.success("Status sesi diperbarui");
  }

  function handlePaymentToggle(session: PtSession) {
    const updated = {
      ...session,
      paymentStatus:
        session.paymentStatus === "paid"
          ? ("unpaid" as const)
          : ("paid" as const),
    };
    updatePtSession(updated);
    setSessions((prev) => prev.map((s) => (s.id === session.id ? updated : s)));
    toast.success(
      updated.paymentStatus === "paid"
        ? "Sesi ditandai lunas"
        : "Status pembayaran diubah ke belum bayar",
    );
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deletePtSession(deleteTarget.id);
    setSessions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    toast.success("Sesi dihapus");
    setDeleteTarget(null);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sesi PT</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Kelola semua jadwal sesi personal trainer
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Jadwalkan Sesi
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Terjadwal
                </p>
                <p className="text-3xl font-bold tracking-tight mt-1 text-blue-400">
                  {stats.scheduled}
                </p>
              </div>
              <CalendarDays className="h-5 w-5 text-blue-400/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Selesai
                </p>
                <p className="text-3xl font-bold tracking-tight mt-1 text-emerald-400">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-400/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Pendapatan PT
                </p>
                <p className="text-xl font-bold tracking-tight mt-1 text-primary">
                  {formatCurrency(stats.revenue)}
                </p>
              </div>
              <Banknote className="h-5 w-5 text-primary/40" />
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal & Waktu</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Durasi</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pembayaran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-12"
                  >
                    Tidak ada sesi
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {formatDate(session.date)}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {session.time} WIB
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {getTrainerName(session.trainerId)}
                  </TableCell>
                  <TableCell>{getUserName(session.clientId)}</TableCell>
                  <TableCell>{session.durationMinutes} mnt</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(session.price)}
                  </TableCell>
                  <TableCell>{statusBadge(session.status)}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handlePaymentToggle(session)}
                      title="Klik untuk ubah status pembayaran"
                    >
                      {paymentBadge(session.paymentStatus)}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {session.status === "scheduled" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-emerald-400 hover:bg-emerald-500/10 text-xs gap-1"
                            onClick={() =>
                              handleStatusChange(session, "completed")
                            }
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Selesai
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-muted-foreground hover:text-destructive text-xs gap-1"
                            onClick={() =>
                              handleStatusChange(session, "cancelled")
                            }
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Batal
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(session)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Session Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) setFormOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Jadwalkan Sesi PT</DialogTitle>
            <DialogDescription>
              Buat jadwal sesi personal trainer baru
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="trainerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trainer</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="">Pilih trainer...</option>
                          {trainers
                            .filter((t) => t.isActive)
                            .map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
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
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="">Pilih member...</option>
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                      <FormLabel>Waktu</FormLabel>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durasi (menit)</FormLabel>
                      <FormControl>
                        <select
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          {[30, 45, 60, 90, 120].map((d) => (
                            <option key={d} value={d}>
                              {d} menit
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga (Rp)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="150000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        placeholder="Catatan tambahan..."
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    "Jadwalkan Sesi"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Sesi?</DialogTitle>
            <DialogDescription>
              Sesi pada{" "}
              <strong>
                {deleteTarget?.date} {deleteTarget?.time}
              </strong>{" "}
              akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
