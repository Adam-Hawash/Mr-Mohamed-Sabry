// @ts-nocheck
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

var globalForPrisma = globalThis
var _prisma = globalForPrisma._prismaInstance

/* (2026-و40) withRetry بقت exported — حارس الترتيب التسلسلي (sequential-guard)
   بيغلف بيها قرايات SQL الخام عشان SQLITE_BUSY/انقطاع لحظي ما يبوّظش فحص التسليم */
export async function withRetry(fn, retries, delayMs) {
  if (retries === void 0) { retries = 3 }
  if (delayMs === void 0) { delayMs = 200 }
  for (var attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      var msg = error && (error.message || '')
      var code = error && (error.code || '')
      var isLocked = msg.indexOf('database is locked') !== -1 || code === 'SQLITE_BUSY'
      var isTransient = code === 'CONNRESET' || code === 'ECONNRESET' || code === 'ETIMEDOUT'
      if ((isLocked || isTransient) && attempt < retries) {
        await new Promise(function (r) { setTimeout(r, delayMs * (attempt + 1)) })
        continue
      }
      throw error
    }
  }
  throw new Error('withRetry: unexpected fallthrough')
}

function createPrismaClient() {
  var dbUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./db/custom.db'

  // Prisma's generated client still reads DATABASE_URL at runtime. Mirror
  // the Turso URL so existing and newly generated clients use the same source.
  if (!process.env.DATABASE_URL && dbUrl !== 'file:./db/custom.db') {
    process.env.DATABASE_URL = dbUrl
  }

  // Use the LibSQL adapter whenever Turso credentials are configured. This
  // also handles Turso URLs copied with the https:// protocol.
  if (process.env.TURSO_AUTH_TOKEN || dbUrl.indexOf('libsql://') === 0 || dbUrl.indexOf('https://') === 0) {
    var authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN || ''
    var libsqlOpts = { url: dbUrl }
    if (authToken) { libsqlOpts.authToken = authToken }
    var adapter = new PrismaLibSQL(libsqlOpts)
    return new PrismaClient({ adapter: adapter, log: [] })
  }

  /* (ص2) على Vercel (serverless) ملف SQLite المرفوع مع الريبو للقراءة فقط —
     ننسخه لـ /tmp القابل للكتابة مرة واحدة لكل instance ونشتغل عليه،
     عشان عمليات الكتابة (طلاب/إعلانات/إعدادات) تشتغل من غير أخطاء.
     محليًا (مفيش VERCEL) بنستخدم الملف زي ما هو */
  if (process.env.VERCEL && dbUrl.indexOf('file:') === 0) {
    try {
      var fsMod = require('fs')
      var pathMod = require('path')
      var WritableDb = '/tmp/mr-sabry-db.sqlite'
      var bundledPath = pathMod.join(process.cwd(), 'db', 'custom.db')
      if (!fsMod.existsSync(WritableDb)) {
        try { if (fsMod.existsSync(bundledPath)) fsMod.copyFileSync(bundledPath, WritableDb) } catch (e) {}
      }
      if (fsMod.existsSync(WritableDb)) {
        dbUrl = 'file:' + WritableDb
        process.env.DATABASE_URL = dbUrl
      }
    } catch (e) {}
  }

  return new PrismaClient({
    log: process.env.NODE_ENV !== 'production' ? ['query'] : [],
  })
}

export var db = _prisma || createPrismaClient()
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma._prismaInstance = db
}

export async function safeWrite(fn) {
  return withRetry(fn, 3, 300)
}
