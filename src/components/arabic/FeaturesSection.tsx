"use client";

import { BookOpenText, ClipboardCheck, NotebookPen, TrendingUp } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const FEATURES = [
  {
    icon: BookOpenText,
    title: "دروس مشروحة",
    desc: "شرح مبسّط ومحبوب لقواعد النحو والبلاغة والأدب، يوصّل الفكرة من أول مرة.",
  },
  {
    icon: NotebookPen,
    title: "واجبات دورية",
    desc: "تدريبات منتظمة على كل درس تثبّت المعلومة وتحفّز الطالب على الممارسة.",
  },
  {
    icon: ClipboardCheck,
    title: "امتحانات تفاعلية",
    desc: "امتحانات إلكترونية بتصحيح فوري تُعوّد الطالب نماذج الأسئلة الحقيقية.",
  },
  {
    icon: TrendingUp,
    title: "متابعة مستمرة",
    desc: "متابعة دقيقة لمستوى كل طالب وتقارير تقدّم تُطمئن الطالب وولي الأمر.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader badge="مميزات المنصة" title="لماذا منصة مستر محمد صبري؟" />

        {/* البطاقات */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/35 hover:shadow-md"
            >
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/15">
                <f.icon className="size-7 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
