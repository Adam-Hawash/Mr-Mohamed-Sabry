/* ============================================================
   (و64) نظام اللغة — عربي/إنجليزي حقيقي.
   (ص2) لمنصة مستر محمد صبري للغة العربية: **العربية هي الافتراضي** —
   الطالب يفتح يلاقي منصته عربي RTL، واللي يحب يبدّل إنجليزي يتفكر.
   - زر واحد في كل المنصة بيقلّب النصوص + اتجاه الصفحة (rtl/ltr)
   - الاختيار محفوظ في localStorage (ms_lang) وبيرجع مع أول تحميل
   ============================================================ */
'use client'

import { useEffect } from 'react'
import { create } from 'zustand'

export type Lang = 'ar' | 'en'

var LANG_KEY = 'ms_lang'

/* (ص117) طلب المستر: منصة عربي بس من غير تبديل لغات —
   أي استدعاء بيتجاهل ويطبّق عربي RTL على كل الحالات */
function applyToDocument(l: Lang) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = 'ar'
  document.documentElement.dir = 'rtl'
}

export function readStoredLang(): Lang {
  /* (ص117) عربي بس — أي قيمة قديمة محفوظة (en) بتت تجاهل */
  return 'ar'
}

interface LangStore {
  lang: Lang
  setLang: (l: Lang) => void
}

export var useLangStore = create<LangStore>(function () {
  return {
    /* (ص2) الافتراضي عربي — منصة اللغة العربية */
    lang: 'ar',
    setLang: function (l) {
      /* (ص117) التبديل اتشال — بيفضل عربي مهما حصل */
      try { window.localStorage.setItem(LANG_KEY, 'ar') } catch (e) { /* صامت */ }
      applyToDocument('ar')
      useLangStore.setState({ lang: 'ar' })
    },
  }
})

/* useT — hook الترجمة: بيسجّل في ستور اللغة، فأي تبديل بيعيد رسم
   المكوّن فورًا. الاستخدام: var T = useT(); T('المجتمع', 'Community') */
export function useT() {
  /* (ص117) عربي بس — النص الإنجليزي بيتتجاهل في كل المنصة */
  return function (ar: string, en: string): string {
    return ar
  }
}

/* t — نسخة بدون hook (للكود اللي مش جوه رندر) — مش بيعيد الرسم لوحده */
export function t(ar: string, en: string): string {
  /* (ص117) عربي بس */
  return ar
}

export function currentLang(): Lang {
  return useLangStore.getState().lang
}

/* (و72) اختيار قيمة نصية من كونفيج الأدمن حسب لغة الزائر:
   إنجليزي بقرأ المفتاح *_en (لو الأدمن كاتبه أو فيه افتراضي)،
   عربي بقرأ المفتاح الأساسي — المستر يكتب كل لغة لوحده من لوحة التحكم */
export function pickConfig(cfg: any, key: string, lang: string, arFallback?: string, enFallback?: string): string {
  /* (ص117) عربي بس — مفاتيح *_en مش بتتقري تاني */
  var v = cfg ? cfg[key] : ''
  if (v && String(v).trim() !== '') return String(v)
  return arFallback || ''
}

/* LangBoot — بيركّب مرة واحدة في layout.tsx: بيقرأ اللغة المحفوظة
   ويطبّق dir/lang على <html> بعد أول تحميل (قبل كده سكريبت الـ head
   بيتكفل بالموضوع قبل الرسم عشان مفيش وميض اتجاه غلط) */
export function LangBoot() {
  useEffect(function () {
    /* (ص117) عربي RTL ثابت */
    applyToDocument('ar')
    useLangStore.setState({ lang: 'ar' })
  }, [])
  return null
}
