"use client";

import { OrnamentDivider } from "./Ornaments";

/**
 * ترويسة الأقسام الموحّدة — شارة صغيرة + عنوان بارز + فاصل ذهبي
 * خط القاهرة العادي بأوزان 600-800 (بدون خطوط زخرفية خارج الهيرو)
 */
export function SectionHeader({
  badge,
  title,
}: {
  badge: string;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-muted px-4 py-1.5 text-sm font-semibold text-primary">
        {badge}
      </span>
      <h2 className="mt-4 text-3xl font-extrabold leading-snug text-foreground sm:text-4xl">
        {title}
      </h2>
      <OrnamentDivider width={280} className="mt-2 max-w-full" />
    </div>
  );
}
