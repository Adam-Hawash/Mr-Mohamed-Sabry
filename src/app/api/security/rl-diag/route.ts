// (ز32 — مؤقت للتشخيص فقط — هيتشال بعد التحقق)
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/security/rate-limit'

export async function GET(request: NextRequest) {
  var out: Record<string, any> = {}
  try {
    try {
      await db.$executeRawUnsafe('CREATE TABLE IF NOT EXISTS RateLimitHit (key TEXT NOT NULL, ts INTEGER NOT NULL)')
      out.create = 'ok'
    } catch (e: any) { out.create = String(e && e.message).slice(0, 150) }
    var nowSec = Math.floor(Date.now() / 1000)
    try {
      await db.$executeRawUnsafe('INSERT INTO RateLimitHit (key, ts) VALUES (?, ?)', 'diag|probe', nowSec)
      out.insert = 'ok'
    } catch (e: any) { out.insert = String(e && e.message).slice(0, 150) }
    try {
      var rows: any[] = (await db.$queryRawUnsafe('SELECT ts FROM RateLimitHit WHERE key = ? AND ts > ?', 'diag|probe', nowSec - 60)) || []
      out.selectCount = rows.length
      out.firstTs = rows.length ? Number(rows[0].ts) : null
    } catch (e: any) { out.selectErr = String(e && e.message).slice(0, 150) }
    try {
      var all: any[] = (await db.$queryRawUnsafe("SELECT COUNT(*) as c FROM RateLimitHit WHERE key = 'diag|probe'")) || []
      out.total = Number(all[0].c)
    } catch (e: any) { out.totalErr = String(e && e.message).slice(0, 150) }
    try { await db.$executeRawUnsafe("DELETE FROM RateLimitHit WHERE key = 'diag|probe'") } catch (e: any) { out.delErr = String(e && e.message).slice(0, 100) }
  } catch (e: any) {
    out.fatal = String(e && e.message).slice(0, 150)
  }
  // اختبار الدالة الفعلية للمحدد (ميموري + داتابيز)
  try {
    var mod = await import('@/lib/security/rate-limit')
    var probeKey = 'diag|fnprobe|' + Math.floor(Date.now() / 30000)
    var mem1 = mod.rateLimit(probeKey, 2, 60_000)
    var mem2 = mod.rateLimit(probeKey, 2, 60_000)
    var mem3 = mod.rateLimit(probeKey, 2, 60_000)
    out.memTest = [mem1.ok, mem2.ok, mem3.ok]
  } catch (e: any) { out.memTestErr = String(e && e.message).slice(0, 150) }
  // اختبار مباشر لدالة حد الداتابيز كما تشغل في الإنتاج
  try {
    var mod2 = await import('@/lib/security/rate-limit')
    var pk = 'diag|dbfn|' + Math.floor(Date.now() / 30000)
    var d1 = await mod2.dbRateLimit(pk, 2, 60_000)
    var d2 = await mod2.dbRateLimit(pk, 2, 60_000)
    var d3 = await mod2.dbRateLimit(pk, 2, 60_000)
    out.dbFnTest = [d1, d2, d3].map(function (r: any) { return r ? r.ok : null })
  } catch (e: any) { out.dbFnErr = String(e && e.message).slice(0, 200) }
  var res = NextResponse.json(out)
  res.headers.set('Cache-Control', 'no-store')
  return res
}
