// ============================================================
// VALIDATE — تحقّق صارم من كل مدخل قادم من المستخدم (Zod Schemas)
// ============================================================
// كل حقل بيدخل السيرفر بيمرّ على سكيما صارمة (نوع + طول + شكل)
// قبل ما يلمس قاعدة البيانات — منع المدخلات الشاذة والحقن.
// قاعدة البيانات نفسها بتوصل عبر Prisma (Prepared Statements) أو
// $queryRawUnsafe/$executeRawUnsafe **ب باراميترات (?) فقط** —
// ممنوع نهائيًا تلاسق نصوص SQL مع مدخلات المستخدم.
// ============================================================
import { NextResponse } from 'next/server'
import { z } from 'zod'

// تطبيع أرقام الموبايل المصرية: أرقام عربية/فارسية → لاتيني + شيل كل حاجة غير الرقم
export function normalizeDigits(v: unknown): string {
  var t = String(v || '')
  t = t.replace(/[٠-٩]/g, function (d) { return String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)) })
  t = t.replace(/[۰-۹]/g, function (d) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)) })
  return t.replace(/[^0-9+]/g, '')
}

export var phoneSchema = z
  .string()
  .transform(normalizeDigits)
  .pipe(z.string().min(7, 'رقم الهاتف قصير').max(20, 'رقم الهاتف طويل'))

export var passwordSchema = z.string().min(3, 'كلمة المرور قصيرة').max(64, 'كلمة المرور طويلة')

export var nameSchema = z.string().trim().min(2, 'الاسم قصير').max(80, 'الاسم طويل')

export var studentRegisterSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  password: passwordSchema,
  grade: z.string().trim().min(1).max(60).optional(),
  parentName: z.string().trim().max(80).optional(),
  parentPhone: z.string().trim().max(20).optional(),
})

export var studentLoginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
})

export var parentLoginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
})

export var parentRegisterSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  password: passwordSchema,
  studentName: z.string().trim().min(2).max(80).optional(),
  studentPhone: z.string().trim().max(20).optional(),
  studentPassword: z.string().max(64).optional(),
  parentPhone: z.string().trim().max(20).optional(),
})

export var adminLoginSchema = z.object({
  email: z.string().trim().min(2).max(80),
  password: z.string().min(3).max(80),
})

// ---------- أدوات الاستخدام ----------

// قراءة JSON من الطلب بحد أقصى للحجم (منع الحمولات الضخمة)
export async function readJson(req: Request, maxBytes = 2_000_000): Promise<{ ok: boolean; data: any }> {
  try {
    var len = parseInt(req.headers.get('content-length') || '0', 10)
    if (len && len > maxBytes) return { ok: false, data: null }
    var text = await req.text()
    if (text.length > maxBytes) return { ok: false, data: null }
    return { ok: true, data: JSON.parse(text) }
  } catch (e) {
    return { ok: false, data: null }
  }
}

// تحقّق سكيما → إما البيانات أو رد 400 جاهز
export function parseWith<T>(schema: z.ZodType<T>, data: unknown): { ok: true; data: T } | { ok: false; res: NextResponse } {
  var result = schema.safeParse(data)
  if (!result.success) {
    var first = (result.error && result.error.issues && result.error.issues[0]) || null
    var msg = first ? String(first.message || 'بيانات غير صالحة') : 'بيانات غير صالحة'
    var res = NextResponse.json({ error: msg, code: 'invalid_input' }, { status: 400 })
    res.headers.set('Cache-Control', 'no-store')
    return { ok: false, res: res }
  }
  return { ok: true, data: result.data }
}
