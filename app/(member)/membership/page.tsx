"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
} from "lucide-react";
import { MEMBERSHIP_PLANS } from "@/lib/mock/memberships";
import { useAuth } from "@/contexts/auth-context";
import { useApp } from "@/contexts/app-context";
import { formatCurrency, formatDate } from "@/lib/utils";
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
import { cn } from "@/lib/utils";

export default function MembershipPage() {
  const { currentUser } = useAuth();
  const { getUserMembership, activateMembership } = useApp();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly" | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  if (!currentUser) return null;
  const currentMembership = getUserMembership(currentUser.id);

  const handleSelectPlan = (plan: "weekly" | "monthly") => {
    setSelectedPlan(plan);
    setConfirmOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan || !currentUser) return;
    setIsProcessing(true);
    // Simulate payment processing delay
    await new Promise((r) => setTimeout(r, 1500));
    const result = activateMembership(currentUser.id, selectedPlan);
    setIsProcessing(false);
    setConfirmOpen(false);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Membership</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Kelola paket membership Anda
        </p>
      </div>

      {/* Current membership status */}
      {currentMembership && (
        <Card
          className={cn(
            "border",
            currentMembership.status === "active" &&
              "border-emerald-500/20 bg-emerald-500/5",
            currentMembership.status === "pending" &&
              "border-amber-500/20 bg-amber-500/5",
            currentMembership.status === "expired" &&
              "border-border bg-muted/30",
          )}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">
                    Status Membership Saat Ini
                  </span>
                  {currentMembership.status === "active" && (
                    <Badge variant="active">Aktif</Badge>
                  )}
                  {currentMembership.status === "pending" && (
                    <Badge variant="pending">Menunggu Konfirmasi</Badge>
                  )}
                  {currentMembership.status === "expired" && (
                    <Badge variant="expired">Kadaluarsa</Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Paket
                    </p>
                    <p className="font-medium">
                      {currentMembership.plan === "monthly"
                        ? "Bulanan"
                        : "Mingguan"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Harga
                    </p>
                    <p className="font-medium">
                      {formatCurrency(currentMembership.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Mulai
                    </p>
                    <p className="font-medium">
                      {formatDate(currentMembership.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Berakhir
                    </p>
                    <p className="font-medium">
                      {formatDate(currentMembership.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {currentMembership.status === "pending" && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 border-t border-amber-500/20 pt-3">
                <Clock className="h-3.5 w-3.5" />
                Menunggu konfirmasi pembayaran dari admin
              </div>
            )}
            {currentMembership.status === "active" && (
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 border-t border-emerald-500/20 pt-3">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Membership aktif, nikmati semua fasilitas gym!
              </div>
            )}
            {currentMembership.status === "expired" && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
                <AlertCircle className="h-3.5 w-3.5" />
                Membership sudah berakhir — perpanjang paket di bawah ini
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Plan selection */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold">Pilih Paket Membership</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Fleksibel sesuai kebutuhan latihan Anda
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.values(MEMBERSHIP_PLANS).map((plan) => (
            <Card
              key={plan.key}
              className={cn(
                "relative overflow-hidden transition-all duration-200 hover:border-border",
                plan.popular && "border-primary/40",
              )}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-1 text-[11px] font-semibold text-primary">
                    <Zap className="h-3 w-3" />
                    Terpopuler
                  </span>
                </div>
              )}
              <CardContent className="p-6 space-y-5">
                <div>
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {plan.description}
                  </p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    /{plan.durationDays} hari
                  </span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  onClick={() => handleSelectPlan(plan.key)}
                  disabled={currentMembership?.status === "pending"}
                >
                  {currentMembership?.status === "active"
                    ? "Perpanjang Paket"
                    : "Aktifkan Membership"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
            <DialogDescription>
              Simulasi pembayaran membership. Dalam aplikasi nyata, ini akan
              terhubung ke payment gateway.
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paket</span>
                  <span className="font-medium">
                    {MEMBERSHIP_PLANS[selectedPlan].name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Durasi</span>
                  <span className="font-medium">
                    {MEMBERSHIP_PLANS[selectedPlan].durationDays} hari
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-border pt-3">
                  <span>Total Pembayaran</span>
                  <span className="text-primary">
                    {formatCurrency(MEMBERSHIP_PLANS[selectedPlan].price)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Setelah pembayaran, status akan menjadi <strong>pending</strong>{" "}
                hingga dikonfirmasi oleh admin.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button onClick={handleConfirmPayment} disabled={isProcessing}>
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memproses...
                </span>
              ) : (
                "Bayar Sekarang"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
