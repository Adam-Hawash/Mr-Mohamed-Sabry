// ============================================================
// grade-badge — شارة الصف الموحدة (طلب المستر — ر6):
// «خط الارقام العربية بحيث تكون زي الحقيقية بالظبط، زي اللي في
//  الكيبورد» + «مكتوب 6 ب مش كلها في سوا واحد — عايزهم كلهم في
//  سوا واحد»
// ============================================================
// المشكلة اللي كانت: المستر بيكتب في خانة الإيموجي حاجات زي
//   «❹ ب» أو «4️⃣ ث» أو «٤ ع» — فالرقم بيظهر جوه دايرة الإيموجي
//   المرسومة (دينبات مكيّرة) والحرف جنبها لوحده — شكلين منفصلين
//   مش في سوا واحد، وأرقام مش شبه أرقام الكيبورد.
//
// الحل هنا — كل مكان بيعرض شارة الصف بيعدّي على:
//   • gradeBadgeText  = نص واحد متحد «ب4» (الحرف + رقم كيبورد)
//   • isEmojiLike     = هل النص إيموجي حقيقي (🎓 🅱️ ...) يتعرض زي ما هو
//   • gradeOptionLabel= نص خيار القوائم المنسدلة «ب4 — الصف الرابع الابتدائي»
// الأرقام بتتطبع برقم كيبورد غربي واحد (1234567890) من أي صيغة
// كان مكتوب بيها: ٤ / ❹ / 4️⃣ / ４ / ٤️⃣ ...
// ============================================================

export interface GradeBadgeInput {
  emoji?: string
  short?: string
  ar?: string
}

/* كل أشكال الأرقام الممكنة → رقم كيبورد غربي واحد */
var DIGIT_MAP: Record<string, string> = {
  /* أرقام عربية-هندية ٠-٩ */
  '\u0660': '0', '\u0661': '1', '\u0662': '2', '\u0663': '3', '\u0664': '4',
  '\u0665': '5', '\u0666': '6', '\u0667': '7', '\u0668': '8', '\u0669': '9',
  /* أرقام فارسية/ممتدة ۰-۹ */
  '\u06F0': '0', '\u06F1': '1', '\u06F2': '2', '\u06F3': '3', '\u06F4': '4',
  '\u06F5': '5', '\u06F6': '6', '\u06F7': '7', '\u06F8': '8', '\u06F9': '9',
  /* دينبات دايرة سلبية ❶-❿ */
  '\u2776': '1', '\u2777': '2', '\u2778': '3', '\u2779': '4', '\u277A': '5',
  '\u277B': '6', '\u277C': '7', '\u277D': '8', '\u277E': '9', '\u277F': '0',
  /* دينبات دايرة أبيض ➀-➓ */
  '\u2780': '1', '\u2781': '2', '\u2782': '3', '\u2783': '4', '\u2784': '5',
  '\u2785': '6', '\u2786': '7', '\u2787': '8', '\u2788': '9', '\u2789': '0',
  /* دينبات دايرة مقلوبة ⓵-⓾ */
  '\u24F5': '1', '\u24F6': '2', '\u24F7': '3', '\u24F8': '4', '\u24F9': '5',
  '\u24FA': '6', '\u24FB': '7', '\u24FC': '8', '\u24FD': '9', '\u24FE': '0',
  /* دايرة عادية ①-⑳ */
  '\u2460': '1', '\u2461': '2', '\u2462': '3', '\u2463': '4', '\u2464': '5',
  '\u2465': '6', '\u2466': '7', '\u2467': '8', '\u2468': '9', '\u2469': '0',
  '\u246A': '1', '\u246B': '2', '\u246C': '3', '\u246D': '4', '\u246E': '5',
  '\u246F': '6', '\u2470': '7', '\u2471': '8', '\u2472': '9', '\u2473': '0',
  /* بين قوسين ⑴-⑳ */
  '\u2474': '1', '\u2475': '2', '\u2476': '3', '\u2477': '4', '\u2478': '5',
  '\u2479': '6', '\u247A': '7', '\u247B': '8', '\u247C': '9', '\u247D': '0',
  /* نقطة ⒈-⒛ */
  '\u2488': '1', '\u2489': '2', '\u248A': '3', '\u248B': '4', '\u248C': '5',
  '\u248D': '6', '\u248E': '7', '\u248F': '8', '\u2490': '9', '\u2491': '0',
  /* دايرة مزدوجة ⓫-⓮ */
  '\u24EB': '1', '\u24EC': '2', '\u24ED': '3', '\u24EE': '4', '\u24EF': '5',
  '\u24F0': '6', '\u24F1': '7', '\u24F2': '8', '\u24F3': '9', '\u24F4': '0',
  /* fullwidth ０-９ */
  '\uFF10': '0', '\uFF11': '1', '\uFF12': '2', '\uFF13': '3', '\uFF14': '4',
  '\uFF15': '5', '\uFF16': '6', '\uFF17': '7', '\uFF18': '8', '\uFF19': '9',
}

