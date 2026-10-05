'use client'

/* ============================================================
   (ص119) الفيديو التعريفي عن المنصة — زي منصة مستر أحمد شعبان بالظبط
   ============================================================
   القاعدة الصارمة بطلب المستر:
   - لو الأدمن ضاف فيديو (لينك أو ملف) → السكشن يظهر ويشتغل.
   - لو ما ضافش (intro_video_url فاضي) → السكشن **مش موجود في الـ DOM
     نهائيًا** (return null — لا div فاضي ولا placeholder).
   المكان: بعد الهيرو مباشرة (نفس مكان زيكولا).
   العرض كله على المشغل الموحد ConfigVideoPlayer: يوتيوب/درايف/فيميو/
   أرشايف embed، ستريمابل على مشغلنا من غير براندينج، والملفات
   المرفوعة على <video> بتاعنا بحماية المنصة.
   ============================================================ */

import { useAppStore } from '@/stores/app-store'
import { introVideoKind } from '@/lib/intro-video'
import { ConfigVideoPlayer } from '@/components/landing/ConfigVideoPlayer'
import { PlayCircle } from 'lucide-react'

export function IntroVideoSection() {
  let siteConfig = useAppStore(function (s) { return s.siteConfig })
  let url = String(siteConfig.intro_video_url || '').trim()

  /* (ص119) إخفاء شرطي صارم — مفيش قيمة = مفيش سكشن خالص */
  const kind = introVideoKind(url)
  if (kind === 'none') return null

  return (
    <section id="intro-video" className="py-12 sm:py-20" aria-label="الفيديو التعريفي">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            الفيديو التعريفي
          </span>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            اتعرف على المنصة في دقائق
          </h2>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="aspect-video w-full bg-black">
            <ConfigVideoPlayer url={url} title="الفيديو التعريفي — منصة مستر محمد صبري" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default IntroVideoSection
