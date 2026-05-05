"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Wrench,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Loader2,
  CalendarClock,
  MapPin,
} from "lucide-react";
import {
  getAllMaintenance,
  addMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceUrgency,
  type MaintenanceRecord,
  type MaintenanceStatus,
} from "@/lib/mock/maintenance";
import { maintenanceSchema, type MaintenanceInput } from "@/lib/validations";
import { formatDate, generateId, cn } from "@/lib/utils";
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

function StatusBadge({ status }: { status: MaintenanceStatus }) {
  switch (status) {
    case "scheduled":
      return (
        <Badge className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
          Terjadwal
        </Badge>
      );
    case "in_progress":
      return (
        <Badge className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20">
          Sedang Berlangsung
        </Badge>
      );
    case "completed":
      return (
        <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          Selesai
        </Badge>
      );
  }
}

function UrgencyIndicator({ record }: { record: MaintenanceRecord }) {
  const urgency = getMaintenanceUrgency(record);
  if (urgency === "overdue") {
    return (
      <div className="flex items-center gap-1 text-red-400 text-[11px] font-semibold">
        <AlertTriangle className="h-3 w-3" />
        Terlambat
      </div>
    );
  }
  if (urgency === "upcoming") {
    return (
      <div className="flex items-center gap-1 text-amber-400 text-[11px] font-semibold">
        <Clock className="h-3 w-3" />
        Segera
      </div>
    );
  }
  return null;
}

const STATUS_OPTIONS: { value: MaintenanceStatus; label: string }[] = [
  { value: "scheduled", label: "Terjadwal" },
  { value: "in_progress", label: "Sedang Berlangsung" },
  { value: "completed", label: "Selesai" },
];

