// ============================================================
// FILE: src/lib/remove-white-bg.ts
// (ص120) شيل الخلفية البيضا من صورة المستر تلقائيًا وقت الرفع.
//
// ليه؟ المستر بيرفع صورة «من غير خلفية» بس كتير من الصور اللي
// بتتنزل من جوجل هي PNG/JPG بخلفية بيضا مثبتة جواها — فالمنصة
// كانت بتعرضها بالأبيض زي ما هي والشكل بيبوظ.
//
// الخوارزمية (فوق الكانفس في المتصفح — من غير أي سيرفر أو مكتبة):
//   1) نرسم الصورة على canvas (بحد أقصى 1600px عشان السرعة).
//   2) Flood-fill (BFS) من كل بكسل على حدود الصورة: أي بكسل
//      «أبيض مائل» متوصل بالحدود بيتخلى شفاف (alpha=0).
//      — Flood-fill من الحواف مش مسح عام: الأبيض جوه الشخص
//        (قميص/أبيض العين/لمعات) متيوصلش بالحدود فيفضل سليم.
//   3) تنعيم الحواف: البكسلات اللي جنب المناطق الشفافة ولوحة
//      فاتحة بتاخد شفافية جزئية (يتقشر الهالة البيضا حوالين الشخص).
//   4) لو اللي اتشال أقل من 1% من الصورة → الصورة أصلًا من غير
//      خلفية بيضا → نرجّع الملف الأصلي زي ما هو (مفيش داعي للمعالجة).
// ============================================================

var MAX_DIM = 1600
var WHITE_LUMA = 232 // سطوع يعتبر «أبيض»
var MAX_SAT = 42 // تشبّع أقصى للبيض (عشان ما نمسكش ألوان فاتحة)

function isWhitish(r: number, g: number, b: number): boolean {
  var mx = Math.max(r, g, b)
  var mn = Math.min(r, g, b)
  if (mx < WHITE_LUMA) return false
  if (mx - mn > MAX_SAT) return false
  return true
}

/* درجة البياض 0..1 — بتستخدم في تنعيم الحواف */
function whiteness(r: number, g: number, b: number): number {
  var mx = Math.max(r, g, b)
  var mn = Math.min(r, g, b)
  var luma = 0.299 * r + 0.587 * g + 0.114 * b
  var sat = mx - mn
  var l = Math.max(0, Math.min(1, (luma - 190) / 65))
  var s = Math.max(0, 1 - sat / 90)
  return l * s
}

export var removeWhiteBgResult = { removed: 0 }

/**
 * بيرجّع File جاهز للرفع:
 *  - لو الصورة فيها خلفية بيضا متوصلة بالحواف → PNG شفاف جديد.
 *  - لو مفيش خلفية بيضا مفهومة → نفس الملف الأصلي زي ما هو.
 *  - لو حصلت أي مشكلة → نفس الملف الأصلي (الرفع عمرو ما يفشل بسببنا).
 */
