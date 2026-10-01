"use client";

import { OrnamentDivider } from "./Ornaments";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border bg-muted/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-9 text-center pb-[calc(2.25rem+env(safe-area-inset-bottom))] sm:px-6">
        <p className="text-2xl font-extrabold text-foreground">مستر محمد صبري</p>
        <p className="text-xs font-semibold tracking-wider text-primary">
          مادة اللغة العربية
        </p>
        <OrnamentDivider width={240} className="max-w-full" />
        <p className="text-xs text-muted-foreground">
          © {year} منصّة مستر محمد صبري للغة العربية — جميع الحقوق محفوظة
        </p>
        <p className="text-sm font-medium text-primary/80">
          صُنع بحُبٍّ للغة الضاد ✦
        </p>
      </div>
    </footer>
  );
}