export default function AdminMaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>(() =>
    getAllMaintenance(),
  );
  const [filterStatus, setFilterStatus] = useState<"all" | MaintenanceStatus>(
    "all",
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MaintenanceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaintenanceRecord | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stats = useMemo(() => {
    const overdue = records.filter(
      (r) => getMaintenanceUrgency(r) === "overdue",
    ).length;
    const upcoming = records.filter(
      (r) => getMaintenanceUrgency(r) === "upcoming",
    ).length;
    const completed = records.filter((r) => r.status === "completed").length;
    const inProgress = records.filter((r) => r.status === "in_progress").length;
    return { overdue, upcoming, completed, inProgress };
  }, [records]);

  const filtered = useMemo(
    () =>
      filterStatus === "all"
        ? records
        : records.filter((r) => r.status === filterStatus),
    [records, filterStatus],
  );

  const form = useForm<MaintenanceInput>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      equipmentName: "",
      location: "",
      scheduledDate: "",
      notes: "",
    },
  });

  function openAdd() {
    setEditTarget(null);
    form.reset({
      equipmentName: "",
      location: "",
      scheduledDate: "",
      notes: "",
    });
    setFormOpen(true);
  }

  function openEdit(record: MaintenanceRecord) {
    setEditTarget(record);
    form.reset({
      equipmentName: record.equipmentName,
      location: record.location ?? "",
      scheduledDate: record.scheduledDate,
      notes: record.notes ?? "",
    });
    setFormOpen(true);
  }

  function onSubmit(data: MaintenanceInput) {
    setIsSubmitting(true);
    setTimeout(() => {
      if (editTarget) {
        const updated: MaintenanceRecord = {
          ...editTarget,
          equipmentName: data.equipmentName,
          location: data.location ?? undefined,
          scheduledDate: data.scheduledDate,
          notes: data.notes ?? undefined,
        };
        updateMaintenance(updated);
        setRecords(getAllMaintenance());
        toast.success("Jadwal maintenance diperbarui");
      } else {
        const record: MaintenanceRecord = {
          id: generateId("maint"),
          equipmentName: data.equipmentName,
          location: data.location ?? undefined,
          scheduledDate: data.scheduledDate,
          status: "scheduled",
          notes: data.notes ?? undefined,
          createdAt: new Date().toISOString(),
        };
        addMaintenance(record);
        setRecords(getAllMaintenance());
        toast.success("Jadwal maintenance ditambahkan");
      }
      setIsSubmitting(false);
      setFormOpen(false);
    }, 400);
  }

  function handleStatusChange(
    record: MaintenanceRecord,
    status: MaintenanceStatus,
  ) {
    const updated = { ...record, status };
    updateMaintenance(updated);
    setRecords(getAllMaintenance());
    toast.success("Status maintenance diperbarui");
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMaintenance(deleteTarget.id);
    setRecords(getAllMaintenance());
    toast.success("Jadwal dihapus");
    setDeleteTarget(null);
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Maintenance Alat
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Kelola jadwal perawatan dan servis peralatan gym
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Tambah Jadwal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className={cn(stats.overdue > 0 && "border-red-500/30")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                  stats.overdue > 0 ? "bg-red-500/15" : "bg-muted/40",
                )}
              >
                <AlertTriangle
                  className={cn(
                    "h-4 w-4",
                    stats.overdue > 0
                      ? "text-red-400"
                      : "text-muted-foreground/40",
                  )}
                />
              </div>
              <div>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    stats.overdue > 0 && "text-red-400",
                  )}
                >
                  {stats.overdue}
                </p>
                <p className="text-[11px] text-muted-foreground">Terlambat</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(stats.upcoming > 0 && "border-amber-500/20")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                <CalendarClock className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">
                  {stats.upcoming}
                </p>
                <p className="text-[11px] text-muted-foreground">Segera</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                <Loader2 className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-[11px] text-muted-foreground">Berlangsung</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-[11px] text-muted-foreground">Selesai</p>
              </div>
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
            { key: "in_progress", label: "Berlangsung" },
            { key: "completed", label: "Selesai" },
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
                {records.filter((r) => r.status === key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Wrench className="h-10 w-10 text-muted-foreground/20 mb-3" />
            <p className="text-muted-foreground text-sm">
              Tidak ada jadwal maintenance
            </p>
          </div>
        )}

        {filtered.map((record) => {
          const urgency = getMaintenanceUrgency(record);
          return (
            <Card
              key={record.id}
              className={cn(
                "transition-all duration-150",
                urgency === "overdue" && "border-red-500/30 bg-red-500/3",
                urgency === "upcoming" && "border-amber-500/20 bg-amber-500/3",
                record.status === "in_progress" &&
                  urgency === "normal" &&
                  "border-blue-500/20",
              )}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  {/* Status icon column */}
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      record.status === "completed"
                        ? "bg-emerald-500/10"
                        : record.status === "in_progress"
                          ? "bg-blue-500/10"
                          : urgency === "overdue"
                            ? "bg-red-500/10"
                            : urgency === "upcoming"
                              ? "bg-amber-500/10"
                              : "bg-muted/40",
                    )}
                  >
                    {record.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : record.status === "in_progress" ? (
                      <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                    ) : urgency === "overdue" ? (
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    ) : (
                      <Wrench className="h-5 w-5 text-muted-foreground/60" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="font-semibold">{record.equipmentName}</h3>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={record.status} />
                        <UrgencyIndicator record={record} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        {formatDate(record.scheduledDate)}
                      </span>
                      {record.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {record.location}
                        </span>
                      )}
                    </div>

                    {record.notes && (
                      <p className="text-xs text-muted-foreground">
                        {record.notes}
                      </p>
                    )}

                    {/* Quick status update */}
                    {record.status !== "completed" && (
                      <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                        {record.status === "scheduled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-xs gap-1 text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                            onClick={() =>
                              handleStatusChange(record, "in_progress")
                            }
                          >
                            <Loader2 className="h-3 w-3" />
                            Mulai
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs gap-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                          onClick={() =>
                            handleStatusChange(record, "completed")
                          }
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Tandai Selesai
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(record)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(record)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) setFormOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTarget
                ? "Edit Jadwal Maintenance"
                : "Tambah Jadwal Maintenance"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Perbarui detail jadwal maintenance"
                : "Buat jadwal maintenance baru"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="equipmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Alat</FormLabel>
                    <FormControl>
                      <Input placeholder="Treadmill #1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Lokasi{" "}
                      <span className="text-muted-foreground font-normal">
                        (opsional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Cardio Area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Maintenance</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                        rows={3}
                        placeholder="Deskripsi pekerjaan maintenance..."
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
                  ) : editTarget ? (
                    "Simpan Perubahan"
                  ) : (
                    "Tambah Jadwal"
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
            <DialogTitle>Hapus Jadwal?</DialogTitle>
            <DialogDescription>
              Jadwal maintenance <strong>{deleteTarget?.equipmentName}</strong>{" "}
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
