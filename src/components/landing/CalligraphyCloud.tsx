'use client'

// ============================================================
// FILE: src/components/landing/CalligraphyCloud.tsx
// (ص121) «السحابة المخطوطة» — زي سحابة منصة مستر أحمد شعبان:
// سحابة حقيقية ظاهرة تحت صورة المستر (الصورة واقفة جواها) بس
// بهوية منصّة اللغة العربية — جسم مخطوطة كريمي + حدود تذهيب
// + كلمات عربية (نحو إعراب بلاغة إملاء قراءة أدب) واقفة عليها.
//
// وكمان فيها CalligraphyMist — ضباب كلمات خافت طاير حوالين
// الصورة (طبقة خلفية ورا القصاصة).
//
// الاتنين بيظهروا **بس** لما صورة المستر تكون بوضع
// «صورة نضيفة بدون إطار».
// ============================================================

import { motion } from 'framer-motion'

/* ===== الكلمات الطايرة حوالين الصورة (الضباب الخلفي) ===== */
var MIST_WORDS = [
  { t: 'إملاء', x: '4%', y: '16%', s: '1.5rem', r: -12, o: 0.4, d: 0 },
  { t: 'قراءة', x: '76%', y: '10%', s: '1.7rem', r: 10, o: 0.42, d: 0.6 },
  { t: 'نحو', x: '80%', y: '44%', s: '1.9rem', r: -6, o: 0.45, d: 1.1 },
  { t: 'إعراب', x: '0%', y: '56%', s: '1.4rem', r: 12, o: 0.35, d: 1.6 },
  { t: 'بلاغة', x: '72%', y: '74%', s: '1.6rem', r: -9, o: 0.4, d: 0.9 },
  { t: 'شعر', x: '40%', y: '2%', s: '1.3rem', r: -4, o: 0.32, d: 1.9 },
]

/** ضباب كلمات خافت طاير حوالين صورة المستر — طبقة خلفية (ورا الصورة) */
export function CalligraphyMist({ className }: { className?: string }) {
  return (
    <div className={'pointer-events-none absolute ' + (className || '-inset-[14%]')} aria-hidden="true">
      {/* سديمة زمرّدية خافتة */}
      <div className="absolute inset-[8%] rounded-[45%_55%_52%_48%/55%_45%_55%_45%] bg-emerald-500/[0.10] blur-3xl" />
      <div className="absolute inset-[20%] rounded-full bg-gold-500/[0.08] blur-3xl" />

      {MIST_WORDS.map(function (w, i) {
        return (
          <motion.span
            key={i}
            className="absolute font-amiri font-bold whitespace-nowrap"
            style={{
              left: w.x,
              top: w.y,
              fontSize: w.s,
              opacity: w.o,
              color: '#d4a843',
              textShadow: '0 0 18px rgba(212,168,67,0.4)',
              transform: 'rotate(' + w.r + 'deg)',
            }}
            animate={{ y: [0, -12, 0], rotate: [w.r, w.r + 4, w.r] }}
            transition={{ duration: 7 + (i % 4), repeat: Infinity, ease: 'easeInOut', delay: w.d }}
          >
            {w.t}
          </motion.span>
        )
      })}
    </div>
  )
}

/* ===== جسم السحابة — دوائر متداخلة (تحت بحواف ذهبية + فوق بالكريمي) =====
   الطبقة الأولى: نفس الأشكال بدهب (fill+stroke) → الباقي من الحدود
   بره الاتحاد بيظهر كإطار ذهبي نضيف حوالين السحابة كلها.
   الطبقة التانية: نفس الأشكال كريمي من غير stroke → بتغطي الجوه. */
var CLOUD_BUMPS = [
  { cx: 320, cy: 196, rx: 250, ry: 56 }, // الجسم الرئيسي
  { cx: 118, cy: 172, r: 52 },
  { cx: 205, cy: 130, r: 66 },
  { cx: 308, cy: 106, r: 76 },
  { cx: 408, cy: 122, r: 68 },
  { cx: 498, cy: 154, r: 54 },
  { cx: 56, cy: 192, r: 32 },
  { cx: 586, cy: 192, r: 32 },
]

