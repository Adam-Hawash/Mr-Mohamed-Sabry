import { NextRequest, NextResponse } from 'next/server'
import { makeLibsqlClient, ensureSchema } from '@/lib/ensure-schema'
/* (ز32 — الأمن الموحد) بعد أول إعداد — إعادة ضبط السكيمة للأدمن بس */
import { hasAdminSession } from '@/lib/security/session'
import { db } from '@/lib/db'

async function needsBootstrap(): Promise<boolean> {
  try {
    var admins: any[] = await db.$queryRawUnsafe('SELECT COUNT(*) as c FROM Admin')
    return !admins || !admins.length || Number(admins[0].c) === 0
  } catch (e) { return true }
}

export async function GET(request: NextRequest) {
  try {
    /* (ز32) ممنوع أي حد يفرض سكيمة جديدة بعد ما المنصة اشتغلت — bootstrap فقط أو أدمن */
    if (!(await needsBootstrap())) {
      var sbDenied = await hasAdminSession(request)
      if (!sbDenied) return NextResponse.json({ error: 'المنصة مُعدّة بالفعل — الإعداد للأدمن بس', code: 'session' }, { status: 401 })
    }
    var client = makeLibsqlClient()
    if (!client) return NextResponse.json({ ok: false, error: 'DATABASE_URL not set' }, { status: 500 })

    var outcome = await ensureSchema(client, { force: true })

    try { await client.close() } catch (e) {}
    return NextResponse.json({ ok: true, missing: outcome.missing, results: outcome.results })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) { return GET(request) }
