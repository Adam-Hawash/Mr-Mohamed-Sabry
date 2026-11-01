// ============================================================
// (ز32 — الأمن الموحد) POST /api/security/session-clear
// ============================================================
// تسجيل الخروج الإجباري الموحّد: بيمسح كوكيز الجلسات الثلاثة
// (طالب/ولي أمر/أدمن) من متصفح العميل — بيتنادى من DevToolsGuard
// عند انتهاء مهلة الـ 10 ثواني ومن أي تسجيل خروج عادي.
// ============================================================
import { NextResponse } from 'next/server'
import { clearSessionCookieHeader } from '@/lib/security/session'
import { slog } from '@/lib/security/logger'

export const runtime = 'nodejs'

export async function POST() {
  var res = NextResponse.json({ ok: true })
  res.headers.append('Set-Cookie', clearSessionCookieHeader('student'))
  res.headers.append('Set-Cookie', clearSessionCookieHeader('parent'))
  res.headers.append('Set-Cookie', clearSessionCookieHeader('admin'))
  res.headers.set('Cache-Control', 'no-store')
  slog('security/session-clear', 'sessions_cleared', { status: 200 })
  return res
}