/* حروف زخرفية/تحكم لازم تتشال عشان النص يطلع نضيف في سوا واحد */
var STRIP_RE = /[\uFE0F\u200D\u200C\u200B\u20E3\uFE0E\u0640]/g

/* حرف عربي (للتمييز بين الحرف والإيموجي) */
var ARABIC_LETTER_RE = /[\u0620-\u063A\u0641-\u064A\u0671-\u06D3]/

function toKeyboardDigits(s: string): string {
  var out = ''
  for (var i = 0; i < s.length; i++) {
    var ch = s.charAt(i)
    if (DIGIT_MAP[ch]) { out += DIGIT_MAP[ch]; continue }
    if (ch >= '0' && ch <= '9') { out += ch; continue }
    out += ch
  }
  return out
}

/* هل النص ده إيموجي/رمز حقيقي يتعرض زي ما هو؟ (من غير أرقام وحروف عربية) */
export function isEmojiLike(text: string): boolean {
  var t = String(text || '').replace(STRIP_RE, '').trim()
  if (!t) return false
  for (var i = 0; i < t.length; i++) {
    var ch = t.charAt(i)
    if (ch === ' ') continue
    if (DIGIT_MAP[ch]) return false
    if (ch >= '0' && ch <= '9') return false
    if (ARABIC_LETTER_RE.test(ch)) return false
  }
  return true
}

/*
  نص الشارة الموحدة — الحرف والرقم مع بعض في نص واحد:
  «❹ ب» / «٤ ب» / «4️⃣ ب» / «ب4» → «ب4» (يتعرض RTL: الرقم شمال والحرف يمين)
  إيموجي حقيقي (🎓) → بيرجع زي ما هو مع isEmojiLike
*/
export function gradeBadgeParts(item: GradeBadgeInput | null | undefined): { text: string; emoji: boolean } {
  var raw = String((item && item.emoji) || '').trim() || String((item && item.short) || '').trim() || ''
  if (!raw) return { text: '', emoji: false }
  var cleaned = toKeyboardDigits(String(raw).replace(STRIP_RE, ''))
  var letters = ''
  var digits = ''
  for (var i = 0; i < cleaned.length; i++) {
    var ch = cleaned.charAt(i)
    if (ch === ' ') continue
    if (ch >= '0' && ch <= '9') { digits += ch; continue }
    if (ARABIC_LETTER_RE.test(ch)) { letters += ch; continue }
    /* أي رمز تاني (إيموجي حقيقي/علامة) → النص الأصلي يتعرض زي ما هو */
    if (!digits && !letters) return { text: String(raw), emoji: true }
    return { text: String(raw), emoji: true }
  }
  if (letters && digits) return { text: letters + digits, emoji: false }
  if (digits) return { text: digits, emoji: false }
  if (letters) return { text: letters, emoji: false }
  return { text: String(raw), emoji: true }
}

/* نفس gradeBadgeParts بس بفولباك لحرف أول الاسم — لشارات فاضية */
export function gradeBadgeText(item: GradeBadgeInput | null | undefined): string {
  var p = gradeBadgeParts(item)
  if (p.text) return p.text
  var ar = String((item && item.ar) || '').trim()
  return ar ? ar.charAt(0) : ''
}

/* نص خيار القوائم المنسدلة — الشارة الموحدة + الاسم الكامل */
export function gradeOptionLabel(item: GradeBadgeInput & { ar?: string } | null | undefined): string {
  if (!item) return ''
  var badge = gradeBadgeParts(item)
  var ar = String(item.ar || '').trim()
  if (badge.emoji && badge.text) return (badge.text + ' ' + ar).trim()
  if (badge.text) return (badge.text + ' \u2014 ' + ar).trim()
  return ar
}
