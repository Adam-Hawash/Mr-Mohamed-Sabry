// ============================================================
// SECURE LOG — سجل عمليات منظم ب Masking كامل للبيانات الحساسة
// ============================================================
// كل سطر سجل شكله: {t, route, event, status, userId, ...meta}
// — وأي مفتاح فيه شبه كلمة (password/token/secret/key/cookie)
// بيتمسح ويتكتب "•••" — الباسوردات والتوكنات والمفاتيح
// عمرها ما بتتسجل في اللوجات نهائيًا.
// ============================================================

var MASK_KEY = /(pass|pwd|token|secret|key|cookie|authorization|auth|sig|password)/i

function maskValue(v: any): any {
  return '•••'
}

function maskDeep(obj: any, depth = 0): any {
  try {
    if (obj === null || obj === undefined) return obj
    if (depth > 4) return '[…]'
    if (Array.isArray(obj)) return obj.slice(0, 20).map(function (x) { return maskDeep(x, depth + 1) })
    if (typeof obj === 'object') {
      var out: Record<string, any> = {}
      var keys = Object.keys(obj)
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i]
        if (MASK_KEY.test(k)) out[k] = maskValue(obj[k])
        else out[k] = maskDeep(obj[k], depth + 1)
      }
      return out
    }
    if (typeof obj === 'string' && obj.length > 300) return obj.slice(0, 300) + '…'
    return obj
  } catch (e) {
    return '[unloggable]'
  }
}

export interface LogFields {
  status?: number
  userId?: string
  ip?: string
  [k: string]: any
}

export function slog(route: string, event: string, fields?: LogFields): void {
  try {
    var entry: Record<string, any> = {
      t: new Date().toISOString(),
      route: route,
      event: event,
    }
    if (fields) {
      var m = maskDeep(fields) as Record<string, any>
      var keys = Object.keys(m)
      for (var i = 0; i < keys.length; i++) entry[keys[i]] = m[keys[i]]
    }
    var line = JSON.stringify(entry)
    if (entry.status && entry.status >= 400) console.error(line)
    else console.log(line)
  } catch (e) {
    // السجل نفسه ممنوع يكسر الطلب أبدًا
  }
}

// خلط المعرّفات الطويلة (studentId مثلًا) في اللوجات العامة — أول 6 حروف بس
export function shortId(id: string | null | undefined): string {
  var s = String(id || '')
  return s ? s.slice(0, 6) + '…' : ''
}
