"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Search,
} from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminMembersPage() {
  const { users, memberships, approveMembership, getUserMembership } = useApp();
  const [search, setSearch] = useState("");
  const [approveTarget, setApproveTarget] = useState<{
    membershipId: string;
    memberName: string;
  } | null>(null);

  const members = users.filter((u) => u.role === "member");

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search),
  );

  const handleApprove = () => {
    if (!approveTarget) return;
    approveMembership(approveTarget.membershipId);
    toast.success(
      `Membership ${approveTarget.memberName} berhasil diaktifkan!`,
    );
    setApproveTarget(null);
  };

  const getMembershipBadge = (status?: string) => {
    if (!status)
      return (
        <Badge variant="outline" className="text-xs">
          Tidak Ada
        </Badge>
      );
    if (status === "active") return <Badge variant="active">Aktif</Badge>;
    if (status === "pending") return <Badge variant="pending">Pending</Badge>;
    if (status === "expired")
      return <Badge variant="expired">Kadaluarsa</Badge>;
    return (
      <Badge variant="outline" className="text-xs">
        {status}
      </Badge>
    );
  };

  const pendingCount = memberships.filter((m) => m.status === "pending").length;
  const activeCount = memberships.filter((m) => m.status === "active").length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Member</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Kelola semua member dan status membership
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Member
                </p>
                <p className="text-3xl font-bold tracking-tight mt-1">
                  {members.length}
                </p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground/40" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Membership Aktif
                </p>
                <p className="text-3xl font-bold tracking-tight mt-1">
                  {activeCount}
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
                  Menunggu Konfirmasi
                </p>
                <p className="text-3xl font-bold tracking-tight mt-1">
                  {pendingCount}
                </p>
              </div>
              <AlertCircle className="h-5 w-5 text-amber-400/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + table */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold">Daftar Member</span>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="hidden sm:table-cell">Kontak</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Berakhir</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Tidak ada member ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => {
                  const membership = getUserMembership(member.id);
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {member.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {member.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {membership ? (
                          <span className="text-sm">
                            {membership.plan === "monthly"
                              ? "Bulanan"
                              : "Mingguan"}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getMembershipBadge(membership?.status)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {membership ? formatDate(membership.endDate) : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {membership?.status === "pending" ? (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() =>
                              setApproveTarget({
                                membershipId: membership.id,
                                memberName: member.name,
                              })
                            }
                          >
                            Approve
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
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

      {/* Confirm approve dialog */}
      <Dialog
        open={!!approveTarget}
        onOpenChange={() => setApproveTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Approve Membership</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengaktifkan membership untuk{" "}
              <strong>{approveTarget?.memberName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>
              Batal
            </Button>
            <Button variant="success" onClick={handleApprove}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
