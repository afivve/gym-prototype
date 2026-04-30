"use client";

import { useState } from "react";
import { toast } from "sonner";
import { QrCode, CheckCircle2, Info, Clock } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useApp } from "@/contexts/app-context";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Lazy-import QRCodeSVG to avoid SSR issues
import dynamic from "next/dynamic";
const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeSVG),
  {
    ssr: false,
    loading: () => <div className="h-48 w-48 animate-pulse bg-muted rounded" />,
  },
);

export default function CheckInPage() {
  const { currentUser } = useAuth();
  const { getUserCheckIns, checkIn } = useApp();
  const [isChecking, setIsChecking] = useState(false);

  if (!currentUser) return null;

  const checkIns = getUserCheckIns(currentUser.id);

  const qrData = JSON.stringify({
    id: currentUser.id,
    email: currentUser.email,
    name: currentUser.name,
    type: "gym-checkin",
  });

  const handleSelfCheckIn = async () => {
    setIsChecking(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = checkIn(currentUser.id, "qr");
    setIsChecking(false);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">QR Check-in</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Tunjukkan QR code ini kepada staff atau lakukan check-in mandiri
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code card */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center gap-6">
            {/* QR container */}
            <div className="rounded-xl border border-border p-5 bg-white shadow-sm">
              <QRCodeSVG
                value={qrData}
                size={180}
                level="H"
                includeMargin={false}
                fgColor="#09090b"
              />
            </div>

            <div className="text-center space-y-1.5 w-full">
              <p className="font-semibold text-foreground">
                {currentUser.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentUser.email}
              </p>
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-mono text-muted-foreground">
                <QrCode className="h-3 w-3" />
                {currentUser.id.split("-").slice(-1)[0]}
              </div>
            </div>

            <div className="w-full space-y-2">
              <Button
                className="w-full"
                size="lg"
                onClick={handleSelfCheckIn}
                disabled={isChecking}
              >
                {isChecking ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Check-in Sekarang
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground/60">
                Simulasi check-in mandiri — di gym sungguhan, QR di-scan oleh
                staff
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          {/* How to use */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Cara Penggunaan</span>
              </div>
              <ol className="space-y-3">
                {[
                  "Tunjukkan QR code kepada staff di meja resepsionis",
                  "Staff akan men-scan QR code menggunakan perangkat admin",
                  "Sistem mencatat waktu kedatangan Anda secara otomatis",
                  "Atau klik tombol di atas untuk simulasi check-in mandiri",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground leading-tight">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Recent check-ins */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold">Riwayat Check-in</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              {checkIns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Belum ada riwayat check-in
                  </p>
                </div>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto -mx-1">
                  {checkIns.map((ci) => (
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
                      <Badge variant="outline" className="text-xs shrink-0">
                        {ci.method === "qr" ? "QR" : "Manual"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
