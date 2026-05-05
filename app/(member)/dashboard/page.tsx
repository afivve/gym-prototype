"use client";

import Link from "next/link";
import {
  CreditCard,
  QrCode,
  Dumbbell,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
  UserCircle,
  Camera,
  ClipboardList,
  CalendarCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useApp } from "@/contexts/app-context";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { getUserMembership, getUserCheckIns, getUserBookings, classes } =
    useApp();

  if (!currentUser) return null;

  const membership = getUserMembership(currentUser.id);
  const checkIns = getUserCheckIns(currentUser.id);
  const bookings = getUserBookings(currentUser.id);
  const activeBookings = bookings.filter((b) => b.status === "confirmed");
  const recentCheckIns = checkIns.slice(0, 5);

  const stats = [
    {
      title: "Status Membership",
      value: membership
        ? membership.status === "active"
          ? "Aktif"
          : membership.status === "pending"
            ? "Pending"
            : "Expired"
        : "Tidak Ada",
      description: membership
        ? `Paket ${membership.plan === "monthly" ? "Bulanan" : "Mingguan"} — ${formatCurrency(membership.price)}`
        : "Belum berlangganan",
      icon: CreditCard,
      href: "/membership",
      accent:
        membership?.status === "active"
          ? "text-emerald-400"
          : "text-muted-foreground",
    },
    {
      title: "Total Check-in",
      value: checkIns.length.toString(),
      description: "Kunjungan keseluruhan",
      icon: CheckCircle2,
      href: "/checkin",
      accent: "text-primary",
    },
    {
      title: "Kelas Aktif",
      value: activeBookings.length.toString(),
      description: "Booking terkonfirmasi",
      icon: Dumbbell,
      href: "/classes",
      accent: "text-amber-400",
    },
    {
      title: "Check-in Terakhir",
      value: recentCheckIns[0]
        ? formatDateTime(recentCheckIns[0].checkedInAt).split(",")[0]
        : "—",
      description: recentCheckIns[0]
        ? formatDateTime(recentCheckIns[0].checkedInAt)
        : "Belum pernah check-in",
      icon: Clock,
      href: "/checkin",
      accent: "text-muted-foreground",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Halo, {currentUser.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/workouts/new">
              <ClipboardList className="h-4 w-4" />
              Workout
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/progress">
              <TrendingUp className="h-4 w-4" />
              Progress
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/progress-photos">
              <Camera className="h-4 w-4" />
              Foto
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/consistency">
              <CalendarCheck className="h-4 w-4" />
              Konsistensi
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/profile">
              <UserCircle className="h-4 w-4" />
              Profil Saya
            </Link>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {!membership && (
        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-5 py-4">
          <div>
            <p className="font-semibold text-sm text-foreground">
              Belum ada membership aktif
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Aktifkan membership untuk akses penuh ke semua fasilitas
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/membership">Aktifkan Sekarang</Link>
          </Button>
        </div>
      )}

      {membership?.status === "pending" && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-5 py-4">
          <div>
            <p className="font-semibold text-sm text-amber-400">
              Pembayaran menunggu konfirmasi
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Admin akan segera memverifikasi pembayaran Anda
            </p>
          </div>
          <Badge variant="pending">Pending</Badge>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="group hover:border-border transition-all duration-200 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <Icon className={`h-4 w-4 ${stat.accent}`} />
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-tight">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent check-ins */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Riwayat Check-in
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  5 kunjungan terakhir
                </CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentCheckIns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <QrCode className="h-8 w-8 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  Belum ada riwayat check-in
                </p>
                <Button
                  variant="link"
                  asChild
                  className="mt-1 text-xs h-auto p-0"
                >
                  <Link href="/checkin">Check-in sekarang</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {recentCheckIns.map((ci) => (
                  <div
                    key={ci.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-sm text-foreground">
                        {formatDateTime(ci.checkedInAt)}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {ci.method === "qr" ? "QR" : "Manual"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active bookings */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Booking Kelas Aktif
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Kelas yang sudah dipesan
                </CardDescription>
              </div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {activeBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Dumbbell className="h-8 w-8 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  Belum ada booking kelas
                </p>
                <Button
                  variant="link"
                  asChild
                  className="mt-1 text-xs h-auto p-0"
                >
                  <Link href="/classes">Lihat kelas tersedia</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {activeBookings.slice(0, 5).map((booking) => {
                  const gymClass = classes.find(
                    (c) => c.id === booking.classId,
                  );
                  if (!gymClass) return null;
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent/50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{gymClass.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {gymClass.instructor}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {gymClass.scheduleTime}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
