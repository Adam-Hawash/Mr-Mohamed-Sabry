'use client'

import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app-store'
/* (و64) الترجمة الحقيقية عربي/إنجليزي */
import { useT, useLangStore } from '@/lib/i18n'
import { useEffect, useState } from 'react'
import { Award, GraduationCap, Users, BookOpen, Clock, CalendarClock } from 'lucide-react'

export default function HeroSection() {
  /* (و64) الترجمة */
  const T = useT()
  /* (و72) لغة الزائر الحالية — لعرض المحتوى المكتوب من الأدمن بالعربي/الإنجليزي */
  var lang = useLangStore(function (s) { return s.lang })
  const {
    setView,
    siteConfig,
    setSiteConfig,
    configLoaded,
    stats,
  } = useAppStore()

  const [fallbackBgExists, setFallbackBgExists] = useState(false)
  const [fallbackPhotoExists, setFallbackPhotoExists] = useState(false)

  var initialCfg = (typeof window !== 'undefined' && (window as any).__INITIAL_CONFIG__) || {}
  var cfg = configLoaded ? siteConfig : (Object.keys(siteConfig).length > 0 ? siteConfig : initialCfg)

  useEffect(() => {
    if (!configLoaded && Object.keys(siteConfig).length === 0) {
      fetch('/api/config')
        .then((r) => r.json())
        .then((data) => {
          setSiteConfig(data)
          useAppStore.getState().setConfigLoaded(true)
        })
        .catch(() => {})
    }
  }, [configLoaded, setSiteConfig, siteConfig])

  useEffect(() => {
    var hasDbBg = !!(siteConfig.hero_bg_image || '')
    var hasDbPhoto = !!(siteConfig.instructor_photo || '')
    if (!hasDbBg) {
      var img = new Image()
      img.onload = function () { setFallbackBgExists(true) }
      img.onerror = function () { setFallbackBgExists(false) }
      img.src = '/images/hero-bg.jpg'
    } else {
      setFallbackBgExists(false)
    }
    if (!hasDbPhoto) {
      var img2 = new Image()
      img2.onload = function () { setFallbackPhotoExists(true) }
      img2.onerror = function () { setFallbackPhotoExists(false) }
      img2.src = '/images/teacher.jpg'
    } else {
      setFallbackPhotoExists(false)
    }
  }, [siteConfig.hero_bg_image, siteConfig.instructor_photo])

  const dbPhoto = cfg.instructor_photo || ''
  const dbBg = cfg.hero_bg_image || ''
  /* (2026-و31) طلب المستر: «صورة المعلم تكون هي الأساسية والبديلة، ما تحطش حاجة من دماغك»
     الرابط القديم /images/instructor.webp كان شايل صورة تانية من القالب القديم ومتخزن
     في كاش الطلاب — فالصورة بقت على رابط جديد خالص mr-wael-photo.webp يكسر الكاش،
     والأساسية (قاعدة البيانات) والبديلة نفس الملف بالظبط */
  const heroPhoto = dbPhoto || '/images/teacher.jpg'
  const heroBg = dbBg || '/images/hero-bg.png'

  const showBg = !!dbBg || fallbackBgExists
  const showPhoto = !!dbPhoto || fallbackPhotoExists

  /* (و72) اختيار نص الأدمن حسب اللغة: إنجليزي بقرأ المفتاح *_en من لوحة
     الأدمن (أو الافتراضي الإنجليزي)، عربي بقرأ المفتاح الأساسي —
     فالمستر يكتب العربي والإنجليزي كل واحد لوحده من لوحة التحكم */
  var L = function (key: string, arFallback: string, enFallback: string): string {
    if (lang === 'en') {
      var en = (cfg as any)[key + '_en']
      if (en && String(en).trim() !== '') return String(en)
      return enFallback
    }
    var ar = (cfg as any)[key]
    return ar && String(ar).trim() !== '' ? String(ar) : arFallback
  }

  return (
    <section className="relative overflow-hidden bg-[#0F0D0A]" dir="rtl">
      {/* (ص2) خلفية حروف وكلمات عربية خافتة بدل الرموز الرياضية — بأسلوب المنصات الكبيرة لكن بهوية اللغة العربية */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* كلمات عربية خافتة */}
        <div className="absolute text-[120px] font-bold text-white/[0.04] leading-none select-none" style={{ top: '5%', right: '5%' }}>نحو</div>
        <div className="absolute text-[90px] font-bold text-white/[0.04] leading-none select-none" style={{ top: '15%', left: '8%' }}>إعراب</div>
        <div className="absolute text-[100px] font-bold text-white/[0.04] leading-none select-none" style={{ top: '50%', left: '5%' }}>بلاغة</div>
        <div className="absolute text-[80px] font-bold text-white/[0.04] leading-none select-none" style={{ top: '65%', right: '10%' }}>إملاء</div>
        <div className="absolute text-[70px] font-bold text-white/[0.04] leading-none select-none" style={{ top: '85%', left: '15%' }}>قراءة</div>
        <div className="absolute text-[60px] font-bold text-white/[0.04] leading-none select-none" style={{ top: '25%', right: '40%' }}>كتابة</div>
        <div className="absolute text-[55px] font-bold text-white/[0.04] leading-none select-none" style={{ top: '70%', left: '40%' }}>أدب</div>
        <div className="absolute text-[65px] font-bold text-white/[0.04] leading-none select-none" style={{ top: '40%', right: '8%' }}>شعر</div>
        <div className="absolute text-[50px] font-bold text-white/[0.04] leading-none select-none" style={{ top: '10%', left: '30%' }}>نثر</div>
        <div className="absolute text-[75px] font-bold text-white/[0.04] leading-none select-none" style={{ top: '80%', right: '30%' }}>قواعد</div>

        {/* حروف عربية خافتة — نفس مواضع الأشكال الهندسية القديمة */}
        <svg className="absolute text-white/[0.05]" style={{ top: '8%', left: '20%', width: '50px', height: '50px' }} viewBox="0 0 50 50" fill="none">
          <text x="25" y="35" textAnchor="middle" fontSize="34" fontWeight="700" fill="currentColor" fontFamily="Cairo, sans-serif">أ</text>
        </svg>
        <svg className="absolute text-white/[0.05]" style={{ top: '55%', right: '20%', width: '55px', height: '55px' }} viewBox="0 0 50 50" fill="none">
          <text x="25" y="37" textAnchor="middle" fontSize="36" fontWeight="700" fill="currentColor" fontFamily="Cairo, sans-serif">ب</text>
        </svg>
        <svg className="absolute text-white/[0.05]" style={{ top: '78%', left: '40%', width: '45px', height: '45px' }} viewBox="0 0 50 50" fill="none">
          <text x="25" y="35" textAnchor="middle" fontSize="32" fontWeight="700" fill="currentColor" fontFamily="Cairo, sans-serif">ت</text>
        </svg>
        <svg className="absolute text-white/[0.05]" style={{ top: '32%', right: '45%', width: '50px', height: '50px' }} viewBox="0 0 50 50" fill="none">
          <text x="25" y="35" textAnchor="middle" fontSize="34" fontWeight="700" fill="currentColor" fontFamily="Cairo, sans-serif">ج</text>
        </svg>
        <svg className="absolute text-white/[0.05]" style={{ top: '92%', right: '5%', width: '55px', height: '55px' }} viewBox="0 0 50 50" fill="none">
          <text x="25" y="37" textAnchor="middle" fontSize="36" fontWeight="700" fill="currentColor" fontFamily="Cairo, sans-serif">ح</text>
        </svg>
        <svg className="absolute text-white/[0.05]" style={{ top: '45%', left: '48%', width: '50px', height: '50px' }} viewBox="0 0 50 50" fill="none">
          <text x="25" y="35" textAnchor="middle" fontSize="34" fontWeight="700" fill="currentColor" fontFamily="Cairo, sans-serif">خ</text>
        </svg>

        {/* 18 dots - professional scattered layout with subtle glow */}
        {/* Top section */}
        <div className="hero-dot hero-dot-1 w-1 h-1 rounded-full" style={{ top: '8%', right: '15%', background: '#D4A843', boxShadow: '0 0 4px #D4A843' }} />
        <div className="hero-dot hero-dot-2 w-1 h-1 rounded-full" style={{ top: '12%', left: '25%', background: '#A16207', boxShadow: '0 0 4px #A16207' }} />
        <div className="hero-dot hero-dot-3 w-1 h-1 rounded-full" style={{ top: '20%', right: '40%', background: '#E9C767', boxShadow: '0 0 4px #E9C767' }} />
        <div className="hero-dot hero-dot-4 w-1 h-1 rounded-full" style={{ top: '6%', left: '55%', background: '#C49A38', boxShadow: '0 0 4px #C49A38' }} />

        {/* Upper middle */}
        <div className="hero-dot hero-dot-5 w-1 h-1 rounded-full" style={{ top: '28%', right: '8%', background: '#E5BE5A', boxShadow: '0 0 4px #E5BE5A' }} />
        <div className="hero-dot hero-dot-6 w-1 h-1 rounded-full" style={{ top: '32%', left: '15%', background: '#96741F', boxShadow: '0 0 4px #96741F' }} />
        <div className="hero-dot hero-dot-7 w-1 h-1 rounded-full" style={{ top: '38%', right: '35%', background: '#D4A843', boxShadow: '0 0 4px #D4A843' }} />
        <div className="hero-dot hero-dot-8 w-1 h-1 rounded-full" style={{ top: '25%', left: '45%', background: '#A16207', boxShadow: '0 0 4px #A16207' }} />

        {/* Middle */}
        <div className="hero-dot hero-dot-1 w-1 h-1 rounded-full" style={{ top: '48%', left: '8%', background: '#E9C767', boxShadow: '0 0 4px #E9C767' }} />
        <div className="hero-dot hero-dot-3 w-1 h-1 rounded-full" style={{ top: '52%', right: '20%', background: '#C49A38', boxShadow: '0 0 4px #C49A38' }} />
        <div className="hero-dot hero-dot-5 w-1 h-1 rounded-full" style={{ top: '45%', left: '55%', background: '#E5BE5A', boxShadow: '0 0 4px #E5BE5A' }} />

        {/* Lower middle */}
        <div className="hero-dot hero-dot-2 w-1 h-1 rounded-full" style={{ top: '65%', right: '10%', background: '#96741F', boxShadow: '0 0 4px #96741F' }} />
        <div className="hero-dot hero-dot-4 w-1 h-1 rounded-full" style={{ top: '70%', left: '20%', background: '#D4A843', boxShadow: '0 0 4px #D4A843' }} />
        <div className="hero-dot hero-dot-6 w-1 h-1 rounded-full" style={{ top: '75%', right: '30%', background: '#A16207', boxShadow: '0 0 4px #A16207' }} />
        <div className="hero-dot hero-dot-8 w-1 h-1 rounded-full" style={{ top: '62%', left: '45%', background: '#E9C767', boxShadow: '0 0 4px #E9C767' }} />

        {/* Bottom */}
        <div className="hero-dot hero-dot-7 w-1 h-1 rounded-full" style={{ top: '88%', right: '15%', background: '#E5BE5A', boxShadow: '0 0 4px #E5BE5A' }} />
        <div className="hero-dot hero-dot-1 w-1 h-1 rounded-full" style={{ top: '92%', left: '35%', background: '#C49A38', boxShadow: '0 0 4px #C49A38' }} />
      </div>

      {/* Banner Image at Top */}
      {showBg && (
        <div className="relative w-full">
          <img
            src={heroBg}
            alt="Mr. Mohamed Sabry Banner"
            className="w-full h-auto max-h-[360px] object-cover object-center"
          />
        </div>
      )}

      {/* Ambient light effects - only in dark mode */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-20 right-20 h-96 w-96 rounded-full bg-[#C49A38]/10 blur-[100px] dark:block hidden" />
        <div className="absolute bottom-20 left-20 h-72 w-72 rounded-full bg-[#C49A38]/5 blur-[80px] dark:block hidden" />
        <div className="absolute top-16 left-10 text-[#C49A38]/10 text-6xl font-light select-none hidden lg:block dark:block">
          a2+b2=c2
        </div>
        <div className="absolute bottom-32 right-16 text-[#C49A38]/8 text-5xl font-light select-none hidden lg:block dark:block">
          f(x)
        </div>
        <div className="absolute top-1/2 left-1/3 text-[#C49A38]/6 text-4xl font-light select-none hidden xl:block dark:block">
          sum int pi
        </div>
      </div>

      {/* Subtle gradient when no banner */}
      {!showBg && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F0D0A] via-[#1A1714] to-[#0F0D0A] -z-10" />
      )}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Text Content */}
          <div className="space-y-6 text-center lg:text-right order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C49A38]/15 px-4 py-1.5 text-sm font-medium text-[#E5BE5A] border border-[#C49A38]/20">
              <Award className="h-4 w-4" />
              <span>
                {L('hero_badge', 'Comprehensive Learning Platform | منصة تعليمية متكاملة', 'Comprehensive Learning Platform')}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-white">
              <span className="block text-[#E5BE5A]">
                {L('hero_title_line1', 'Mr. Mohamed Sabry', 'Mr. Mohamed Sabry')}
              </span>
              <span className="block mt-1 text-2xl sm:text-3xl lg:text-4xl font-semibold text-white/80">
                {L('hero_title_line2', 'مستر محمد صبري', 'Mr. Mohamed Sabry')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl text-white/70 text-base sm:text-lg leading-relaxed lg:mx-0 mx-auto">
              {L(
                'hero_subtitle',
                'نبسّط لك الرياضيات ونجعلها سهلة وممتعة! Algebra, Geometry, Formulas, Cheat Sheets — واجبات أسبوعية، امتحانات منتظمة، ومتابعة مستمرة لتقدّمك الأكاديمي.',
                'We make math simple and fun! Algebra, Geometry, Formulas, Cheat Sheets — weekly homework, regular exams, and continuous tracking of your progress.'
              )}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button
                size="lg"
                className="text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-6 min-h-[44px] bg-[#C49A38] hover:bg-[#D4A843] text-white font-semibold transition-colors duration-200"
                onClick={() => setView('auth-register')}
              >
                {T('اعمل حسابك', 'Create Account')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-6 min-h-[44px] border-[#C49A38]/40 text-[#E5BE5A] hover:bg-[#C49A38]/10 hover:text-[#E5BE5A] transition-colors duration-200"
                onClick={() => setView('auth-login')}
              >
                {T('عندك حساب؟ ادخل هنا', 'Have an account? Log in')}
              </Button>
            </div>

            {/* Schedule Button - مواعيد السنتر */}
            <div className="pt-2 flex justify-center lg:justify-start">
              <Button
                variant="outline"
                size="lg"
                className="text-sm px-6 py-4 min-h-[44px] border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors duration-200 gap-2"
                onClick={() => window.location.href = '/schedule'}
              >
                <CalendarClock className="h-4 w-4" />
                {T('مواعيد السنتر', 'Center Schedule')}
              </Button>
            </div>

            {/* Hero Developer / Adam Hawash branding */}
            <div className="pt-4 flex flex-col items-center lg:items-start gap-1">
              <a
                href={cfg.hero_developer_url || 'https://prime-developer-portfolio-11.vercel.app'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-white/60 hover:text-primary transition-colors"
              >
                {cfg.hero_developer_label || 'Hero Developer'}
              </a>
              <div className="h-px w-16 bg-white/10" />
              <a
                href={cfg.hero_developer_url || 'https://prime-developer-portfolio-11.vercel.app'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/40 font-light tracking-wider hover:text-primary transition-colors"
              >
                {cfg.footer_made_by_label || 'Developed by Adam Hawash'}
              </a>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-center lg:justify-start gap-5 sm:gap-8 pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <BookOpen className="h-4 w-4 text-[#8B6914]/60 dark:text-[#E5BE5A]/60" />
                  <p className="text-2xl font-bold text-[#E5BE5A]">
                    {stats?.totalVideos
                      ? stats.totalVideos
                      : L('hero_stat1_value', '8+', '8+')}
                  </p>
                </div>
                <p className="text-xs text-white/70">
                  {L('hero_stat1_label', 'Video Lessons | دروس فيديو', 'Video Lessons')}
                </p>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Users className="h-4 w-4 text-[#8B6914]/60 dark:text-[#E5BE5A]/60" />
                  <p className="text-2xl font-bold text-[#E5BE5A]">
                    {stats?.approvedStudents
                      ? stats.approvedStudents
                      : L('hero_stat2_value', '100+', '100+')}
                  </p>
                </div>
                <p className="text-xs text-white/70">
                  {L('hero_stat2_label', 'Students | طالب', 'Students')}
                </p>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Clock className="h-4 w-4 text-[#8B6914]/60 dark:text-[#E5BE5A]/60" />
                  <p className="text-2xl font-bold text-[#E5BE5A]">
                    {L('hero_stat3_value', '24/7', '24/7')}
                  </p>
                </div>
                <p className="text-xs text-white/70">
                  {L('hero_stat3_label', 'Tracking | متابعة', 'Tracking')}
                </p>
              </div>
            </div>
          </div>

          {/* Instructor Photo - Square shape with elegant frame */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2 -mt-4 sm:-mt-8">
            <div className="relative group">
              {/* Gold ambient glow */}
              <div className="absolute -inset-3 bg-gradient-to-br from-[#C49A38]/30 dark:from-[#E5BE5A]/40 via-[#C49A38]/15 to-transparent blur-2xl transition-opacity duration-500 group-hover:opacity-90" />
              {/* Decorative dotted frame */}
              <svg className="absolute -top-6 -left-6 w-20 h-20 opacity-50 pointer-events-none" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#C49A38" strokeWidth="2.5" strokeDasharray="3 7" />
              </svg>
              <svg className="absolute -bottom-6 -right-6 w-16 h-16 opacity-40 pointer-events-none" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#C49A38" strokeWidth="2.5" strokeDasharray="3 7" />
              </svg>
              {/* Square photo container with gold frame — صورة المستر مربعة وبتتعرض كاملة
                  من غير أي قص (object-cover في مربع = الصورة كلها زي ما هي) */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-2xl overflow-hidden border-2 border-[#C49A38]/40 gold-glow bg-transparent shadow-2xl">
                {showPhoto ? (
                  <img
                    src={heroPhoto}
                    alt={L('instructor_name', 'Mr. Mohamed Sabry', 'Mr. Mohamed Sabry')}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: '50% 50%' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#C49A38]/30">
                    <GraduationCap className="h-24 w-24" />
                  </div>
                )}
                {/* Subtle gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>
              {/* Badge overlay — الاسم مرة واحدة بس (طلب المستر) */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0F0D0A] border border-[#C49A38]/40 rounded-full px-5 py-2 shadow-lg">
                <p className="text-[#E5BE5A] font-bold text-sm tracking-wider whitespace-nowrap">
                  {L('instructor_name', 'مستر محمد صبري', 'Mr. Mohamed Sabry')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
