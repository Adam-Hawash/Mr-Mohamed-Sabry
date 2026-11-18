/* ============================================================
   (ر8) محوّل الاستيراد المحايد للمنصة — node-only imports
   ------------------------------------------------------------
   المشكلة: باكدجات زي @napi-rs/canvas و pdfjs-dist/legacy فيها
   ملفات native (.node) — حزمة كلاود فلير (esbuild بتاع OpenNext)
   بتحاول تحزّم الـ dynamic imports القابلة للتحليل فبتقع على
   ملفات الـ .node وتبناء المنصة يفشل بـ «No loader is configured
   for .node files».

   الحل: استيراد **معتم** — eval('require') مش قابل للتحليل الثابت
   فالباندلرز (turbopack/esbuild) مش بيدخلوا جوه الباكدج أصلًا:
   - على Node (محليًا/فيرسل): بيقرا من node_modules عادي — كل حاجة شغالة زي ما هي.
   - على كلاود فلير (workerd): بنرفض قبل أي require برسالة عربية واضحة.
   ============================================================ */

/* هل إحنا شغالين في Cloudflare Workers (workerd)؟
   navigator.userAgent في workerd بيرجع 'Cloudflare-Workers' + بنقرا CLOUDFLARE=1
   لو المستر حطها في متغيرات البيئة. */
export function isCloudflareWorkers(): boolean {
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).userAgent === 'Cloudflare-Workers') return true
    if (process.env.CLOUDFLARE === '1' || process.env.CLOUDFLARE === 'true') return true
  } catch (e) { /* بيئة غريبة → مش كلاود فلير */ }
  return false
}

/* استيراد باكدج Node-only بأمان — متستخدمهاش للباكدجات العادية */
export async function importNodeOnly(id: string): Promise<any> {
  if (isCloudflareWorkers()) {
    throw new Error(
      'الميزة دي محتاجة Node.js كامل (ملفات native) فمش متاحة على كلاود فلير — ' +
      'المنصة شغالة عادي وأدوات الاستخراج والقص الذكية بتشتغل من النسخة المستضافة على Node (فيرسل/أي سيرفر) أو محليًا. [' + id + ']'
    )
  }
  /* (ر8) eval('require') معتمة للباندلرز — دي جوهر الإصلاح */
  var req = (0, eval)('require')
  return req(id)
}
