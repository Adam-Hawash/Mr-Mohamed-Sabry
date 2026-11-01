'use client'
// ============================================================
// DevToolsGuard — نظام مكافحة الفحص (Anti-DevTools) — المواصفات الموحدة
// ============================================================
// «عند فتح أدوات المطور (F12 / Inspect / اختصارات الكونسول):
//   1) شاشة سوداء كاملة تحجب الموقع فورًا
//   2) رسالة تحذير بعداد تنازلي 10 ثواني:
//      «تم اكتشاف محاولة فحص الموقع… سيتم تسجيل خروجك خلال N ثانية»
//   3) انتهاء المهلة → تسجيل خروج إجباري (حذف الجلسة من السيرفر
//      والمتصفح) وإعادة التوجيه لصفحة تسجيل الدخول
//   4) إغلاق الأدوات خلال المهلة → الشاشة تختفي وكل حاجة ترجع طبيعية»
//
// الكشف: توقيت جملة debugger (من غير إنذارات كاذبة — اخد درس ز11:
// كاشف مقاس النافذة اتشال خالص بسبب زووم 125%/150% وسايدبارات المتصفح).
// الأدمن مستثنى (المستر يفتح الأدوات براحته — مفتاح mg_admin).
// ملاحظة: هنا مفيش أي حذف للحسابات — العقوبة = تسجيل خروج بس
// (حماية للطلاب من أي إساءة استخدام لطلب المسح).
// ============================================================
import { useEffect } from 'react'

const COUNT_SECONDS = 10

export function DevToolsGuard() {
  useEffect(function () {
    if (typeof window === 'undefined') return

    /* الأدمن مستثنى — جلسة الأدمن المحفوظة (mg_admin) = مش هنشغّل الحارس */
    try {
      if (localStorage.getItem('mg_admin')) return
    } catch (e) {}

    var overlay: HTMLElement | null = null
    var numEl: HTMLElement | null = null
    var barEl: HTMLElement | null = null
    var hits = 0
    var cleanStreak = 0
    var left = COUNT_SECONDS
    var active = false
    var done = false

    /* تسجيل خروج إجباري: حذف جلسة الكوكيز من السيرفر + مسح الجلسات المحلية
       + إعادة توجيه لصفحة تسجيل الدخول */
    function forceSignOut() {
      done = true
      active = false
      try {
        fetch('/api/security/session-clear', { method: 'POST', keepalive: true }).catch(function () {})
      } catch (e) {}
      try {
        var kill: string[] = []
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i) || ''
          if (k === 'ln' || /student|parent|admin/i.test(k)) kill.push(k)
        }
        for (var j = 0; j < kill.length; j++) localStorage.removeItem(kill[j])
      } catch (e) {}
      // سجل الأمن: السيرفر بيسجل الحدث (من غير أي حذف لحساب حد)
      try {
        fetch('/api/security/devtools-strike', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'signout' }),
          keepalive: true,
        }).catch(function () {})
      } catch (e) {}
      try { location.replace('/') } catch (e2) { window.location.href = '/' }
    }

    /* كشف واحد — true يعني أدوات المطوّر مفتوحة فعلًا دلوقتي */
    function detectOnce(): boolean {
      var t0 = (window.performance && performance.now) ? performance.now() : Date.now()
      try {
        /* جملة debugger داخل دالة متولدة — لو الأدوات مفتوحة التنفيذ بيفصل عندها */
        (function () {} as any).constructor('debugger')()
      } catch (e) {}
      var dt = ((window.performance && performance.now) ? performance.now() : Date.now()) - t0
      return dt > 50
    }

    function baseStyles(): string {
      return 'position:fixed;inset:0;z-index:2147483647;background:#000;display:flex;align-items:center;justify-content:center;direction:rtl;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#fff;text-align:center;padding:24px'
    }

    function render() {
      var existing = document.getElementById('dv-guard') as HTMLElement | null
      if (!existing) {
        overlay = document.createElement('div')
        overlay.id = 'dv-guard'
        overlay.setAttribute('role', 'alert')
        overlay.setAttribute('aria-live', 'assertive')
        overlay.style.cssText = baseStyles()
        document.body.appendChild(overlay)
        try { document.body.style.overflow = 'hidden' } catch (e) {}
      } else {
        overlay = existing
      }
      var o = overlay as HTMLElement
      o.innerHTML =
        '<div style="max-width:540px;display:flex;flex-direction:column;align-items:center;gap:18px">' +
        '<div style="font-size:60px;line-height:1">🛡️</div>' +
        '<div style="font-size:22px;font-weight:900;letter-spacing:.5px">تم اكتشاف محاولة فحص الموقع</div>' +
        '<div style="font-size:15px;color:#d4d4d8;line-height:1.9">يرجى إغلاق أدوات المطوّر فورًا — سيتم تسجيل خروجك من حسابك خلال <b id="dv-num" style="color:#f87171;font-size:20px">' + left + '</b> ثانية</div>' +
        '<div style="width:100%;max-width:340px;height:8px;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden">' +
        '<div id="dv-bar" style="height:100%;width:' + Math.max(0, (left / COUNT_SECONDS) * 100) + '%;background:#f87171;border-radius:99px;transition:width 1s linear"></div>' +
        '</div>' +
        '<div style="font-size:12px;color:#71717a">لو قفلت أدوات المطوّر قبل الصفر ترجع تعادي عادي من غير خروج</div>' +
        '</div>'
      numEl = o.querySelector('#dv-num')
      barEl = o.querySelector('#dv-bar')
    }

    function hide() {
      var o = document.getElementById('dv-guard')
      if (o && o.parentNode) o.parentNode.removeChild(o)
      overlay = null
      try { document.body.style.overflow = '' } catch (e) {}
    }

    function tick() {
      if (done) return
      var open = detectOnce()
      if (open) { cleanStreak = 0; hits++ } else { cleanStreak++; hits = 0 }
      if (!active) {
        if (hits >= 2) {
          active = true
          left = COUNT_SECONDS
          render()
        }
      } else {
        if (open) {
          left--
          if (left <= 0) { forceSignOut(); return }
          if (numEl) numEl.textContent = String(left)
          if (barEl) barEl.style.width = Math.max(0, (left / COUNT_SECONDS) * 100) + '%'
        } else if (cleanStreak >= 2) {
          /* قفل الأدوات خلال المهلة — رجوع طبيعي بالكامل */
          active = false
          hits = 0
          cleanStreak = 0
          left = COUNT_SECONDS
          hide()
        }
      }
      /* لو حد شال العنصر نفسه من الـ DOM بالأدوات — بنرجّعه فورًا */
      if (active && !document.getElementById('dv-guard')) render()
    }

    var timer = setInterval(tick, 1000)
    return function () { clearInterval(timer) }
  }, [])
  return null
}
