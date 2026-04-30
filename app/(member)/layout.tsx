"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { MemberSidebar } from "@/components/layout/member-sidebar";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!currentUser) {
      router.replace("/login");
    } else if (currentUser.role === "admin") {
      router.replace("/admin");
    }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "member") return null;

  return (
    <div className="flex min-h-screen bg-background">
      <MemberSidebar />
      <main className="flex-1 lg:pl-64">
        <div className="pt-16 lg:pt-0">{children}</div>
      </main>
    </div>
  );
}
