// ============================================================
// SESSION GUARD — جلسات موقّعة HttpOnly + حرّاس الصلاحيات (Anti-IDOR)
// ============================================================
// الفكرة: أول ما أي حد يسجّل دخول (طالب/ولي أمر/أدمن) السيرفر بيصدر
// توكن موقّع HMAC-SHA256 وبيبعته كوكي HttpOnly (متنسرقش بـ XSS ومش
// مقروء من الـ JS ولا من أدوات المطوّر). كل واجهة API حساسة بتستدعي
// requireStudent / requireParent / requireAdmin اللي بتتحقق إن:
//   1) التوقيع صحيح والتوكن مش منتهي
//   2) الدور (role) مطابق
//   3) الـ id اللي جوه التوكن هو نفسه id المورد المطلوب —
//      يعني مينفش تغيير ID في الرابط توصّل لبيانات حد تاني (IDOR).
// ده هو تطبيق "Row-Level" على مستوى التطبيق: كل استعلام بيمشي
// بمعرّف موثّق من الجلسة مش من العميل.
// ============================================================
import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export type SessionRole = 'student' | 'parent' | 'admin'

export interface SessionPayload {
  id: string
  role: SessionRole
  exp: number // epoch ms
}

const ROLE_TTL_DAYS: Record<SessionRole, number> = { student: 30, parent: 30, admin: 7 }

// ---------------- المفتاح السري (Server-side فقط) ----------------
var _secret: string | null = null
/* (ز35) إصلاح «انتهت صلاحية الجلسة» المتقطعة في لوحة الأدمن:
   قبل كده أول نداء بعد cold start لو قعدة الداتابيز فشلت (حاجة شائعة على
   Vercel/Turso) كان بيكاش سر الـ fallback للأبد — فبتبقى نسختين على
   Vercel بسرين مختلفين: تسجيل الدخول على نسخة والتحقق على نسخة تانية
   = 401 عشوائي «انتهت الجلسة». دلوقتي:
   - سر البيئة/الصف بيتكاش بس لما يتنجح فعلاً
   - فشل الداتابيز بيرجّع fallback مؤقت **من غير تخزين** ويجرب تاني في
     النداء الجاي — فكل النسخ بتركع على نفس سر الصف أول ما الداتابيز تظبط */

async function getServerSecret(): Promise<string> {
  if (_secret) return _secret
  // 1) متغير بيئة لو موجود
  var envSecret = process.env.SESSION_SECRET
  if (envSecret && String(envSecret).length >= 16) {
    _secret = String(envSecret)
    return _secret
  }
  // 2) مفتاح عشوائي متخزن في SiteConfig — بمحاولتين لو الداتابيز بتتلخبط
  for (var attempt = 0; attempt < 2; attempt++) {
    try {
      var row: any = await (db as any).siteConfig.findUnique({ where: { key: 'session_secret' } })
      if (row && row.value) {
        _secret = String(row.value)
        return _secret
      }
      // الصف مش موجود — حاول تعمله مرة واحدة
      var fresh = crypto.randomBytes(32).toString('hex')
      try {
        await (db as any).siteConfig.create({ data: { key: 'session_secret', value: fresh } })
        _secret = fresh
        return _secret
      } catch (e2) {
        // اتعمل في نفس اللحظة من نسخة تانية — اقراه
        try {
          var again: any = await (db as any).siteConfig.findUnique({ where: { key: 'session_secret' } })
          if (again && again.value) {
            _secret = String(again.value)
            return _secret
          }
        } catch (e3) {}
        break
      }
    } catch (e) {
      // فشل شبكة — محاولة تانية قبل fallback
    }
  }
  // 3) fallback مستقر لكن **مؤقت** — مش بيتكاش عشان النسخ متتفرقش
  return buildFallbackSecret()
}

function buildFallbackSecret(): string {
  var base = String(
    process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'local-db'
  )
  return crypto
    .createHash('sha256')
    .update(base + '|mg-session-v1|' + String(process.env.VERCEL_URL || ''))
    .digest('hex')
}

// ---------------- التوقيع والتحقق ----------------
export async function signSession(id: string, role: SessionRole): Promise<string> {
  var secret = await getServerSecret()
  var payload: SessionPayload = {
    id: String(id),
    role: role,
    exp: Date.now() + ROLE_TTL_DAYS[role] * 24 * 3600 * 1000,
  }
  var body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  var sig = crypto.createHmac('sha256', secret).update(body).digest('base64url')
  return body + '.' + sig
}

export async function verifySessionToken(token: string | null | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  var parts = String(token).split('.')
  if (parts.length !== 2) return null
  var body = parts[0]
  var sig = parts[1]
  try {
    var secret = await getServerSecret()
    var expected = crypto.createHmac('sha256', secret).update(body).digest('base64url')
    if (sig.length !== expected.length) return null
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
    var payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload
    if (!payload || !payload.id || !payload.exp) return null
    if (payload.exp < Date.now()) return null
    if (['student', 'parent', 'admin'].indexOf(payload.role) === -1) return null
    return payload
  } catch (e) {
    return null
  }
}

