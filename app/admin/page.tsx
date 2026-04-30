"use client";

import Link from "next/link";
import {
  Users,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { users, memberships, checkIns, bookings } = useApp();

  const members = users.filter((u) => u.role === "member");
  const activeMemberships = memberships.filter((m) => m.status === "active");
  const pendingMemberships = memberships.filter((m) => m.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

  const today = new Date().toDateString();
  const todayCheckIns = checkIns.filter(
    (ci) => new Date(ci.checkedInAt).toDateString() === today,
  );

  const stats = [
    {
      title: "Total Member",
      value: members.length,
      sub: "Member terdaftar",
      icon: Users,
      href: "/admin/members",
    },
    {
      title: "Membership Aktif",
      value: activeMemberships.length,
      sub: `${pendingMemberships.length} menunggu konfirmasi`,
      icon: CreditCard,
      href: "/admin/members",
    },
    {
      title: "Check-in Hari Ini",
      value: todayCheckIns.length,
      sub: `Total ${checkIns.length} kunjungan`,
      icon: CheckCircle2,
      href: "/admin/checkins",
    },
    {
      title: "Total Booking",
      value: confirmedBookings.length,
      sub: "Booking terkonfirmasi",
      icon: BookOpen,
      href: "/admin/bookings",
    },
  ];

  const recentCheckIns = [...checkIns]
    .sort(
      (a, b) =>
        new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Ringkasan aktivitas GymPro hari ini
        </p>
      </div>

      {/* Pending alert */}
      {pendingMemberships.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-amber-300 text-sm">
                {pendingMemberships.length} membership menunggu konfirmasi
              </p>
              <p className="text-xs text-amber-400/70 mt-0.5">
                Segera approve pembayaran member
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link href="/admin/members">Lihat Sekarang</Link>
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href} className="block">
              <Card className="hover:border-border/80 transition-colors cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold tracking-tight">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.sub}
                      </p>
                    </div>
                    <Icon className="h-5 w-5 text-muted-foreground/40 mt-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent check-ins */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold">Check-in Terbaru</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            {recentCheckIns.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Belum ada check-in
              </div>
            ) : (
              <div className="space-y-1">
                {recentCheckIns.map((ci) => {
                  const user = users.find((u) => u.id === ci.userId);
                  return (
                    <div
                      key={ci.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {user?.name ?? "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDateTime(ci.checkedInAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {ci.method === "qr" ? "QR" : "Manual"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
            <Button
              variant="link"
              size="sm"
              asChild
              className="mt-3 px-0 h-auto text-xs"
            >
              <Link href="/admin/checkins">Lihat semua check-in →</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pending memberships */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold">Membership Pending</span>
              <AlertCircle className="h-4 w-4 text-amber-400" />
            </div>
            {pendingMemberships.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Tidak ada pembayaran pending
              </div>
            ) : (
              <div className="space-y-1">
                {pendingMemberships.slice(0, 5).map((m) => {
                  const user = users.find((u) => u.id === m.userId);
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {user?.name ?? "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Paket{" "}
                            {m.plan === "monthly" ? "Bulanan" : "Mingguan"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="pending">Pending</Badge>
                    </div>
                  );
                })}
              </div>
            )}
            <Button
              variant="link"
              size="sm"
              asChild
              className="mt-3 px-0 h-auto text-xs"
            >
              <Link href="/admin/members">Kelola membership →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
