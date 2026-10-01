"use client";

import { SmallRosette } from "./Ornaments";

/** حِكم وأمثال عربية خالدة تمرّ في شريط متحرك */
const PROVERBS = [
  "خير الكلام ما قلّ ودلّ",
  "العلم في الصغر كالنقش على الحجر",
  "من جدّ وجد، ومن زرع حصد",
  "الصبر مفتاح الفرج",
  "العقل السليم في الجسم السليم",
  "الأدب أشرف الخلايق",
  "ربّ الكلمة طبيبة، وربّ الكلمة سقم",
  "اطلب العلم من المهد إلى اللحد",
  "اللسان العربي بحرٌ لا ساحل له",
];

export function ProverbsMarquee() {
  const row = [...PROVERBS, ...PROVERBS];
  return (
    <div
      className="marquee-hover-pause relative overflow-hidden border-y border-border bg-muted py-3.5"
      dir="rtl"
      aria-label="حكم وأمثال عربية"
    >
      {/* تلاشي الحواف */}
      <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-20 bg-gradient-to-l from-transparent to-muted" />
      <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-20 bg-gradient-to-r from-transparent to-muted" />

      <div className="flex w-max animate-marquee items-center gap-8">
        {row.map((p, i) => (
          <div key={i} className="flex items-center gap-8">
            <p className="whitespace-nowrap text-lg font-semibold text-foreground/80 sm:text-xl">
              «{p}»
            </p>
            <SmallRosette className="shrink-0 text-primary/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
