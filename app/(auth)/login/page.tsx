"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Flame, LogIn } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { useAuth } from "@/contexts/auth-context";
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

export default function LoginPage() {
  const { login, currentUser, isLoading } = useAuth();
  const router = useRouter();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentUser.role === "admin") router.replace("/admin");
      else router.replace("/dashboard");
    }
  }, [currentUser, isLoading, router]);

  const onSubmit = (data: LoginInput) => {
    const result = login(data.email, data.password);
    if (result.success) {
      toast.success("Login berhasil! Selamat datang kembali.");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-card border-r border-border p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Flame className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">GymPro</span>
        </div>
        <div className="space-y-4">
          <p className="text-4xl font-bold leading-tight tracking-tight">
            Train harder.
            <br />
            Track smarter.
            <br />
            <span className="text-primary">Perform better.</span>
          </p>
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
            Platform manajemen gym modern untuk member dan trainer. Kelola
            membership, booking kelas, dan check-in dalam satu tempat.
          </p>
        </div>
        <p className="text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} GymPro. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Flame className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight">GymPro</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Selamat datang kembali
            </h1>
            <p className="text-sm text-muted-foreground">
              Masuk ke akun GymPro Anda
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Masukkan password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={form.formState.isSubmitting}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Masuk
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Demo Credentials
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Admin</span>
                <code className="text-foreground/80 text-right">
                  admin@gymprototype.com / admin123
                </code>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Member</span>
                <code className="text-foreground/80 text-right">
                  member@gymprototype.com / member123
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
