"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  UserSquare2,
  Plus,
  Pencil,
  Trash2,
  Star,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  getAllTrainers,
  addTrainer,
  updateTrainer,
  deleteTrainer,
  type Trainer,
} from "@/lib/mock/trainers";
import { trainerSchema, type TrainerInput } from "@/lib/validations";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminTrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>(() => getAllTrainers());
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Trainer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Trainer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCount = trainers.filter((t) => t.isActive).length;
  const totalSessions = trainers.reduce(
    (s, t) => s + t.totalSessionsCompleted,
    0,
  );

  const form = useForm<TrainerInput>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      name: "",
      specialtiesInput: "",
      description: "",
      pricePerSession: 0,
    },
  });

  function openAdd() {
    setEditTarget(null);
    form.reset({
      name: "",
      specialtiesInput: "",
      description: "",
      pricePerSession: 0,
    });
    setFormOpen(true);
  }

  function openEdit(trainer: Trainer) {
    setEditTarget(trainer);
    form.reset({
      name: trainer.name,
      specialtiesInput: trainer.specialties.join(", "),
      description: trainer.description,
      pricePerSession: trainer.pricePerSession,
    });
    setFormOpen(true);
  }

  function onSubmit(data: TrainerInput) {
    setIsSubmitting(true);
    setTimeout(() => {
      const specialties = data.specialtiesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (editTarget) {
        const updated: Trainer = {
          ...editTarget,
          name: data.name,
          specialties,
          description: data.description ?? "",
          pricePerSession: data.pricePerSession,
        };
        updateTrainer(updated);
        setTrainers((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t)),
        );
        toast.success("Data trainer berhasil diperbarui");
      } else {
        const trainer: Trainer = {
          id: generateId("trainer"),
          name: data.name,
          specialties,
          description: data.description ?? "",
          pricePerSession: data.pricePerSession,
          rating: 5.0,
          totalSessionsCompleted: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        addTrainer(trainer);
        setTrainers((prev) => [trainer, ...prev]);
        toast.success("Trainer baru berhasil ditambahkan");
      }
      setIsSubmitting(false);
      setFormOpen(false);
    }, 400);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteTrainer(deleteTarget.id);
    setTrainers((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    toast.success(`Trainer ${deleteTarget.name} dihapus`);
    setDeleteTarget(null);
  }

  function toggleActive(trainer: Trainer) {
    const updated = { ...trainer, isActive: !trainer.isActive };
    updateTrainer(updated);
    setTrainers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    toast.success(
      updated.isActive
        ? `${trainer.name} diaktifkan`
        : `${trainer.name} dinonaktifkan`,
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Personal Trainer
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Kelola data dan jadwal personal trainer
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          Tambah Trainer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Trainer
                </p>
                <p className="text-3xl font-bold tracking-tight mt-1">
                  {trainers.length}
                </p>
              </div>
              <UserSquare2 className="h-5 w-5 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Trainer Aktif
                </p>
                <p className="text-3xl font-bold tracking-tight mt-1 text-emerald-400">
                  {activeCount}
                </p>
              </div>
              <ToggleRight className="h-5 w-5 text-emerald-400/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Sesi Selesai
                </p>
                <p className="text-3xl font-bold tracking-tight mt-1">
                  {totalSessions}
                </p>
              </div>
              <Star className="h-5 w-5 text-amber-400/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trainer Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trainer</TableHead>
                <TableHead>Spesialisasi</TableHead>
                <TableHead>Harga / Sesi</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Sesi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-12"
                  >
                    Belum ada trainer
                  </TableCell>
                </TableRow>
              )}
              {trainers.map((trainer) => (
                <TableRow
                  key={trainer.id}
                  className={cn(!trainer.isActive && "opacity-50")}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{trainer.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {trainer.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {trainer.specialties.map((s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(trainer.pricePerSession)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold">
                        {trainer.rating.toFixed(1)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{trainer.totalSessionsCompleted}</TableCell>
                  <TableCell>
                    {trainer.isActive ? (
                      <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground"
                      >
                        Nonaktif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title={trainer.isActive ? "Nonaktifkan" : "Aktifkan"}
                        onClick={() => toggleActive(trainer)}
                      >
                        {trainer.isActive ? (
                          <ToggleRight className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(trainer)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(trainer)}
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

      {/* Add/Edit Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) setFormOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Trainer" : "Tambah Trainer Baru"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Perbarui informasi trainer"
                : "Isi data trainer baru"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Trainer</FormLabel>
                    <FormControl>
                      <Input placeholder="Ahmad Rizki" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialtiesInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spesialisasi</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Strength Training, HIIT, Cardio"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Pisahkan dengan koma
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Deskripsi{" "}
                      <span className="text-muted-foreground font-normal">
                        (opsional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={3}
                        placeholder="Pengalaman dan keahlian trainer..."
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerSession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga per Sesi (Rp)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="150000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                    "Tambah Trainer"
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
            <DialogTitle>Hapus Trainer?</DialogTitle>
            <DialogDescription>
              Data <strong>{deleteTarget?.name}</strong> akan dihapus permanen.
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
