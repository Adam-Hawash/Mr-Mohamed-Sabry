'use client'

import { useAppStore } from '@/stores/app-store'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
/* (ص5) الديزاين الأصلي: شريط الحكم المتحرك + تأثير الظهور مع السكرول */
import { ProverbsMarquee } from '@/components/landing/ProverbsMarquee'
import { Reveal } from '@/components/landing/Reveal'
import { StudentPendingView } from '@/components/landing/StudentPendingView'
import { StudentPaymentView } from '@/components/landing/StudentPaymentView'
import { LoginView, RegisterView } from '@/components/landing/AuthPages'
import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'
import { Loader2 } from 'lucide-react'

const HeroSection = dynamic(() => import('@/components/landing/HeroSection'), {
  loading: () => <div className="min-h-[70vh] bg-background" />,
})
const FeaturesGuideSection = dynamic(() => import('@/components/landing/FeaturesGuideSection'), {
  loading: () => <div className="h-20" />,
})
const FeaturesSection = dynamic(() => import('@/components/landing/FeaturesSection').then(function(m) { return { default: m.FeaturesSection } }), {
  loading: () => <div className="h-20" />,
})
/* (G-2) قسم «إزاي تستخدم المنصة؟» — فيديو اختياري من الأدمن: لو مفيش
   فيديو محفوظ السكشن بيرجّع null فمش بيظهر في الـ DOM نهائيًا */
const HowToVideoSection = dynamic(() => import('@/components/landing/HowToVideoSection').then(function(m) { return { default: (m as any).HowToVideoSection || (m as any).default } }), {
  loading: () => <div className="h-20" />,
})
/* (ص119) الفيديوهات التعريفية — زي منصة مستر أحمد شعبان بالظبط:
   فيديو المنصة بعد الهيرو، وفيديو المستر قبل المعرض. فاضي = مخفي خالص */
const IntroVideoSection = dynamic(() => import('@/components/landing/IntroVideoSection').then(function(m) { return { default: (m as any).IntroVideoSection || (m as any).default } }), {
  loading: () => <div className="h-20" />,
})
const TeacherVideoSection = dynamic(() => import('@/components/landing/TeacherVideoSection').then(function(m) { return { default: (m as any).TeacherVideoSection || (m as any).default } }), {
  loading: () => <div className="h-20" />,
})
const GradesSection = dynamic(() => import('@/components/landing/GradesSection').then(function(m) { return { default: m.GradesSection } }), {
  loading: () => <div className="h-20" />,
})
/* (2026-و29) قسم الأوائل اتشال من الصفحة الرئيسية بطلب المستر — بقى زرار
   «أوائل الطلبة» في النافبار يفتح دايلوج بأول 3 طلاب (TopStudentsDialog) */
const TipsSection = dynamic(() => import('@/components/landing/TipsSection'), {
  loading: () => <div className="h-20" />,
})
const LessonsSection = dynamic(() => import('@/components/landing/LessonsSection'), {
  loading: () => <div className="h-20" />,
  ssr: false,
})
const WhatsAppButton = dynamic(() => import('@/components/landing/WhatsAppButton').then(m => ({ default: m.WhatsAppButton })), {
  ssr: false,
})
const FloatingLoginButton = dynamic(() => import('@/components/landing/FloatingLoginButton').then(function(m) { return { default: m.FloatingLoginButton } }), {
  ssr: false,
})
const VideoProtection = dynamic(() => import('@/components/landing/VideoProtection').then(m => ({ default: m.VideoProtection })), {
  ssr: false,
})
const StudentPortal = dynamic(() => import('@/components/student/StudentPortal').then(m => ({ default: (m as any).default || m.StudentPortal })), {
  loading: () => <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>,
})
const ParentPortal = dynamic(() => import('@/components/parent/ParentPortal').then(m => ({ default: (m as any).ParentPortal })), {
  loading: () => <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>,
})
const ParentLoginView = dynamic(() => import('@/components/parent/ParentAuthPages').then(m => ({ default: m.ParentLoginView })), {
  loading: () => <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>,
})
const ParentRegisterView = dynamic(() => import('@/components/parent/ParentAuthPages').then(m => ({ default: m.ParentRegisterView })), {
  loading: () => <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>,
})
const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard').then(m => ({ default: (m as any).default || m.AdminDashboard })), {
  loading: () => <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>,
})