export async function removeWhiteBackground(file: File): Promise<File> {
  try {
    if (typeof document === 'undefined') return file
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file

    var bitmap = await createImageBitmap(file)
    var w = bitmap.width
    var h = bitmap.height
    if (!w || !h) return file

    /* تصغير لو الصورة ضخمة — الكانفس أسرع والنتيجة برضه كويسة */
    var scale = Math.min(1, MAX_DIM / Math.max(w, h))
    var cw = Math.max(1, Math.round(w * scale))
    var ch = Math.max(1, Math.round(h * scale))

    var canvas = document.createElement('canvas')
    canvas.width = cw
    canvas.height = ch
    var ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, cw, ch)
    bitmap.close && bitmap.close()

    var img = ctx.getImageData(0, 0, cw, ch)
    var px = img.data
    var total = cw * ch

    /* الصورة الأصلية فيها شفافية من الأول؟ ساعتها مفيش شغل */
    var hadAlpha = false
    for (var a = 3; a < px.length; a += 4) {
      if (px[a] < 250) { hadAlpha = true; break }
    }
    if (hadAlpha) return file

    /* لو الصورة JPG أصلاً ومفيش بياض على الحواف خالص → مش صورتك المطلوبة */
    var borderWhitish = 0
    var borderCount = 0
    for (var x = 0; x < cw; x++) {
      for (var yy of [0, ch - 1]) {
        borderCount++
        var i0 = (yy * cw + x) * 4
        if (isWhitish(px[i0], px[i0 + 1], px[i0 + 2])) borderWhitish++
      }
    }
    for (var y = 0; y < ch; y++) {
      for (var xx of [0, cw - 1]) {
        borderCount++
        var j0 = (y * cw + xx) * 4
        if (isWhitish(px[j0], px[j0 + 1], px[j0 + 2])) borderWhitish++
      }
    }
    /* الحدود مش بيضاء خالص → مفيش خلفية بيضا حوالين الصورة */
    if (borderCount === 0 || borderWhitish / borderCount < 0.35) return file

    /* ===== Flood-fill من الحواف ===== */
    var visited = new Uint8Array(total)
    var queue = new Int32Array(total)
    var qh = 0
    var qt = 0
    function push(idx: number) {
      if (visited[idx]) return
      visited[idx] = 1
      queue[qt++] = idx
    }
    /* زرع كل بكسل حدود أبيض كبداية */
    for (var bx = 0; bx < cw; bx++) {
      var t0 = bx
      var b0 = (ch - 1) * cw + bx
      var ti = t0 * 4
      var bi = b0 * 4
      if (isWhitish(px[ti], px[ti + 1], px[ti + 2])) push(t0)
      if (isWhitish(px[bi], px[bi + 1], px[bi + 2])) push(b0)
    }
    for (var by = 0; by < ch; by++) {
      var l0 = by * cw
      var r0 = by * cw + (cw - 1)
      var li = l0 * 4
      var ri = r0 * 4
      if (isWhitish(px[li], px[li + 1], px[li + 2])) push(l0)
      if (isWhitish(px[ri], px[ri + 1], px[ri + 2])) push(r0)
    }

    var removed = 0
    while (qh < qt) {
      var cur = queue[qh++]
      var ci = cur * 4
      px[ci + 3] = 0
      removed++
      var cx = cur % cw
      var cy = (cur - cx) / cw
      /* الجيران الأربعة */
      if (cx > 0) {
        var n = cur - 1
        var ni = n * 4
        if (!visited[n] && isWhitish(px[ni], px[ni + 1], px[ni + 2])) push(n)
      }
      if (cx < cw - 1) {
        var n2 = cur + 1
        var ni2 = n2 * 4
        if (!visited[n2] && isWhitish(px[ni2], px[ni2 + 1], px[ni2 + 2])) push(n2)
      }
      if (cy > 0) {
        var n3 = cur - cw
        var ni3 = n3 * 4
        if (!visited[n3] && isWhitish(px[ni3], px[ni3 + 1], px[ni3 + 2])) push(n3)
      }
      if (cy < ch - 1) {
        var n4 = cur + cw
        var ni4 = n4 * 4
        if (!visited[n4] && isWhitish(px[ni4], px[ni4 + 1], px[ni4 + 2])) push(n4)
      }
    }

    /* لو اللي اتشال أقل من 1% → الصورة مش بخلفية بيضا فعلًا */
    if (removed < total * 0.01) return file

    /* ===== تنعيم الهالة: بكسلات صلبة جنب شفافة وفاتحة → شفافية جزئية ===== */
    var soft = new Uint8Array(total) /* نسخة عشان ما نأثرش على القرار أثناء المشي */
    for (var sy = 0; sy < ch; sy++) {
      for (var sx = 0; sx < cw; sx++) {
        var sIdx = sy * cw + sx
        if (px[sIdx * 4 + 3] === 0) continue
        var nearTransparent =
          (sx > 0 && px[(sIdx - 1) * 4 + 3] === 0) ||
          (sx < cw - 1 && px[(sIdx + 1) * 4 + 3] === 0) ||
          (sy > 0 && px[(sIdx - cw) * 4 + 3] === 0) ||
          (sy < ch - 1 && px[(sIdx + cw) * 4 + 3] === 0)
        if (!nearTransparent) continue
        var ki = sIdx * 4
        var wn = whiteness(px[ki], px[ki + 1], px[ki + 2])
        if (wn > 0.25) soft[sIdx] = 1
        px[ki + 3] = Math.min(px[ki + 3], Math.round(255 * Math.max(0.35, 1 - wn * 0.9)))
      }
    }
    /* جولة تانية بهدوء عشان تدرج أنعم (بكسلين من الحافة) */
    for (var sy2 = 0; sy2 < ch; sy2++) {
      for (var sx2 = 0; sx2 < cw; sx2++) {
        var s2 = sy2 * cw + sx2
        if (px[s2 * 4 + 3] === 0 || soft[s2]) continue
        var nearSoft =
          (sx2 > 0 && soft[s2 - 1]) ||
          (sx2 < cw - 1 && soft[s2 + 1]) ||
          (sy2 > 0 && soft[s2 - cw]) ||
          (sy2 < ch - 1 && soft[s2 + cw])
        if (!nearSoft) continue
        var k2 = s2 * 4
        var wn2 = whiteness(px[k2], px[k2 + 1], px[k2 + 2])
        if (wn2 > 0.35) px[k2 + 3] = Math.min(px[k2 + 3], 235)
      }
    }

    ctx.putImageData(img, 0, 0)
    var blob: Blob | null = await new Promise(function (res) {
      canvas.toBlob(function (b) { return res(b) }, 'image/png')
    })
    if (!blob) return file

    var baseName = String(file.name || 'photo').replace(/\.[^.]+$/, '')
    var out = new File([blob], baseName + '-transparent.png', { type: 'image/png' })
    removeWhiteBgResult.removed = removed
    return out
  } catch (e) {
    /* أي مشكلة → الملف الأصلي زي ما هو */
    return file
  }
}
