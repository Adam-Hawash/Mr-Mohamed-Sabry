// ============================================================
// (ز32 — الأمن الموحد) POST /api/security/devtools-strike
// ============================================================
// المواصفات الجديدة: العقوبة على فتح أدوات المطوّر = تسجيل خروج
// إجباري فقط (حذف الجلسة) — **مفيش أي حذف لحسابات أو بيانات**.
// المسار ده بقى سجل أمني بس: بيوثّق المحاولة (Route/الوقت/IP مقنّع)
// عشان المستر يقدر يتابع المحاولات، وبيرجع ok دايمًا.
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { slog, shortId } from '@/lib/security/logger'
import { clientIp, enforceRate } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // حد بسيط يمنع إغراق السجل
  var limited = enforceRate(request, 'devtools-strike', 10, 60_000)
  if (limited) return limited
  try {
    var body: any = {}
    try { body = await request.json() } catch (e) { body = {} }
    slog('security/devtools-strike', 'devtools_detected_signout', {
      status: 200,
      ip: clientIp(request),
      userId: shortId(body.studentId),
      action: String(body.action || 'signout'),
    })
    return NextResponse.json({ ok: true, deleted: false, signedOut: true })
  } catch (error: any) {
    // السجل نفسه ممنوع يفشل الطلب
    return NextResponse.json({ ok: true, deleted: false, signedOut: true })
  }
}
