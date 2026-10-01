"use client";

import { Quote } from "lucide-react";
import { Emblem, SmallRosette } from "./Ornaments";
import { SectionHeader } from "./SectionHeader";

export function AboutSection() {
  return (
    <section id="about" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader badge="عن المستر" title="الأستاذ محمد صبري" />

        <div className="mt-12 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          {/* بطاقة الاقتباس */}
          <div className="relative rounded-xl border border-border bg-muted p-8 text-center shadow-sm">
            <Quote className="absolute -top-4 start-6 size-8 rounded-full border border-primary/25 bg-primary p-1.5 text-primary-foreground shadow-sm" />
            <p className="text-xl font-semibold leading-[2.1] text-foreground sm:text-2xl">
              «اللغة العربية بحرٌ من الجمال.. من أخلص له في التعلّم، أنعشه
              الإتقان، وأدخله بهجة الفصاحة»
            </p>
            <div className="mt-5 flex items-center justify-center gap-3 text-primary/80">
              <span className="h-px w-12 bg-primary/30" />
              <SmallRosette />
              <span className="h-px w-12 bg-primary/30" />
            </div>
          </div>

          {/* نبذة */}
          <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-start">
            <Emblem size={64} />
            <p className="leading-9 text-foreground/85 sm:text-lg">
              معلم لغة عربية يؤمن أن العربية ليست مادة تُحفظ، بل فنّ يُتقن
              وذوقٌ يُصقل. يجمع في شرحه بين رصانة القواعد وبساطة العرض، فيقرب
              النحو والإعراب لنفوس الطلاب بأسلوب عصري محبوب.
            </p>
            <p className="leading-9 text-muted-foreground">
              من خلال هذه المنصّة يقدّم الدروس والواجبات والامتحانات الإلكترونية
              ومتابعة مستمرة لكل طالب — ليخرج الطالب متقنًا لغة الضاد، فخورًا
              بها.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              {["نحو مبسّط", "إعراب واضح", "أدب راقٍ", "متابعة مستمرة"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-primary/20 bg-muted px-4 py-1.5 text-sm font-semibold text-primary"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
