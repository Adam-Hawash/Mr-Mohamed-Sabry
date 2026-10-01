"use client";

import { useEffect, useState } from "react";
import { Menu, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Emblem } from "./Ornaments";

const LINKS = [
  { href: "#home", label: "الرئيسية" },
  { href: "#features", label: "مميزات المنصة" },
  { href: "#news", label: "الأخبار" },
  { href: "#lessons", label: "الدروس" },
  { href: "#about", label: "عن المستر" },
];

export function Navbar({ onLogin }: { onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/80 bg-white/90 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* الشعار */}
        <a href="#home" className="group flex items-center gap-3" aria-label="الرئيسية">
          <Emblem
            size={46}
            className="transition-transform duration-500 group-hover:rotate-12"
          />
          <span className="flex flex-col leading-tight">
            <span
              className={`text-xl font-extrabold transition-colors sm:text-2xl ${
                scrolled ? "text-foreground" : "text-gold-300"
              }`}
            >
              مستر محمد صبري
            </span>
            <span
              className={`text-[11px] font-medium tracking-wide transition-colors ${
                scrolled ? "text-muted-foreground" : "text-stone-300"
              }`}
            >
              مادة اللغة العربية
            </span>
          </span>
        </a>

        {/* روابط سطح المكتب */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="التنقل الرئيسي">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`relative text-sm font-semibold transition-colors after:absolute after:-bottom-1.5 after:start-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full ${
                scrolled
                  ? "text-foreground/75 hover:text-primary"
                  : "text-stone-200 hover:text-gold-300"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            onClick={onLogin}
            className={
              scrolled
                ? "bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                : "border border-gold-500/50 bg-gold-500/10 font-semibold text-gold-300 hover:bg-gold-500 hover:text-gold-900"
            }
          >
            <LogIn className="size-4" />
            دخول
          </Button>

          {/* قائمة الموبايل */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={
                  scrolled
                    ? "border-border text-foreground lg:hidden"
                    : "border-gold-500/40 bg-white/10 text-gold-300 hover:bg-white/20 hover:text-gold-200 lg:hidden"
                }
                aria-label="فتح القائمة"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3 text-start">
                  <Emblem size={38} />
                  <span className="text-lg font-extrabold text-foreground">مستر محمد صبري</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col gap-1 px-2" aria-label="قائمة الموبايل">
                {LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
                  >
                    {l.label}
                  </a>
                ))}
                <Button
                  onClick={() => {
                    setOpen(false);
                    onLogin();
                  }}
                  className="mt-3 bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <LogIn className="size-4" />
                  تسجيل الدخول
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
