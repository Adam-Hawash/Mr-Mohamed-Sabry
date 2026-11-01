// ============================================================
// (ز32 — الأمن الموحد) GET /api/admin/backup — النسخ الاحتياطي
// ============================================================
// نسخة احتياطية JSON كاملة من قاعدة البيانات — للأدمن فقط
// (جلسة أدمن موقّعة إجبارية). بيسمح تصدير جدول محدد بـ ?tables= أو
// الكل. الاستخدام الموصى به: نسخة دورية قبل أي تغيير كبير + إمكانية
// الرجوع (Rollback) للمحتوى.
// ⚠️ الملف الناتج فيه بيانات حساسة — يتخزن في مكان آمن وميتبعتش لأحد.
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/security/session'
import { slog } from '@/lib/security/logger'

export const runtime = 'nodejs'
export var maxDuration = 60

var SAFE_TABLE_RE = /^[A-Za-z_][A-Za-z0-9_]*$/

export async function GET(request: NextRequest) {
  var denied = await requireAdmin(request)
  if (denied) return denied

  try {
    var url = new URL(request.url)
    var wanted = (url.searchParams.get('tables') || '')
      .split(',')
      .map(function (s) { return s.trim() })
      .filter(Boolean)

    var tables: string[] = []
    try {
      var master: any[] = await db.$queryRawUnsafe(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '\\_%' ESCAPE '\\' ORDER BY name"
      )
      for (var i = 0; i < master.length; i++) {
        var n = String(master[i].name || '')
        if (SAFE_TABLE_RE.test(n)) tables.push(n)
      }
    } catch (e) {
      tables = []
    }
    if (!tables.length) {
      return NextResponse.json({ error: 'تعذّر قراءة جداول قاعدة البيانات' }, { status: 500 })
    }
    if (wanted.length) {
      tables = tables.filter(function (t) { return wanted.indexOf(t) !== -1 })
    }

    var data: Record<string, any[]> = {}
    var counts: Record<string, number> = {}
    for (var t = 0; t < tables.length; t++) {
      var name = tables[t]
      try {
        var rows: any[] = await db.$queryRawUnsafe('SELECT * FROM "' + name + '" LIMIT 200000')
        // تحويل BigInt/Buffer لقيم JSON آمنة
        var clean = rows.map(function (r: any) {
          var o: Record<string, any> = {}
          var ks = Object.keys(r)
          for (var k = 0; k < ks.length; k++) {
            var v = r[ks[k]]
            if (typeof v === 'bigint') o[ks[k]] = Number(v)
            else if (v instanceof Date) o[ks[k]] = v.toISOString()
            else if (v instanceof Uint8Array) o[ks[k]] = '<binary>'
            else o[ks[k]] = v
          }
          return o
        })
        data[name] = clean
        counts[name] = clean.length
      } catch (e) {
        data[name] = []
        counts[name] = -1
      }
    }

    slog('admin/backup', 'backup_exported', { status: 200, tables: Object.keys(counts).length })

    var body = JSON.stringify({
      generatedAt: new Date().toISOString(),
      platform: process.env.VERCEL_PROJECT_PRODUCTION_URL || 'platform',
      meta: 'نسخة احتياطية كاملة — تحتوي بيانات حساسة، تتخزن في مكان آمن فقط',
      tables: data,
    })
    var stamp = new Date().toISOString().slice(0, 10)
    var res = new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="backup-' + stamp + '.json"',
        'Cache-Control': 'no-store',
      },
    })
    return res
  } catch (error: any) {
    slog('admin/backup', 'backup_error', { status: 500, err: String(error && error.message).slice(0, 200) })
    return NextResponse.json({ error: 'فشل إنشاء النسخة الاحتياطية' }, { status: 500 })
  }
}