// ---------------- الكوكيز ----------------
export function sessionCookieName(role: SessionRole): string {
  return 'mg_sess_' + role
}

export function sessionCookieHeader(role: SessionRole, token: string): string {
  var maxAge = ROLE_TTL_DAYS[role] * 24 * 3600
  var parts = [
    sessionCookieName(role) + '=' + encodeURIComponent(token),
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=' + maxAge,
  ]
  if (process.env.NODE_ENV === 'production') parts.push('Secure')
  return parts.join('; ')
}

export function clearSessionCookieHeader(role: SessionRole): string {
  var parts = [sessionCookieName(role) + '=', 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0']
  if (process.env.NODE_ENV === 'production') parts.push('Secure')
  return parts.join('; ')
}

function readCookie(req: { headers: { get(name: string): string | null } }, name: string): string | null {
  try {
    var raw = req.headers.get('cookie') || ''
    var segs = raw.split(/; */)
    for (var i = 0; i < segs.length; i++) {
      var eq = segs[i].indexOf('=')
      if (eq === -1) continue
      var k = segs[i].slice(0, eq).trim()
      if (k === name) return decodeURIComponent(segs[i].slice(eq + 1))
    }
  } catch (e) {}
  return null
}

// كل الجلسات الصالحة الموجودة في الطلب (طالب + ولي أمر + أدمن مع بعض ممكن)
export async function readSessions(req: {
  headers: { get(name: string): string | null }
}): Promise<SessionPayload[]> {
  var out: SessionPayload[] = []
  var roles: SessionRole[] = ['student', 'parent', 'admin']
  for (var i = 0; i < roles.length; i++) {
    var tok = readCookie(req, sessionCookieName(roles[i]))
    if (!tok) continue
    var p = await verifySessionToken(tok)
    if (p) out.push(p)
  }
  return out
}

// ---------------- رد الرفض الموحّد ----------------
export function denySession(reason?: string): NextResponse {
  var res = NextResponse.json(
    {
      error: reason || 'انتهت الجلسة أو الصلاحية غير كافية — سجّل دخولك من جديد',
      code: 'session',
    },
    { status: 401 }
  )
  res.headers.set('Cache-Control', 'no-store')
  return res
}

// ---------------- الحرّاس (Guards) ----------------
// الطالب: لازم جلسة طالب صالحة بنفس الـ id المطلوب (RLS على مستوى التطبيق)
export async function requireStudent(
  req: { headers: { get(name: string): string | null } },
  studentId: string | null | undefined
): Promise<NextResponse | null> {
  var sid = String(studentId || '')
  if (!sid) return denySession()
  var sessions = await readSessions(req)
  for (var i = 0; i < sessions.length; i++) {
    if (sessions[i].role === 'student' && sessions[i].id === sid) return null
  }
  return denySession()
}

// ولي الأمر: جلسة ولي أمر صالحة بنفس الـ id
export async function requireParent(
  req: { headers: { get(name: string): string | null } },
  parentId: string | null | undefined
): Promise<NextResponse | null> {
  var pid = String(parentId || '')
  if (!pid) return denySession()
  var sessions = await readSessions(req)
  for (var i = 0; i < sessions.length; i++) {
    if (sessions[i].role === 'parent' && sessions[i].id === pid) return null
  }
  return denySession()
}

// الأدمن: جلسة أدمن صالحة — ولو معرّف محدد مطلوب لازم يطابقه
// (تُستخدم مع فحص isAdmin(adminId) الموجود في المسارات كطبقة تانية)
export async function requireAdmin(
  req: { headers: { get(name: string): string | null } },
  expectedAdminId?: string | null | undefined
): Promise<NextResponse | null> {
  var sessions = await readSessions(req)
  for (var i = 0; i < sessions.length; i++) {
    if (sessions[i].role !== 'admin') continue
    if (expectedAdminId && sessions[i].id !== String(expectedAdminId)) continue
    return null
  }
  return denySession()
}

// هل الطلب فيه جلسة طالب صاحبة نفس الـ id؟ (للمسارات اللي بتسمح للطالب أو الأدمن)
export async function hasStudentSession(
  req: { headers: { get(name: string): string | null } },
  studentId: string
): Promise<boolean> {
  var sessions = await readSessions(req)
  for (var i = 0; i < sessions.length; i++) {
    if (sessions[i].role === 'student' && sessions[i].id === String(studentId)) return true
  }
  return false
}

// هل الطلب فيه أي جلسة أدمن صالحة؟
export async function hasAdminSession(req: {
  headers: { get(name: string): string | null }
}): Promise<boolean> {
  var sessions = await readSessions(req)
  for (var i = 0; i < sessions.length; i++) {
    if (sessions[i].role === 'admin') return true
  }
  return false
}
