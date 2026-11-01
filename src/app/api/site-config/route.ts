// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/security/session'
import { slog } from '@/lib/security/logger'

/* (ز35) إغلاق ثغرة تسريب الإعدادات: قبل كده الـ GET بيرجّع كل صفوف
   SiteConfig الخام — بما فيهم session_secret (توقيع الجلسات!) — وأي زائر
   كان يقدر يعمل PUT/POST ويبدّل أي مفتاح من غير تسجيل دخول.
   دلوقتي:
   - GET  → المفاتيح العامة بس (بيانات الصفوف والمواعيد وحماية الفيديو)
   - PUT/POST → جلسة أدمن إجبارية */
var PUBLIC_KEYS = [
  'grades_data',
  'schedule_data',
  'private_schedule_data',
  'video_sequence_lock',
  'wm_enabled',
  'wm_opacity',
  'wm_interval',
]

function isPublic(key) {
  for (var i = 0; i < PUBLIC_KEYS.length; i++) if (PUBLIC_KEYS[i] === key) return true
  return false
}

export async function GET() {
  try {
    const rows = await db.siteConfig.findMany({ orderBy: { updatedAt: 'desc' } })
    var safe = []
    for (var i = 0; i < rows.length; i++) {
      if (!isPublic(rows[i].key)) continue
      safe.push({ key: rows[i].key, value: rows[i].value, updatedAt: rows[i].updatedAt })
    }
    return NextResponse.json(safe)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch configs' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  var denied = await requireAdmin(request)
  if (denied) return denied
  try {
    const { key, value } = await request.json()
    if (!key || typeof key !== 'string' || key.length > 120) {
      return NextResponse.json({ error: 'مفتاح غير صالح' }, { status: 400 })
    }
    /* (ز35) ممنوع الكتابة على أسرار الجلسة من هنا — إدارة السر عن طريق
       متغير البيئة SESSION_SECRET بس */
    if (key === 'session_secret') {
      return NextResponse.json({ error: 'مفتاح محمي' }, { status: 403 })
    }
    const updated = await db.siteConfig.upsert({
      where: { key },
      update: { value: String(value ?? ''), updatedAt: new Date() },
      create: { key, value: String(value ?? '') },
    })
    slog('/api/site-config', 'put', { key: key })
    return NextResponse.json({ key: updated.key, value: updated.value, updatedAt: updated.updatedAt })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  var denied = await requireAdmin(request)
  if (denied) return denied
  try {
    const { key, value } = await request.json()
    if (!key || typeof key !== 'string' || key.length > 120 || key === 'session_secret') {
      return NextResponse.json({ error: 'مفتاح غير صالح' }, { status: 400 })
    }
    const created = await db.siteConfig.upsert({
      where: { key },
      update: { value: String(value ?? ''), updatedAt: new Date() },
      create: { key, value: String(value ?? '') },
    })
    slog('/api/site-config', 'post', { key: key })
    return NextResponse.json({ key: created.key, value: created.value, updatedAt: created.updatedAt })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create config' }, { status: 500 })
  }
}
