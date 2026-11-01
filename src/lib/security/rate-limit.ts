// ============================================================
// RATE LIMIT — حماية من إغراق الـ API واستهلاك حدود Vercel
// ============================================================
// مبدأ العمل: نافذة منزلقة (Sliding Window) في ذاكرة السيرفر.
// مفتاح الحد = اسم البوابة + IP العميل (+ معرّف الحساب في الدخول)
// — يعني محاولات تخمين الباسورد لحساب واحد بتتقفل بعد 5 محاولات في
// الدقيقة، وأي IP بيحاول يضرب أكتر من حساب بيتقفل بعد 30 طلب/دقيقة.
// ملاحظة صريحة: في بيئة Serverless الحد ده لكل نسخة Function شغّالة
// (per-instance) — بيوقف الهجمات العملية فعليًا، ومش بيقفل مستخدمين
// حقيقيين لأن النوافذ قصيرة (دقيقة) والاستجابة بترجع Retry-After.
// ============================================================
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

type Hits = number[]

var _buckets = new Map<string, Hits>()
var _lastSweep = 0

function sweep(now: number): void {
  if (now - _lastSweep < 60_000 && _buckets.size < 8000) return
  _lastSweep = now
  _buckets.forEach(function (hits, key) {
    var alive = hits.filter(function (t) { return now - t < 120_000 })
    if (alive.length === 0) _buckets.delete(key)
    else _buckets.set(key, alive)
  })
}

export interface RateResult {
  ok: boolean
  remaining: number
  retryAfterSec: number
}

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  var now = Date.now()
  sweep(now)
  var hits = (_buckets.get(key) || []).filter(function (t) { return now - t < windowMs })
  if (hits.length >= limit) {
    _buckets.set(key, hits)
    var retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - hits[0])) / 1000))
    return { ok: false, remaining: 0, retryAfterSec: retryAfterSec }
  }
  hits.push(now)
  _buckets.set(key, hits)
  return { ok: true, remaining: Math.max(0, limit - hits.length), retryAfterSec: 0 }
}

// IP الحقيقي للعميل (خلف Vercel/بروكسي)
export function clientIp(req: { headers: { get(name: string): string | null } }): string {
  try {
    var xff = req.headers.get('x-forwarded-for') || ''
    var first = xff.split(',')[0].trim()
    if (first) return first
    return req.headers.get('x-real-ip') || 'unknown'
  } catch (e) {
    return 'unknown'
  }
}

// ============================================================
// (ز32+) حد مشترك على قاعدة البيانات — بيشتغل صح حتى لو الطلبات
// وزعت على نسخ Serverless متعددة (الذاكرة لوحدها لكل نسخة).
// بيستخدم جدول RateLimitHit (key, ts) — ولو الداتابيز مش متاحة
// بيرجع null والكود بيكمل بالذاكرة المحلية (fail-open للتوافر).
// ============================================================
var _rlTableReady = false

export async function dbRateLimit(key: string, limit: number, windowMs: number): Promise<RateResult | null> {
  try {
    if (!db) return null
    if (!_rlTableReady) {
      try {
        await db.$executeRawUnsafe('CREATE TABLE IF NOT EXISTS RateLimitHit (key TEXT NOT NULL, ts INTEGER NOT NULL)')
        try { await db.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS idx_rlhit_key_ts ON RateLimitHit(key, ts)') } catch (e) {}
        _rlTableReady = true
      } catch (e) { /* هيحاول تاني المرة الجاية */ }
    }
    /* (ز32) بنشتغل بالثواني مش المللي ثانية — لأن Prisma بيقيد
       باراميترات الأرقام في INT32 (أقصى 2,147,483,647) والمللي ثانية
       بتوفرفلوو. الثواني آمنة لحد 2038. */
    var nowSec = Math.floor(Date.now() / 1000)
    var cutoffSec = nowSec - Math.ceil(windowMs / 1000)
    var rows: any[] = []
    try {
      rows = (await db.$queryRawUnsafe(
        'SELECT ts FROM RateLimitHit WHERE key = ? AND ts > ? ORDER BY ts ASC',
        key, cutoffSec
      )) || []
    } catch (e) {
      rows = []
    }
    if (rows.length >= limit) {
      var oldest = rows.length ? Number(rows[0].ts) : nowSec
      var retryAfterSec = Math.max(1, Math.ceil((oldest + Math.ceil(windowMs / 1000)) - nowSec))
      return { ok: false, remaining: 0, retryAfterSec: retryAfterSec }
    }
    try {
      await db.$executeRawUnsafe('INSERT INTO RateLimitHit (key, ts) VALUES (?, ?)', key, nowSec)
    } catch (e) {
      return null
    }
    // تنظيف هادئ عشوائي (~4% من النداءات) — الجدول ميبقاش ضخم
    if (Math.random() < 0.04) {
      try { await db.$executeRawUnsafe('DELETE FROM RateLimitHit WHERE ts < ?', nowSec - 600) } catch (e) {}
    }
    return { ok: true, remaining: Math.max(0, limit - rows.length - 1), retryAfterSec: 0 }
  } catch (e) {
    return null
  }
}

// رد 429 موحّد — بيوضّح للمستخدم ليه اتمنع وبيقول يجرب إمتى
export function tooManyResponse(retryAfterSec: number): NextResponse {
  var res = NextResponse.json(
    { error: 'محاولات كتير أوي — استنى ' + Math.max(1, retryAfterSec) + ' ثانية وجرب تاني', code: 'rate_limited' },
    { status: 429 }
  )
  res.headers.set('Retry-After', String(Math.max(1, retryAfterSec)))
  res.headers.set('Cache-Control', 'no-store')
  return res
}

// استخدام مباشر: حد على (البوابة + IP)
export function enforceRate(
  req: { headers: { get(name: string): string | null } },
  gate: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  var r = rateLimit(gate + '|' + clientIp(req), limit, windowMs)
  return r.ok ? null : tooManyResponse(r.retryAfterSec)
}

// استخدام الدخول: حد مضاعف — 5 محاولات/دقيقة لكل (IP + حساب) و30/دقيقة لكل IP
// identifier = رقم الموبايل/الإيميل اللي بيحاول يدخل بيه
// (ز32+) حد الـ 5 محاولات بقى **مشترك على الداتابيز** — بيشيل التخمين
// حتى لو الطلبات وزعت على نسخ Serverless مختلفة
export async function enforceAuthRate(
  req: { headers: { get(name: string): string | null } },
  gate: string,
  identifier: string
): Promise<NextResponse | null> {
  var ip = clientIp(req)
  var idPart = String(identifier || '').replace(/[^0-9a-zA-Z@._-]/g, '').slice(0, 40)
  // 1) الحد الحرج (5/دقيقة لكل حساب) — على الداتابيز المشتركة أولًا
  var dbRes = await dbRateLimit(gate + '|acct|' + ip + '|' + idPart, 5, 60_000)
  if (dbRes) {
    if (!dbRes.ok) return tooManyResponse(dbRes.retryAfterSec)
  } else {
    // fallback: الذاكرة المحلية (لو الداتابيز مش متاحة)
    var perAccount = rateLimit(gate + '|acct|' + ip + '|' + idPart, 5, 60_000)
    if (!perAccount.ok) return tooManyResponse(perAccount.retryAfterSec)
  }
  // 2) الحد الخشن (30/دقيقة لكل IP) — ذاكرة محلية كفاية
  var perIp = rateLimit(gate + '|ip|' + ip, 30, 60_000)
  if (!perIp.ok) return tooManyResponse(perIp.retryAfterSec)
  return null
}
