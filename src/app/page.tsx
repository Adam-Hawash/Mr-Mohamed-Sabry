"use client";

import { useEffect, useState } from "react";
import { Landing } from "@/components/arabic/Landing";
import { AdminLoginView } from "@/components/arabic/AdminLoginView";
import { AdminDashboard } from "@/components/arabic/AdminDashboard";
import { PlatformLoader } from "@/components/PlatformLoader";

type View = "landing" | "admin-login" | "admin-dashboard";

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [loginOpen, setLoginOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  // عند الفتح: لو فيه جلسة مشرف سارية ندخل اللوحة مباشرة
  useEffect(() => {
    let alive = true;
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.authed) setView("admin-dashboard");
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setChecking(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  if (checking) {
    /* (ص2) هيئة الإقلاع زي المنصات الكبيرة — نفس لودر شريف/جينيوس لكن بهوية صبري الذهبية */
    return <PlatformLoader variant="full" />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {view === "landing" && (
        <Landing
          loginOpen={loginOpen}
          setLoginOpen={setLoginOpen}
          onLogin={() => setLoginOpen(true)}
          onAdminGate={() => {
            setLoginOpen(false);
            setView("admin-login");
          }}
        />
      )}

      {view === "admin-login" && (
        <AdminLoginView
          onBack={() => setView("landing")}
          onSuccess={() => setView("admin-dashboard")}
        />
      )}

      {view === "admin-dashboard" && (
        <AdminDashboard onExit={() => setView("landing")} />
      )}
    </div>
  );
}
