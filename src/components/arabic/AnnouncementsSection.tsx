"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Newspaper } from "lucide-react";
import { PlatformLoader } from "@/components/PlatformLoader";
import { SectionHeader } from "./SectionHeader";

type Announcement = {
  id: string;
  title: string;
  body: string;
  important: boolean;
  createdAt: string;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function AnnouncementsSection() {
  const [items, setItems] = useState<Announcement[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => {
        if (alive) setItems(Array.isArray(d.announcements) ? d.announcements : []);
      })
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="news" className="relative bg-muted/45 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader badge="الأخبار والإعلانات" title="جديد المنصة" />

        <div className="mt-12">
          {/* حالة التحميل — لودر المنصة زي المنصات الكبيرة (ص2) */}
          {items === null && <PlatformLoader variant="inline" label="جاري تحميل الإعلانات..." />}

          {/* لا توجد إعلانات */}
          {items !== null && items.length === 0 && (
            <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-10 text-center shadow-sm">
              <Newspaper className="mx-auto size-10 text-primary/60" />
              <p className="mt-4 text-xl font-semibold text-foreground">
                لا توجد إعلانات حاليًا — تابعونا قريبًا
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                كل جديد عن الدروس والامتحانات سيظهر هنا أولًا بأول
              </p>
            </div>
          )}

          {/* الإعلانات */}
          {items !== null && items.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {items.slice(0, 6).map((a) => (
                <article
                  key={a.id}
                  className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold leading-relaxed text-foreground group-hover:text-primary">
                      {a.title}
                    </h3>
                    {a.important && (
                      <span className="shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
                        مهم
                      </span>
                    )}
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{a.body}</p>
                  <div className="mt-4 flex items-center gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5 text-primary/70" />
                    {formatDate(a.createdAt)}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
