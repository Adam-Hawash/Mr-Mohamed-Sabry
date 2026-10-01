"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpenText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "./SectionHeader";

type Lesson = {
  id: string;
  title: string;
  grade: string;
  description: string;
  url: string | null;
  createdAt: string;
};

export function LessonsSection() {
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [activeGrade, setActiveGrade] = useState<string>("الكل");

  useEffect(() => {
    let alive = true;
    fetch("/api/lessons")
      .then((r) => r.json())
      .then((d) => {
        if (alive) setLessons(Array.isArray(d.lessons) ? d.lessons : []);
      })
      .catch(() => alive && setLessons([]));
    return () => {
      alive = false;
    };
  }, []);

  const grades = useMemo(() => {
    if (!lessons) return [];
    const g: string[] = [];
    for (const l of lessons) if (!g.includes(l.grade)) g.push(l.grade);
    return g;
  }, [lessons]);

  const filtered = useMemo(() => {
    if (!lessons) return [];
    if (activeGrade === "الكل") return lessons;
    return lessons.filter((l) => l.grade === activeGrade);
  }, [lessons, activeGrade]);

  return (
    <section id="lessons" className="relative py-20 sm:py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader badge="المحتوى التعليمي" title="دروس اللغة العربية" />

        {/* فلتر الصفوف */}
        {lessons !== null && lessons.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {["الكل", ...grades].map((g) => (
              <button
                key={g}
                onClick={() => setActiveGrade(g)}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                  activeGrade === g
                    ? "border-primary bg-primary font-bold text-primary-foreground shadow-sm"
                    : "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        <div className="mt-10">
          {/* التحميل */}
          {lessons === null && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-44 rounded-xl" />
              ))}
            </div>
          )}

          {/* لا توجد دروس */}
          {lessons !== null && lessons.length === 0 && (
            <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-10 text-center shadow-sm">
              <BookOpenText className="mx-auto size-10 text-primary/60" />
              <p className="mt-4 text-xl font-semibold text-foreground">
                سيتم إضافة الدروس قريبًا بإذن الله
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                جاري تجهيز محتوى الدروس لجميع الصفوف — تابعونا
              </p>
            </div>
          )}

          {/* الدروس */}
          {lessons !== null && filtered.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((l) => (
                <article
                  key={l.id}
                  className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-md"
                >
                  <span className="w-fit rounded-full border border-primary/25 bg-muted px-3 py-1 text-[11px] font-semibold text-primary">
                    {l.grade}
                  </span>
                  <h3 className="mt-3 text-lg font-bold leading-relaxed text-foreground group-hover:text-primary">
                    {l.title}
                  </h3>
                  {l.description && (
                    <p className="mt-2 flex-1 text-sm leading-7 text-muted-foreground">
                      {l.description}
                    </p>
                  )}
                  {l.url && (
                    <Button
                      asChild
                      size="sm"
                      className="mt-4 w-fit bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      <a href={l.url} target="_blank" rel="noopener noreferrer">
                        فتح الدرس
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  )}
                </article>
              ))}
            </div>
          )}

          {/* الفلتر لا يطابق شيء */}
          {lessons !== null && lessons.length > 0 && filtered.length === 0 && (
            <p className="text-center text-muted-foreground">لا توجد دروس في هذا الصف حاليًا</p>
          )}
        </div>
      </div>
    </section>
  );
}
