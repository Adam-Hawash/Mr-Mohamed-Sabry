"use client";

import { useState } from "react";
import { ArrowRight, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Emblem, OrnamentDivider } from "./Ornaments";

export function AdminLoginView({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        onSuccess();
      } else {
        setError(data.error || "بيانات الدخول غير صحيحة");
      }
    } catch {
      setError("تعذّر الاتصال بالخادم — حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-background px-4 py-16">
      {/* لمسة خلفية هادئة — تدرج بيج خفيف */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,rgba(212,168,67,0.10),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col items-center text-center">
            <Emblem size={72} />
            <h1 className="mt-4 text-3xl font-extrabold text-foreground">
              دخول المشرفين
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              هذه المنطقة مخصّصة لإدارة المنصّة
            </p>
            <OrnamentDivider width={220} className="mt-3 max-w-full" />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-email" className="font-semibold text-foreground">
                البريد الإلكتروني
              </Label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل البريد الإلكتروني"
                  autoComplete="username"
                  className="ps-9"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-password" className="font-semibold text-foreground">
                كلمة السر
              </Label>
              <div className="relative">
                <LockKeyhole className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة السر"
                  autoComplete="current-password"
                  className="ps-9"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90"
            >
              {loading ? <Loader2 className="size-5 animate-spin" /> : "تأكيد الدخول"}
            </Button>
          </form>
        </div>

        <Button
          variant="ghost"
          onClick={onBack}
          className="mx-auto mt-5 flex font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowRight className="size-4" />
          عودة إلى الموقع
        </Button>
      </div>
    </div>
  );
}
