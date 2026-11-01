import { NextRequest, NextResponse } from "next/server";
/* (S-4a — توحيد الصفوف) المرجع الموحد */
import { storeGrade } from '@/lib/grade-names'
import { db } from "@/lib/db";
/* (ز32 — الأمن الموحد) تحقق صارم بـ Zod + حد التسجيل */
import { studentRegisterSchema, parseWith, readJson } from "@/lib/security/validate";
import { enforceRate } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    /* (ز32) حد التسجيل: 10/دقيقة لكل IP */
    var rateLimited = enforceRate(req, "student-register-api", 10, 60_000);
    if (rateLimited) return rateLimited;

    var parsed = await readJson(req, 100_000);
    if (!parsed.ok) {
      return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
    }
    var check = parseWith(studentRegisterSchema, parsed.data);
    if (!check.ok) return check.res;
    var v = check.data;
    var name = v.name;
    var phone = v.phone;
    var password = v.password;
    var grade = v.grade;
    var parentName = v.parentName;
    var parentPhone = v.parentPhone;

    const cleanPhone = String(phone).trim();

    // التحقق هل رقم الهاتف مسجل مسبقاً
    const existing = await db.student.findUnique({
      where: { phone: cleanPhone },
    });

    if (existing) {
      return NextResponse.json(
        { error: "رقم الهاتف مسجل مسبقاً، يمكنك تسجيل الدخول مباشرة" },
        { status: 400 }
      );
    }

    // إنشاء حساب الطالب بنجاح
    const student = await db.student.create({
      data: {
        name: String(name).trim(),
        phone: cleanPhone,
        password: String(password),
        /* (S-4a — توحيد الصفوف) الكتابة دايمًا بالاسم المعتمد الكامل */
        grade: storeGrade(grade || "تالتة إعدادي"),
        parentName: parentName ? String(parentName).trim() : "",
        parentPhone: parentPhone ? String(parentPhone).trim() : "",
        status: "active",
        isPaidAccess: false,
        loginCount: 1,
        lastLogin: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        phone: student.phone,
        grade: student.grade,
        status: student.status,
        isPaidAccess: student.isPaidAccess,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "حدث خطأ أثناء إنشاء الحساب" },
      { status: 500 }
    );
  }
}
