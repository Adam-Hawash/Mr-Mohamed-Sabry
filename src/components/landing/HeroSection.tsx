'use client'

// ============================================================
// FILE: src/components/landing/HeroSection.tsx
// (ص5 — 2026) رجعة الديزاين الأصلي لمستر محمد صبري بالحرف:
//   خلفية الليل + التذهيب + زخارف المخطوطات العربية + حركات
//   الظهور المتتابع (framer-motion stagger) — زي الإصدار الأول
//   (95e2242) بالظبط، بس موصول ببيانات المنصة الحالية:
//   النصوص من لوحة الأدمن (hero_title/subtitle/badge/stats) +
//   أزرار التسجيل/الدخول الحقيقية + صورة المستر من الإعدادات
//   جوه إطار التذهيب العايم.
//   البنية (بورتال/أدمن/واجبات...) زي المنصات الكبيرة زي ما هي —
//   بس الديزاين رجع الأصلي بطلب المستر الحرفي.
// ============================================================

import { useAppStore } from '@/stores/app-store'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  BookOpenText,
  ClipboardCheck,
  ChevronDown,
  NotebookPen,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Emblem, OrnamentDivider, CornerOrnament, SmallRosette } from './Ornaments'

const FEATURES = [
  { icon: BookOpenText, label: 'دروس مشروحة' },
  { icon: NotebookPen, label: 'واجبات دورية' },
  { icon: ClipboardCheck, label: 'امتحانات تفاعلية' },
  { icon: TrendingUp, label: 'متابعة تقدّم' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
}

const item = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export default function HeroSection() {
  const {
    setView,
    siteConfig,
    setSiteConfig,
    configLoaded,
  } = useAppStore()

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

  var C = function (key: string, fallback: string): string {
    var v = (cfg as any)[key]
    return v && String(v).trim() !== '' ? String(v) : fallback
  }

  var teacherName = C('hero_title_line2', 'مستر محمد صبري')
  var badge = C('hero_badge', 'منصّة اللغة العربية | Arabic Language Platform')
  var subtitle = C('hero_subtitle', 'نُحبّ العربية ونقرّبها لابنك! نحو وبلاغة وإعراب وإملاء بأسلوب مبسّط — دروس مشروحة، واجبات أسبوعية، امتحانات منتظمة، ومتابعة مستمرة لتقدّمه الأكاديمي.')
  var photo = C('instructor_photo', '/images/hero-bg.png')
  /* (ص119) شكل صورة المستر: '1' بإطار التذهيب / '0' بدون إطار (الافتراضي —
     زي منصة مستر أحمد شعبان) — بيتغير من لوحة الأدمن لحظيًا */
  var framed = C('hero_photo_frame', '0') === '1'

  var stats = [
    { value: C('hero_stat1_value', '8+'), label: C('hero_stat1_label', 'صفوف دراسية') },
    { value: C('hero_stat2_value', '100+'), label: C('hero_stat2_label', 'فيديو درس') },
    { value: C('hero_stat3_value', '24/7'), label: C('hero_stat3_label', 'متابعة تقدّم') },
  ]

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      {/* ===== الخلفية المزخرفة — نفس خلفية الإصدار الأصلي ===== */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src="/images/hero-pattern.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* تدرجات إخفاء لدمج الصورة مع لون المنصة */}
        <div className="absolute inset-0 bg-gradient-to-b from-night-800/85 via-night-800/70 to-night-800" />
        <div className="absolute inset-0 bg-gradient-to-l from-night-800/70 via-transparent to-night-800/70" />
        <div className="absolute inset-0 pattern-glow-top" />
      </div>

      {/* زوايا الإطار المزخرف */}
      <CornerOrnament className="absolute start-3 top-20 hidden opacity-40 md:block" />
      <CornerOrnament className="absolute end-3 top-20 hidden opacity-40 md:block" flipX />
      <CornerOrnament className="absolute bottom-4 start-3 hidden opacity-25 md:block" flipY />
      <CornerOrnament className="absolute bottom-4 end-3 hidden opacity-25 md:block" flipX flipY />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-24 pt-32 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pt-28">
        {/* ===== العمود النصي ===== */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center lg:items-start lg:text-start"
        >
          {/* البسملة */}
          <motion.div variants={item} className="flex items-center gap-4">
            <span className="h-px w-14 bg-gradient-to-l from-gold-500/70 to-transparent sm:w-20" />
            <p className="font-amiri text-lg text-gold-300/95 sm:text-xl">
              بسم الله الرحمن الرحيم
            </p>
            <span className="h-px w-14 bg-gradient-to-r from-gold-500/70 to-transparent sm:w-20" />
          </motion.div>

          {/* القلادة */}
          <motion.div variants={item} className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 scale-125 rounded-full bg-gold-500/15 blur-2xl animate-pulse-glow" aria-hidden="true" />
              <Emblem size={92} className="glow-gold relative" />
            </div>
          </motion.div>

          {/* الاسم المزخرف */}
          <motion.h1
            variants={item}
            className="mt-6 font-ruqaa text-5xl font-bold leading-[1.7] text-gold-gradient drop-shadow-[0_4px_24px_rgba(212,168,67,0.25)] sm:text-6xl lg:text-7xl lg:leading-[1.6]"
          >
            {teacherName}
          </motion.h1>

          {/* الفاصل المزخرف */}
          <motion.div variants={item} className="my-2">
            <OrnamentDivider width={340} className="max-w-full" />
          </motion.div>

          {/* المادة / البادج */}
          <motion.h2
            variants={item}
            className="font-kufi text-xl font-semibold tracking-wide text-cream sm:text-2xl"
          >
            {badge}
          </motion.h2>

          {/* الوصف */}
          <motion.p
            variants={item}
            className="mt-5 max-w-xl leading-8 text-cream/75 sm:text-lg"
          >
            {subtitle}
          </motion.p>

          {/* أزرار — نفس وظيفة المنصة: تسجيل + دخول */}
          <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Button
              size="lg"
              onClick={function () { setView('auth-register') }}
              className="h-12 min-h-[48px] bg-emerald-500 px-7 font-kufi text-base font-semibold text-night-900 shadow-[0_8px_30px_rgba(16,185,129,0.35)] transition-all hover:bg-emerald-400 hover:shadow-[0_8px_40px_rgba(16,185,129,0.5)]"
            >
              سجّل في المنصة
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={function () { setView('auth-login') }}
              className="h-12 min-h-[48px] border-emerald-500/45 bg-transparent px-7 font-kufi text-base text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"
            >
              تسجيل الدخول
            </Button>
          </motion.div>

          {/* شرائح المميزات */}
          <motion.ul variants={item} className="mt-9 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
            {FEATURES.map(function (f) {
              return (
                <li
                  key={f.label}
                  className="flex items-center gap-2 rounded-full border border-gold-500/25 bg-white/[0.04] px-4 py-2 text-sm text-cream/85 backdrop-blur-sm transition-colors hover:border-gold-500/50 hover:text-gold-200"
                >
                  <f.icon className="size-4 text-gold-400" />
                  {f.label}
                </li>
              )
            })}
          </motion.ul>

          {/* أرقام المنصة — من إعدادات الأدمن */}
          <motion.div variants={item} className="mt-9 flex flex-wrap items-center justify-center gap-8 lg:justify-start">
            {stats.map(function (s, i) {
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="font-kufi text-2xl font-bold text-gold-gradient sm:text-3xl">{s.value}</span>
                  <span className="text-xs text-cream/60 sm:text-sm">{s.label}</span>
                </div>
              )
            })}
          </motion.div>
        </motion.div>

        {/* ===== صورة المستر =====
            (ص119) طلب المستر: متكونش متزامن على الإطار — بقى اختيارين من
            الأدمن (hero_photo_frame): «1» بإطار التذهيب زي ما كان، أو «0»
            بدون أي إطار/خلفية خالص زي منصة مستر أحمد شعبان (الافتراضي). */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[420px]"
        >
          <div className="animate-float-slow">
            {framed ? (
              <div className="rounded-2xl bg-gradient-to-b from-gold-400 via-gold-600 to-gold-400 p-[3px] shadow-[0_25px_80px_rgba(0,0,0,0.5)]">
                <div className="rounded-[13px] bg-night-700 p-2">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-night-800">
                    <img
                      src={photo}
                      alt={'صورة ' + teacherName}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {/* لمعة التذهيب على حافة الصورة */}
                    <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-gold-500/30" />
                    <div className="absolute bottom-0 start-0 end-0 bg-gradient-to-t from-night-900/85 via-night-900/40 to-transparent px-4 pb-3 pt-10">
                      <div className="flex items-center justify-center gap-2">
                        <SmallRosette className="shrink-0 text-gold-400" />
                        <span className="font-kufi text-sm text-cream/95 sm:text-base">{teacherName}</span>
                        <SmallRosette className="shrink-0 text-gold-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* بدون إطار — الصورة نضيفة على خلفية الهيرو مباشرة (زي منصة مستر أحمد شعبان) */
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-4 rounded-[2rem] bg-gold-500/10 blur-2xl"
                />
                <img
                  src={photo}
                  alt={'صورة ' + teacherName}
                  className="relative aspect-[3/4] w-full rounded-3xl object-cover shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* مؤشر النزول */}
      <a
        href="#features"
        className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-gold-400/80 transition-colors hover:text-gold-300"
        aria-label="انتقل للأسفل"
      >
        <ChevronDown className="size-8 animate-bounce-soft" />
      </a>
    </section>
  )
}
