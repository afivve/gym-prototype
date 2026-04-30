"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dumbbell, Users, Clock, Search, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORY_COLORS: Record<string, string> = {
  Yoga: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  Zumba: "border-pink-500/30 bg-pink-500/10 text-pink-400",
  "Personal Training": "border-sky-500/30 bg-sky-500/10 text-sky-400",
  HIIT: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  Pilates: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Kickboxing: "border-red-500/30 bg-red-500/10 text-red-400",
};

export default function ClassesPage() {
  const { currentUser } = useAuth();
  const { classes, bookClass, cancelBooking, getUserBookings } = useApp();
  const [search, setSearch] = useState("");
  const [loadingClassId, setLoadingClassId] = useState<string | null>(null);

  if (!currentUser) return null;

  const userBookings = getUserBookings(currentUser.id);
  const bookedClassIds = new Set(
    userBookings.filter((b) => b.status === "confirmed").map((b) => b.classId),
  );

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase()),
  );

  const handleBooking = async (classId: string) => {
    setLoadingClassId(classId);
    await new Promise((r) => setTimeout(r, 600));
    const result = bookClass(currentUser.id, classId);
    setLoadingClassId(null);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  };

  const handleCancel = async (classId: string) => {
    const booking = userBookings.find(
      (b) => b.classId === classId && b.status === "confirmed",
    );
    if (!booking) return;
    setLoadingClassId(classId);
    await new Promise((r) => setTimeout(r, 400));
    cancelBooking(booking.id);
    setLoadingClassId(null);
    toast.success("Booking dibatalkan");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Booking Kelas</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Pilih dan booking kelas fitness favorit Anda
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kelas, instruktur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>{filteredClasses.length} kelas tersedia</span>
        <span>·</span>
        <span>{bookedClassIds.size} kelas dibooking</span>
      </div>

      {/* Class grid */}
      {filteredClasses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Dumbbell className="h-10 w-10 text-muted-foreground/20 mb-4" />
          <p className="font-medium text-muted-foreground">
            Kelas tidak ditemukan
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Coba kata kunci lain
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredClasses.map((gymClass) => {
            const isBooked = bookedClassIds.has(gymClass.id);
            const isFull = gymClass.bookedCount >= gymClass.quota;
            const isLoading = loadingClassId === gymClass.id;
            const availableSlots = gymClass.quota - gymClass.bookedCount;
            const filledPct = (gymClass.bookedCount / gymClass.quota) * 100;
            const categoryColor =
              CATEGORY_COLORS[gymClass.category] ??
              "border-border bg-muted text-muted-foreground";

            return (
              <Card
                key={gymClass.id}
                className={cn(
                  "flex flex-col transition-all duration-200",
                  isBooked && "border-primary/30",
                )}
              >
                <CardContent className="flex-1 p-5 space-y-4">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold leading-tight">
                        {gymClass.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {gymClass.instructor}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 text-xs border", categoryColor)}
                    >
                      {gymClass.category}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {gymClass.description}
                  </p>

                  {/* Meta */}
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{gymClass.scheduleDay}</span>
                      <span className="font-medium text-foreground">
                        {gymClass.scheduleTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {gymClass.bookedCount}/{gymClass.quota} peserta
                      </span>
                      {isFull ? (
                        <Badge
                          variant="destructive"
                          className="text-[10px] ml-auto"
                        >
                          Penuh
                        </Badge>
                      ) : (
                        <span
                          className={cn(
                            "text-xs ml-auto font-medium",
                            availableSlots <= 3
                              ? "text-amber-400"
                              : "text-emerald-400",
                          )}
                        >
                          {availableSlots} slot
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quota bar */}
                  <div className="w-full bg-muted rounded-full h-1">
                    <div
                      className={cn(
                        "h-1 rounded-full transition-all",
                        isFull
                          ? "bg-destructive"
                          : availableSlots <= 3
                            ? "bg-amber-500"
                            : "bg-emerald-500",
                      )}
                      style={{ width: `${filledPct}%` }}
                    />
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0">
                  {isBooked ? (
                    <div className="flex w-full gap-2">
                      <div className="flex-1 flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium text-emerald-400">
                          Dibooking
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(gymClass.id)}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        {isLoading ? "..." : "Batal"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleBooking(gymClass.id)}
                      disabled={isFull || isLoading}
                      variant={isFull ? "secondary" : "default"}
                    >
                      {isLoading ? (
                        <>
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                          Memproses...
                        </>
                      ) : isFull ? (
                        "Kuota Penuh"
                      ) : (
                        "Book Kelas"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
