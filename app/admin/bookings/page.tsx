"use client";

import { useState } from "react";
import { BookOpen, Users, Search, X, CheckCircle2 } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminBookingsPage() {
  const { bookings, users, classes } = useApp();
  const [search, setSearch] = useState("");

  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed",
  ).length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === "cancelled",
  ).length;

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime(),
  );

  const filteredBookings = sortedBookings.filter((b) => {
    const user = users.find((u) => u.id === b.userId);
    const gymClass = classes.find((c) => c.id === b.classId);
    const q = search.toLowerCase();
    return (
      user?.name.toLowerCase().includes(q) ||
      user?.email.toLowerCase().includes(q) ||
      gymClass?.name.toLowerCase().includes(q) ||
      gymClass?.category.toLowerCase().includes(q)
    );
  });

  const classStats = classes.map((c) => ({
    ...c,
    bookingCount: bookings.filter(
      (b) => b.classId === c.id && b.status === "confirmed",
    ).length,
  }));

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Booking Kelas</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Monitor semua booking kelas member
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Booking
                </p>
                <p className="text-3xl font-bold tracking-tight mt-1">
                  {bookings.length}
                </p>
              </div>
              <BookOpen className="h-5 w-5 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Terkonfirmasi
                </p>
                <p className="text-3xl font-bold tracking-tight mt-1">
                  {confirmedBookings}
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-500/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Dibatalkan
                </p>
                <p className="text-3xl font-bold tracking-tight mt-1">
                  {cancelledBookings}
                </p>
              </div>
              <X className="h-5 w-5 text-destructive/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Class quota overview */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Ringkasan Kelas</span>
            </div>
            <div className="space-y-3">
              {classStats.map((c) => {
                const pct = Math.min((c.bookedCount / c.quota) * 100, 100);
                const isFull = c.bookedCount >= c.quota;
                const isHigh = c.bookedCount / c.quota > 0.7;
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{c.name}</span>
                      <span className="text-muted-foreground shrink-0 ml-2 text-xs">
                        {c.bookedCount}/{c.quota}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div
                        className={cn(
                          "h-1 rounded-full transition-all",
                          isFull
                            ? "bg-destructive"
                            : isHigh
                              ? "bg-amber-500"
                              : "bg-emerald-500",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bookings table */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold">
                Semua Booking
                <span className="text-muted-foreground font-normal ml-2 text-xs">
                  ({filteredBookings.length})
                </span>
              </span>
              <div className="relative w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 text-sm"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Waktu Booking</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Tidak ada booking ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const user = users.find((u) => u.id === booking.userId);
                    const gymClass = classes.find(
                      (c) => c.id === booking.classId,
                    );
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {user?.name ?? "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user?.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">
                              {gymClass?.name ?? "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {gymClass?.scheduleTime}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(booking.bookedAt)}
                        </TableCell>
                        <TableCell>
                          {booking.status === "confirmed" ? (
                            <Badge variant="active">Terkonfirmasi</Badge>
                          ) : (
                            <Badge variant="expired">Dibatalkan</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
