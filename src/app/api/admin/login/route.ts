// @ts-nocheck
import { NextResponse } from 'next/server'
import { db, safeWrite } from '@/lib/db'
import { enforceAuthRate } from '@/lib/security/rate-limit'
import { signSession, sessionCookieHeader } from '@/lib/security/session'
import { slog } from '@/lib/security/logger'

export var maxDuration = 10

/* (2026-ص4-ر) بيانات المشرف الرئيسية — رجّعناها زي ما كانت الأصل:
   محمد صبري عربي26 / محمد صبري# — طلب المستر: «منصة صبري ما تلعبش في الباسورد بتاعتها»
   لو صف القاعدة اتزامن بالبيانات القديمة الغلط → أول دخول بالبيانات الأصلية
   بيرجّع صف القاعدة عليها (مصدر حقيقة واحد) */
var DEFAULT_EMAIL = 'محمد صبري عربي26'
var DEFAULT_PASSWORD = 'محمد صبري#'
var ADMIN_NAME = 'Mr. Mohamed Sabry'

export async function POST(request) {
  var body
  try {
    body = await request.json()
  } catch (e) {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }

  var email = body.email
  var password = body.password

  if (!email || !password) {
    return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبين' }, { status: 400 })
  }

  /* (ز32) حد المحاولات: 5/دقيقة لكل (IP+حساب) و30/دقيقة لكل IP — منع التخمين */
  var limited = await enforceAuthRate(request, 'admin-login', email)
  if (limited) return limited

  // squash = strip ALL whitespace from both sides before comparing — the DB
  // may hold values like "sherif math@2026" / "mr sherif2026#" and the admin
  // may type them without (or with different) spaces. Never fail on spaces.
  var squash = function (v: any) { return String(v || '').replace(/\s+/g, '').toLowerCase() }
  var cleanEmail = squash(email)
  var cleanPassword = squash(password)
  /* (ز32) بوابة المشرفين المخفية: رقم الدخول الموحد 55555555555 بيتعامل
     كاسم دخول بديل — التحقق الحقيقي على كلمة السر زي ما هي (التحقق اتنقل
     من كود الواجهة للسيرفر — الباسورد عمره ما كان في الـ bundle) */
  if (cleanEmail === '55555555555') cleanEmail = squash(DEFAULT_EMAIL)

  try {
    var admin = await db.admin.findFirst()

    if (!admin) {
      if (cleanEmail !== squash(DEFAULT_EMAIL) || cleanPassword !== squash(DEFAULT_PASSWORD)) {
        return NextResponse.json({ error: 'البريد أو كلمة المرور غلط' }, { status: 401 })
      }
      admin = await safeWrite(function() {
        return db.admin.create({
          data: { email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD, name: ADMIN_NAME },
        })
      })
    } else {
      if (cleanEmail !== squash(admin.email) || cleanPassword !== squash(admin.password)) {
        /* (2026-ص4-ر) بيانات القاعدة مختلفة → اللي بيكتب البيانات الأصلية بيدخل
           ومزامنة صف القاعدة عليها — وغير كده رفض زي ما هو */
        if (cleanEmail !== squash(DEFAULT_EMAIL) || cleanPassword !== squash(DEFAULT_PASSWORD)) {
          return NextResponse.json({ error: 'البريد أو كلمة المرور غلط' }, { status: 401 })
        }
        var synced = await safeWrite(function() {
          return db.admin.update({
            where: { id: admin.id },
            data: { email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD },
          })
        })
        if (synced) admin = synced
      }
    }

    var adminWithoutPassword = { id: admin.id, email: admin.email, name: admin.name, createdAt: admin.createdAt, updatedAt: admin.updatedAt }

    /* (ز32) جلسة أدمن موقّعة HttpOnly — كل مسارات الأدمن الحساسة بتعتمد عليها */
    var token = await signSession(admin.id, 'admin')
    var res = NextResponse.json({
      message: 'تم تسجيل الدخول',
      admin: adminWithoutPassword,
    })
    res.headers.append('Set-Cookie', sessionCookieHeader('admin', token))
    res.headers.set('Cache-Control', 'no-store')
    slog('admin/login', 'admin_login_ok', { status: 200, userId: String(admin.id).slice(0, 6) + '…' })
    return res
  } catch (error) {
    console.error('Admin login error:', error)
    slog('admin/login', 'admin_login_error', { status: 500 })
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
