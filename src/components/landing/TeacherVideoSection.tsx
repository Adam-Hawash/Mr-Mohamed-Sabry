'use client'

/* ============================================================
   (ص119) الفيديو التعريفي عن المستر — زي منصة مستر أحمد شعبان بالظبط
   ============================================================
   SiteConfig: teacher_video_url — نفس منطق intro_video_url بالظبط:
   فاضي → القسم مش بيظهر خالص من الـ DOM. مكانه قبل قسم المعرض
   (GallerySection) في الصفحة الرئيسية — نفس مكان زيكولا.
   ============================================================ */

import { useAppStore } from '@/stores/app-store'
import { introVideoKind } from '@/lib/intro-video'
import { ConfigVideoPlayer } from '@/components/landing/ConfigVideoPlayer'
import { GraduationCap } from 'lucide-react'

export function TeacherVideoSection() {
  let siteConfig = useAppStore(function (s) { return s.siteConfig })
  let teacherName = String(siteConfig.hero_title_line2 || 'مستر محمد صبري').trim() || 'مستر محمد صبري'
  let url = String(siteConfig.teacher_video_url || '').trim()

  /* مفيش فيديو → مفيش سكشن أصلًا في الـ DOM (زي IntroVideoSection) */
  const kind = introVideoKind(url)
  if (kind === 'none') return null

  return (
    <section id="teacher-video" className="py-12 sm:py-20" aria-label="فيديو عن المستر">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            فيديو عن المستر
          </span>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            تعرّف على {teacherName}
          </h2>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="aspect-video w-full bg-black">
            <ConfigVideoPlayer url={url} title="فيديو عن المستر — منصة مستر محمد صبري" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default TeacherVideoSection
