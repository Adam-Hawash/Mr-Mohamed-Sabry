// (ز32 — مؤقت للتشخيص فقط — هيتشال بعد التحقق)
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
  var res = NextResponse.json(out)
  res.headers.set('Cache-Control', 'no-store')
  return res
}
