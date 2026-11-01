// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
/* (ز32 — الأمن الموحد) المسار ده كان بيرمي كل الطلاب بباسورداتهم لأي حد —
   بقى للأدمن الموثّق بس وبمنع نهائي لإخراج أي باسورد */
import { requireAdmin } from '@/lib/security/session'
import { slog } from '@/lib/security/logger'

export async function GET(request: NextRequest) {
  var denied = await requireAdmin(request)
  if (denied) {
    slog('users', 'deny_users_dump', { status: 401 })
    return denied
  }
  try {
    const students = await db.student.findMany({
      orderBy: { createdAt: 'desc' },
    })
    /* (ز32) الباسوردات ممنوعة من أي رد — حتى للأدمن (لو محتاجها يعيد ضبطها من لوحة التحكم) */
    var safe = students.map(function (s: any) {
      var o = Object.assign({}, s)
      delete o.password
      return o
    })
    return NextResponse.json(safe)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