/* الكلمات الواقفة على السحابة — نسبيّة لعرض السحابة */
var CLOUD_WORDS = [
  { t: 'نحو', x: '18%', y: '30%', s: '2rem', c: '#0f3d3e', ruqaa: true, d: 0 },
  { t: 'إعراب', x: '44%', y: '14%', s: '1.55rem', c: '#8a6a1c', ruqaa: false, d: 0.8 },
  { t: 'بلاغة', x: '67%', y: '34%', s: '1.8rem', c: '#0f3d3e', ruqaa: false, d: 1.5 },
  { t: 'إملاء', x: '25%', y: '58%', s: '1.4rem', c: '#8a6a1c', ruqaa: false, d: 2.1 },
  { t: 'قراءة', x: '50%', y: '54%', s: '1.65rem', c: '#0f3d3e', ruqaa: false, d: 0.4 },
  { t: 'أدب', x: '79%', y: '60%', s: '1.3rem', c: '#8a6a1c', ruqaa: false, d: 1.1 },
]

/**
 * السحابة المخطوطة — بتتحط **قدّام** صورة المستر عند رجلها
 * (z أعلى من الصورة) عشان القصاصة تبقى واقفة جوا سحابة حقيقية.
 * الحجم: العرض بيتحدد من className (استخدم w-[115%] تقريبًا)
 * والموضع: bottom يساوي رجل الصورة.
 */
export default function ManuscriptCloud({ className }: { className?: string }) {
  return (
    <div
      className={'pointer-events-none select-none ' + (className || 'absolute bottom-[-4%] left-1/2 z-20 w-[116%] -translate-x-1/2')}
      aria-hidden="true"
    >
      {/* الطفو البطيء — السحابة والصورة بيطفوا مع بعض (جوه نفس animate-float-slow) */}
      <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} className="relative">
        <svg
          viewBox="0 0 640 260"
          className="block h-auto w-full drop-shadow-[0_16px_32px_rgba(0,0,0,0.45)]"
          role="presentation"
          focusable="false"
        >
          <defs>
            <linearGradient id="sabryCloudFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbf3dc" />
              <stop offset="55%" stopColor="#f1e3bc" />
              <stop offset="100%" stopColor="#e2cf9d" />
            </linearGradient>
            <filter id="sabryCloudGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
          </defs>

          {/* توهج دهبي تحت السحابة */}
          <ellipse cx="320" cy="222" rx="280" ry="34" fill="#c49a38" opacity="0.45" filter="url(#sabryCloudGlow)" />

          {/* الحدود الذهبية */}
          <g fill="#b8902e" stroke="#b8902e" strokeWidth="6" strokeLinejoin="round">
            {CLOUD_BUMPS.map(function (b, i) {
              return 'rx' in b ? (
                <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} />
              ) : (
                <circle key={i} cx={b.cx} cy={b.cy} r={b.r} />
              )
            })}
          </g>

          {/* جسم السحابة الكريمي */}
          <g fill="url(#sabryCloudFill)">
            {CLOUD_BUMPS.map(function (b, i) {
              return 'rx' in b ? (
                <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} />
              ) : (
                <circle key={i} cx={b.cx} cy={b.cy} r={b.r} />
              )
            })}
          </g>

          {/* خيط زخرفة منقّط جوه السحابة */}
          <path
            d="M 96 214 Q 320 236 544 214"
            stroke="#b8902e"
            strokeWidth="2.5"
            fill="none"
            opacity="0.55"
            strokeDasharray="1 7"
            strokeLinecap="round"
          />
        </svg>

        {/* الكلمات العربية الواقفة على السحابة */}
        <div className="absolute inset-0">
          {CLOUD_WORDS.map(function (w, i) {
            return (
              <motion.span
                key={i}
                className={'absolute font-bold whitespace-nowrap ' + (w.ruqaa ? 'font-ruqaa' : 'font-amiri')}
                style={{ left: w.x, top: w.y, fontSize: w.s, color: w.c }}
                animate={{ y: [0, -4, 0], opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: w.d }}
              >
                {w.t}
              </motion.span>
            )
          })}
          {/* زخارف صغيرة */}
          <span className="absolute left-[5%] top-[48%] text-[1.2rem] text-gold-600">۞</span>
          <span className="absolute left-[89%] top-[26%] text-[1.1rem] text-gold-600">﴿﴾</span>
        </div>
      </motion.div>
    </div>
  )
}
