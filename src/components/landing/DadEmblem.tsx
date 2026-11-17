'use client'

// ============================================================
// (ر5 — طلب المستر) «لغة الضاد» — الهوية العربية الفخمة:
// «تخليها مثلا الدخلة يكون فيها حرف الضاد مثلا، أو لغة الضاد،
//  أو أي حاجة كده بالعربي طبعا... وتكون أفخم كده»
//
// مكوّنين:
//   DadEmblem   = شارة مربعة فخمة بحرف الضاد الدهبي (للدخول/التسجيل)
//   DadBackdrop = خلفية «لغة الضاد» الكاملة للكارت المربع بتاع
//                 صورة المستر في الهيرو — ض عملاق + زخارف تذهيب
// كلها SVG/CSS خالص بالخطوط العربية المحمّلة في المنصة
// (Aref Ruqaa / Amiri) — من غير أي صور خارجية وبتشتغل بأي مقاس.
// ============================================================

var RUQAA_FONT = "'Aref Ruqaa', 'Amiri', serif"

/* شارة مربعة فخمة: إطار تذهيب + حرف الضاد + لغة الضاد */
export function DadEmblem({ size = 72, showLabel = false }: { size?: number; showLabel?: boolean }) {
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div
        className="relative rounded-2xl p-[2px] shadow-[0_10px_30px_rgba(212,168,67,0.28)]"
        style={{ width: size, height: size, background: 'linear-gradient(135deg,#E5BE5A 0%,#C49A38 45%,#E9C767 70%,#C49A38 100%)' }}
      >
        <div
          className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[14px]"
          style={{ background: 'radial-gradient(115% 95% at 50% 18%, #0e4234 0%, #071a14 62%, #050f0c 100%)' }}
        >
          {/* حلقة زخرفية داخلية */}
          <div className="pointer-events-none absolute inset-[6px] rounded-[10px] border border-[#D4A843]/30" />
          <div className="pointer-events-none absolute inset-[10px] rounded-lg border border-[#D4A843]/15" />
          {/* لمعة قطرية */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(150deg, rgba(233,199,103,0.16) 0%, transparent 38%, transparent 70%, rgba(233,199,103,0.08) 100%)' }}
          />
          {/* حرف الضاد */}
          <span
            className="relative select-none leading-none"
            style={{
              fontFamily: RUQAA_FONT,
              fontSize: size * 0.56,
              background: 'linear-gradient(180deg,#FFF8E7 8%,#E9C767 38%,#C49A38 68%,#E9C767 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 2px 14px rgba(212,168,67,0.35)',
            }}
          >
            ض
          </span>
        </div>
      </div>
      {showLabel ? (
        <span
          className="text-[13px] font-bold tracking-wide"
          style={{ fontFamily: RUQAA_FONT, color: '#E9C767' }}
        >
          لغة الضاد
        </span>
      ) : null}
    </div>
  )
}

/* خلفية «لغة الضاد» الكاملة — بتتحط جوه الكارت المربع بتاع صورة
   المستر: زمرد ملكي + ض عملاق دهبي + زخارف — الصورة بتعرض فوقيه
   كاملة من غير قص (object-contain) فالض بيبان من الجوانب وفوق */
export function DadBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* القاعدة الزمردية الملكية */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 90% at 50% 0%, #0e4234 0%, #071a14 58%, #050f0c 100%)' }}
      />
      {/* إطارات زخرفية */}
      <div className="absolute inset-3 rounded-xl border border-[#D4A843]/20" />
      <div className="absolute inset-5 rounded-lg border border-[#D4A843]/10" />
      {/* زوايا التذهيب */}
      <div className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-[#D4A843]/45" />
      <div className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-[#D4A843]/45" />
      <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-[#D4A843]/45" />
      <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-[#D4A843]/45" />
      {/* ض عملاق دهبي — بيبان من جوانب الصورة وفوقها */}
      <span
        className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 select-none leading-none opacity-70"
        style={{
          fontFamily: RUQAA_FONT,
          fontSize: '13rem',
          background: 'linear-gradient(180deg,#FFF8E7 10%,#E9C767 42%,#C49A38 75%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          filter: 'drop-shadow(0 6px 26px rgba(212,168,67,0.30))',
        }}
      >
        ض
      </span>
      {/* علامات مخطوطة خافتة على الجوانب */}
      <span className="absolute right-6 top-10 select-none text-2xl leading-none text-[#E9C767]/25" style={{ fontFamily: RUQAA_FONT }} aria-hidden="true">ض</span>
      <span className="absolute left-6 top-24 select-none text-xl leading-none text-[#E9C767]/20" style={{ fontFamily: RUQAA_FONT }} aria-hidden="true">ض</span>
      <span className="absolute left-8 bottom-24 select-none text-2xl leading-none text-[#E9C767]/20" style={{ fontFamily: RUQAA_FONT }} aria-hidden="true">ض</span>
      {/* جملة «لغة الضاد» */}
      <span
        className="absolute left-1/2 top-7 -translate-x-1/2 select-none text-base tracking-widest text-[#E9C767]/55"
        style={{ fontFamily: RUQAA_FONT }}
      >
        لغة الضاد
      </span>
    </div>
  )
}
