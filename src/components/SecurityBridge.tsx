// ============================================================
// SecurityBridge — جسر الجلسة على الكلاينت (ز32 — الأمن الموحد)
// ============================================================
// مهمته واحدة: لو أي API رجّع 401 بكود 'session' (انتهت الجلسة أو
// التوكن مش مطابق) — بيمسح جلسات المتصفح ويرجّع المستخدم لصفحة
// تسجيل الدخول تلقائيًا. كده أي مستخدم قديم قبل تحديث الأمن بيتم
// توجيهه لإعادة الدخول بسلاسة بدل ما يشوف أخطاء غريبة.
// مركّب مرة واحدة في layout — بيرقّع fetch بدون ما يغيّر أي نداء موجود.
// ============================================================
'use client'
import { useEffect } from 'react'

export function SecurityBridge() {
  useEffect(function () {
    if (typeof window === 'undefined') return
    var w = window as any
    if (w.__mg_sec_bridge) return
    w.__mg_sec_bridge = true

    var origFetch = window.fetch.bind(window)
    window.fetch = function (...args: any[]) {
      var res = origFetch.apply(null, args as any)
      return Promise.resolve(res).then(function (response: Response) {
        try {
          if (response && response.status === 401) {
            var url = typeof args[0] === 'string' ? args[0] : ((args[0] && args[0].url) || '')
            if (String(url).indexOf('/api/') === 0 || String(url).indexOf('api/') === 0) {
              var clone = response.clone()
              clone
                .json()
                .then(function (j: any) {
                  if (j && j.code === 'session') {
                    try {
                      var kill: string[] = []
                      for (var i = 0; i < localStorage.length; i++) {
                        var k = localStorage.key(i) || ''
                        if (k === 'ln' || /student|parent|admin/i.test(k)) kill.push(k)
                      }
                      for (var x = 0; x < kill.length; x++) localStorage.removeItem(kill[x])
                    } catch (e) {}
                    if (location.pathname !== '/') location.replace('/')
                  }
                })
                .catch(function () {})
            }
          }
        } catch (e) {}
        return response
      })
    }
  }, [])
  return null
}
