#!/usr/bin/env node
/* ============================================================
   (ر8) نقل قاعدة بيانات المنصة من الملف المحلي إلى Turso
   ------------------------------------------------------------
   الاستخدام:
     1) اعمل قاعدة مجانية على https://dashboard.turso.tech (بدون بطاقة)
     2) هات الـ URL والـ Token من صفحة القاعدة
     3) شغّل:
        TURSO_DATABASE_URL="libsql://xxx.turso.io" \
        TURSO_AUTH_TOKEN="eyJ..." \
        node scripts/migrate-to-turso.mjs

   بيقرا db/custom.db وينقل الجداول والبيانات كلها للسحابة،
   وبعدها المنصة على كلاود فلير تشتغل على طول بنفس البيانات.
   ============================================================ */
import { createClient } from '@libsql/client'
import fs from 'node:fs'
import path from 'node:path'

var LOCAL_FILE = process.env.LOCAL_DB || path.join(process.cwd(), 'db', 'custom.db')
var REMOTE_URL = process.env.TURSO_DATABASE_URL || process.argv[2] || ''
var REMOTE_TOKEN = process.env.TURSO_AUTH_TOKEN || process.argv[3] || ''

function fail(msg) {
  console.error('\n❌ ' + msg + '\n')
  process.exit(1)
}

if (!fs.existsSync(LOCAL_FILE)) fail('ملف القاعدة المحلي مش موجود: ' + LOCAL_FILE)
if (!REMOTE_URL || (REMOTE_URL.indexOf('libsql://') !== 0 && REMOTE_URL.indexOf('https://') !== 0)) {
  fail('محتاج TURSO_DATABASE_URL بصيغة libsql://xxxx.turso.io — هاته من dashboard.turso.tech')
}
if (!REMOTE_TOKEN) fail('محتاج TURSO_AUTH_TOKEN — من صفحة القاعدة في Turso → Generate Token')

var local = createClient({ url: 'file:' + LOCAL_FILE })
var remote = createClient({ url: REMOTE_URL, authToken: REMOTE_TOKEN })

var CHUNK = 40 // عدد الصفوف في كل دفعة — عشان الطلبات ما تبقاش ضخمة

async function main() {
  console.log('\n🚀 بدء الترحيل من: ' + LOCAL_FILE)
  console.log('🎯 إلى: ' + REMOTE_URL + '\n')

  /* 1) قايمة الجداول */
  var tablesRes = await local.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations' ORDER BY name"
  )
  var tables = tablesRes.rows.map(function (r) { return String(r.name) })
  console.log('📋 عدد الجداول: ' + tables.length + ' → ' + tables.join(', ') + '\n')

  var totalRows = 0
  for (var t = 0; t < tables.length; t++) {
    var table = tables[t]
    /* إنشاء الجدول بنفس الهيكل */
    var ddlRes = await local.execute(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='" + table.replace(/'/g, "''") + "'"
    )
    var ddl = ddlRes.rows.length ? String(ddlRes.rows[0].sql) : null
    if (ddl) {
      try { await remote.execute('DROP TABLE IF EXISTS "' + table + '"') } catch (e) {}
      await remote.execute(ddl)
    }
    /* نقل البيانات */
    var rowsRes = await local.execute('SELECT * FROM "' + table.replace(/'/g, "''") + '"')
    var rows = rowsRes.rows
    var cols = rowsRes.columns
    if (!rows.length) { console.log('— ' + table + ': فاضي (اتعمل الهيكل بس)'); continue }

    var placeholders = '(' + cols.map(function () { return '?' }).join(',') + ')'
    for (var i = 0; i < rows.length; i += CHUNK) {
      var slice = rows.slice(i, i + CHUNK)
      var sql = 'INSERT OR IGNORE INTO "' + table.replace(/'/g, "''") + '" (' +
        cols.map(function (c) { return '"' + c + '"' }).join(',') + ') VALUES ' +
        slice.map(function () { return placeholders }).join(',')
      var args = []
      for (var s = 0; s < slice.length; s++) {
        for (var c = 0; c < cols.length; c++) args.push(slice[s][c])
      }
      await remote.execute({ sql: sql, args: args })
    }
    totalRows += rows.length
    console.log('✅ ' + table + ': ' + rows.length + ' صف اتنقلوا')
  }

  /* 2) الفهارس — بعد البيانات عشان الإدراج يبقى أسرع */
  var idxRes = await local.execute(
    "SELECT name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%'"
  )
  for (var ix = 0; ix < idxRes.rows.length; ix++) {
    try { await remote.execute(String(idxRes.rows[ix].sql)) } catch (e) { /* موجود بالفعل */ }
  }

  console.log('\n🎉 تم الترحيل بنجاح — إجمالي ' + totalRows + ' صف عبر ' + tables.length + ' جدول')
  console.log('📌 الخطوة الأخيرة: حط في كلاود فلير (Workers → Settings → Variables and Secrets):')
  console.log('   TURSO_DATABASE_URL=' + REMOTE_URL)
  console.log('   TURSO_AUTH_TOKEN=*** (التوكن ميتنشرش في الكود أبدًا)')
  console.log('   CLOUDFLARE=1\n')
}

main().catch(function (e) { fail('الترحيل وقع: ' + (e && e.message ? e.message : e)) })
