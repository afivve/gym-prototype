"use client";

import { useState } from "react";
import { toast } from "sonner";
import { QrCode, Search, CheckCircle2, Plus } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkinSchema, type CheckinInput } from "@/lib/validations";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function AdminCheckInsPage() {
  const { checkIns, users, findUserByEmailOrId, checkIn } = useApp();
  const [search, setSearch] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const form = useForm<CheckinInput>({
    resolver: zodResolver(checkinSchema),
    defaultValues: { emailOrId: "" },
  });

  const today = new Date().toDateString();
  const todayCheckIns = checkIns.filter(
    (ci) => new Date(ci.checkedInAt).toDateString() === today,
  );
  const qrCheckIns = checkIns.filter((ci) => ci.method === "qr").length;

  const sortedCheckIns = [...checkIns].sort(
    (a, b) =>
      new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime(),
  );

  const filteredCheckIns = sortedCheckIns.filter((ci) => {
    const user = users.find((u) => u.id === ci.userId);
    if (!user) return false;
    return (
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleManualCheckIn = async (data: CheckinInput) => {
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 800));
    const user = findUserByEmailOrId(data.emailOrId);
    if (!user) {
      toast.error("Member tidak ditemukan. Periksa email atau ID.");
      setIsScanning(false);
      return;
    }
    if (user.role === "admin") {
      toast.error("Admin tidak dapat di-check-in sebagai member");
      setIsScanning(false);
      return;
    }
    const result = checkIn(user.id, "manual");
    setIsScanning(false);
    if (result.success) {
      toast.success(`${user.name} berhasil check-in!`);
      form.reset();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log Check-in</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Kelola dan monitor kunjungan member
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Check-in
                </p>
                <p className="text-3xl font-bold tracking-tight mt-1">
                  {checkIns.length}
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Hari Ini
                </p>
                <p className="text-3xl font-bold tracking-tight mt-1">
                  {todayCheckIns.length}
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
                  Via QR Code
                </p>
                <p className="text-3xl font-bold tracking-tight mt-1">
                  {qrCheckIns}
                </p>
              </div>
              <QrCode className="h-5 w-5 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Manual check-in form */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Check-in Manual</span>
            </div>
            <p className="text-xs text-muted-foreground -mt-1">
              Masukkan email atau ID member untuk check-in
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleManualCheckIn)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="emailOrId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Email atau ID Member
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@example.com atau user-id"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isScanning}>
                  {isScanning ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Proses Check-in
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Quick member list */}
            <div className="pt-2 border-t border-border/40 space-y-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Demo Member:
              </p>
              {users
                .filter((u) => u.role === "member")
                .map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className="w-full text-left text-xs px-3 py-2 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => form.setValue("emailOrId", u.email)}
                  >
                    <span className="font-medium text-foreground">
                      {u.name}
                    </span>
                    <span className="ml-2">{u.email}</span>
                  </button>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Check-in table */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold">
                Riwayat Check-in
                <span className="text-muted-foreground font-normal ml-2 text-xs">
                  ({filteredCheckIns.length})
                </span>
              </span>
              <div className="relative w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari member..."
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
                  <TableHead>Waktu</TableHead>
                  <TableHead>Metode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCheckIns.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-10 text-muted-foreground"
                    >
                      Tidak ada data check-in
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCheckIns.map((ci) => {
                    const user = users.find((u) => u.id === ci.userId);
                    return (
                      <TableRow key={ci.id}>
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
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(ci.checkedInAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={ci.method === "qr" ? "default" : "outline"}
                            className="text-xs"
                          >
                            {ci.method === "qr" ? "QR" : "Manual"}
                          </Badge>
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