// Minimum loading screen duration (ms)
// (2026-و30) طلب المستر: «لما يجي يدخل الطفل الأولاني بيقعد وقت — سرّعه»
// كان 2000ms انتظار إجباري حتى لو البيانات وصلت — بقى 600ms بس (نفس
// الوظيفة: منع وميض المحتوى غير المُبراند) والدخول بقى فوري تقريبًا
var MIN_LOADING_MS = 600
// Maximum loading screen duration - force show content even if APIs fail (ms)
// (2026-و30) كان 5000 — بقى 3000 عشان البوابة ماتعلقش على API بطيء
var MAX_LOADING_MS = 3000

export default function HomePage() {
  var store = useAppStore()
  var currentView = store.currentView || 'landing'
  var siteConfig = store.siteConfig || {}
  var configLoaded = store.configLoaded
  var setSiteConfig = store.setSiteConfig
  var setConfigLoaded = store.setConfigLoaded
  var setStats = store.setStats

  const [appReady, setAppReady] = useState(false)
  const startTimeRef = useRef(Date.now())

  /* ===== (2026-و39) مفيش استرجاع جلسة تلقائي — طلب المستر الحرفي:
     «الطالب اللي يفتح منصة يفتح عليه على الصفحة الرئيسية اللي فيها صورة
     المستر والحاجات دي وهو يعمل تسجيل دخول بنفسه — ونفس الكلام لولي الأمر».
     الفتح دايمًا على الرئيسية (landing) والدخول يدوي كل مرة.
     mg_student/mg_parent بتتكتب عند الدخول عشان باقي الواجهات تستخدمها
     جوه الجلسة، بس مش بترجّع حد لأي بورتال لوحده.
     حماية شاشة الحل (و38: mg_active_solve + المسودات) شغالة زي ما هي
     وبتتفعل بعد الدخول اليدوي. */

  // Load config + stats on mount
  useEffect(function() {
    /* (2026-و88) لينك إشعار ولي الأمر الخارجي (واتساب/SMS) بييجي بالشكل
       /#parent-login — أول ما الصفحة تفتح بننتقل على طول لشاشة تسجيل
       دخول ولي الأمر (نفس تدفق المستر: «يدوس على الإشعار من بره → يفتحه
       على صفحة تسجيل الدخول → يسجل دخول → يشوف الإشعار جوه المنصة»)
       (2026-و89) لوولي الأمر لسه مسجل جوه الجلسة → ندخله بورتاله على طول */
    try {
      var h = String(window.location.hash || '').replace('#', '')
      if (h === 'parent-login') {
        var par = (store as any).currentParent
        ;(store as any).setView && (store as any).setView(par && par.id ? 'parent-portal' : 'parent-login')
        if (window.history && window.history.replaceState) window.history.replaceState(null, '', window.location.pathname)
      }
    } catch (eHash) {}

    /* (2026-و89) Service Worker إشعارات ولي الأمر — تسجيل + استقبال ضغطة
       الإشعار الخارجي (بره على شاشة الموبايل): لو المنصة مفتوحة بالفعل
       والـ SW ركّز النافذة، بنوجّه الصفحة: مسجل دخول → بورتال الإشعارات،
       غير كده → شاشة تسجيل دخول ولي الأمر (نفس تدفق المستر) */
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {})
        navigator.serviceWorker.addEventListener('message', function (ev: MessageEvent) {
          var d: any = ev && ev.data ? ev.data : null
          if (!d || d.type !== 'parent-notification-click') return
          try {
            var st = (store as any)
            if (st.currentParent && st.currentParent.id) st.setView && st.setView('parent-portal')
            else st.setView && st.setView('parent-login')
          } catch (eSwp) {}
        })
      }
    } catch (eSw) {}

    var dataReady = false
    var minTimerDone = false

    // Minimum display timer - ensures loading screen shows for at least 2s
    var minTimer = setTimeout(function() {
      minTimerDone = true
      if (dataReady) setAppReady(true)
    }, MIN_LOADING_MS)

    // Safety timer - force show content after 5s no matter what
    var maxTimer = setTimeout(function() {
      setAppReady(true)
    }, MAX_LOADING_MS)

    Promise.all([
      fetch('/api/config').then(function(r) { return r.json() }).catch(function() { return {} }),
      fetch('/api/stats').then(function(r) { return r.json() }).catch(function() { return {} }),
    ]).then(function(results) {
      var cfg = results[0]
      var sta = results[1]
      if (cfg && cfg.error && cfg.defaults) {
        cfg = cfg.defaults
      }
      if (cfg && !configLoaded) {
        setSiteConfig(cfg)
        setConfigLoaded(true)
      }
      if (sta && sta.totalStudents !== undefined) {
        setStats(sta)
      }
      dataReady = true
      if (minTimerDone) {
        clearTimeout(maxTimer)
        setAppReady(true)
      }
    })

    return function() {
      clearTimeout(minTimer)
      clearTimeout(maxTimer)
    }
  }, [])

  const showFooter = currentView === 'landing'
  const showWhatsApp = currentView === 'landing' || currentView === 'auth-login' || currentView === 'auth-register'

  /* (ر5) شاشة الدخلة الفخمة — طلب المستر حرفيًا:
     «صورة المستر كاملة، المعلم كاملا، انت قاصص لي جايب لي وشه بس»
     + «خليها مربع» + «الدخلة يكون فيها حرف الضاد أو لغة الضاد وحاجات بالعربي»
     + «وتكون أفخم كده» — المعلم كامل في إطار مذهب مربع + ميدالية الضاد + لغة الضاد */
  if (!appReady) {
    return (
      <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#0d0a07] flex flex-col items-center justify-center">
        {/* خلفية فخمة: تدرج داكن + زخرفة المخطوطة العربية + توهجات مذهبة */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#241b10_0%,#0d0a07_70%)]" />
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.jpg')] bg-cover bg-center opacity-[0.07]" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#C49A38]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#C49A38]/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-5 px-6">
          {/* وسم «لغة الضاد» — هوية عربية فخمة */}
          <div className="flex items-center gap-2 rounded-full border border-[#C49A38]/50 bg-[#C49A38]/10 px-4 py-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#E9C766] to-[#8B6914] text-[15px] font-bold leading-none text-[#171208]" style={{ fontFamily: 'Amiri, serif' }}>ض</span>
            <span className="text-sm font-bold text-[#E5BE5A]" style={{ fontFamily: 'Amiri, serif' }}>لغة الضاد</span>
          </div>

          {/* صورة المستر كاملة — مربع بإطار مذهب مزدوج مش قاصصة وشه بس */}
          <div className="relative mt-2">
            <div className="absolute -inset-4 rounded-[1.75rem] bg-[#C49A38]/20 blur-2xl" />
            <div className="relative h-40 w-40 rounded-[1.4rem] bg-gradient-to-br from-[#E9C766] via-[#C49A38] to-[#8B6914] p-[3px] shadow-[0_0_40px_rgba(196,154,56,0.35)]">
              <div className="h-full w-full rounded-[1.3rem] border border-[#C49A38]/40 bg-[#0d0a07] p-[2px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/teacher-square.png" alt="مستر محمد صبري" className="h-full w-full rounded-[1.15rem] object-cover" />
              </div>
            </div>
            {/* ميدالية حرف الضاد على ركن الإطار */}
            <div className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#171208] bg-gradient-to-br from-[#E9C766] to-[#8B6914] shadow-lg">
              <span className="text-xl font-bold leading-none text-[#171208]" style={{ fontFamily: 'Amiri, serif' }}>ض</span>
            </div>
          </div>

          <div className="text-center space-y-1.5">
            <h1 className="text-3xl font-bold tracking-wide text-[#E5BE5A] sm:text-4xl" style={{ fontFamily: 'Amiri, serif' }}>
              منصة الأوائل
            </h1>
            <p className="text-sm text-[#C9B48A]" style={{ fontFamily: 'Amiri, serif' }}>مستر محمد صبري — اللغة العربية</p>
          </div>

          {/* فاصل زخرفي مذهب */}
          <div className="flex items-center gap-2 text-[#C49A38]/70" aria-hidden="true">
            <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#C49A38]/70" />
            <span className="text-lg leading-none" style={{ fontFamily: 'Amiri, serif' }}>✦</span>
            <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#C49A38]/70" />
          </div>

          <div className="flex items-center gap-3 justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-[#C49A38]" />
            <p className="text-sm text-[#C9B48A]">جاري التحميل...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={'min-h-screen flex flex-col' + (currentView === 'landing' ? ' sabry-v1' : '')}>
      <VideoProtection />
      <Navbar />

      {currentView === 'landing' && (
        <main className="flex-1">
          <HeroSection />
          {/* (ص5) شريط الحكم والأمثال المتحرك — من الديزاين الأصلي بالحرف */}
          <ProverbsMarquee />

          {/* (ص119) الفيديو التعريفي عن المنصة — بعد الهيرو مباشرة (زي زيكولا) */}
          <Reveal><IntroVideoSection /></Reveal>
          {/* (ص5) تأثير «لما بنزل الحاجات بتتكون» — كل قسم بيظهر بتلاشي وصعود */}
          <Reveal><FeaturesGuideSection /></Reveal>
          <Reveal><FeaturesSection /></Reveal>
          {/* (G-2) فيديو «إزاي تستخدم المنصة» — بعد المميزات وقبل صفوف الصفوف
              الدراسية — وبيظهر بس لما الأدمن يكون ضاف فيديو من لوحة التحكم */}
          <Reveal><HowToVideoSection /></Reveal>
          <Reveal><GradesSection /></Reveal>
          {/* (2026-و29) أفضل 3 طلاب بقوا في النافبار (زرار أوائل الطلبة) بدل الرئيسية */}
          <Reveal><LessonsSection /></Reveal>
          <Reveal><TipsSection /></Reveal>
          {/* (ص119) فيديو تعريف المستر — آخر سكشن في الصفحة
              (ز23: معرض الصور اتشال من المنصة بطلب المستر) */}
          <Reveal><TeacherVideoSection /></Reveal>
        </main>
      )}

      {currentView === 'auth-login' && (
        <main className="flex-1">
          <LoginView />
        </main>
      )}

      {currentView === 'auth-register' && (
        <main className="flex-1">
          <RegisterView />
        </main>
      )}

      {currentView === 'student-pending' && <StudentPendingView />}
      {currentView === 'student-portal' && <StudentPortal />}
      {currentView === 'student-payment' && <StudentPaymentView />}
      {currentView === 'admin-dashboard' && <AdminDashboard />}

      {/* (2026-و37) شاشات ولي الأمر */}
      {currentView === 'parent-login' && (
        <main className="flex-1">
          <ParentLoginView />
        </main>
      )}
      {currentView === 'parent-register' && (
        <main className="flex-1">
          <ParentRegisterView />
        </main>
      )}
      {currentView === 'parent-portal' && <ParentPortal />}

      {showFooter && <Footer />}
      {showWhatsApp && <WhatsAppButton />}
      {showWhatsApp && <FloatingLoginButton />}
    </div>
  )
}
