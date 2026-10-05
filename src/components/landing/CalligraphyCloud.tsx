'use client'

// ============================================================
// FILE: src/components/landing/CalligraphyCloud.tsx
// (ص120) «سحابة الحروف» — بديل سحابة منصة مستر أحمد شعبان بس
// بهوية منصة اللغة العربية (ليل + زمرّدي + تذهيب مخطوطات).
//
// بتظهر **بس** لما صورة المستر تكون بوضع «صورة نضيفة بدون إطار» —
// سديمة ضبابية خضرا + كلمات عربية خافتة ذهبية (نحو إعراب بلاغة
// إملاء قراءة أدب شعر) طايرة حوالين الصورة بحركة بطيئة — نفس روح
// بانر الهيرو بتاع المنصة بحروف وكلمات عربية خافتة.
// ============================================================

import { motion } from 'framer-motion'

var WORDS = [
  { t: 'نحو', x: '6%', y: '18%', s: '2.1rem', r: -14, o: 0.5, d: 0 },
  { t: 'إعراب', x: '68%', y: '6%', s: '1.7rem', r: 10, o: 0.45, d: 0.6 },
  { t: 'بلاغة', x: '74%', y: '38%', s: '2.3rem', r: -6, o: 0.55, d: 1.1 },
  { t: 'إملاء', x: '2%', y: '52%', s: '1.6rem', r: 12, o: 0.4, d: 1.6 },
  { t: 'قراءة', x: '10%', y: '78%', s: '1.9rem', r: -9, o: 0.45, d: 0.9 },
  { t: 'أدب', x: '78%', y: '72%', s: '2rem', r: 8, o: 0.5, d: 0.3 },
  { t: 'شعر', x: '44%', y: '2%', s: '1.5rem', r: -4, o: 0.38, d: 1.9 },
  { t: 'نحو', x: '88%', y: '55%', s: '1.3rem', r: 16, o: 0.32, d: 1.4 },
  { t: 'إعراب', x: '26%', y: '4%', s: '1.25rem', r: -12, o: 0.3, d: 2.2 },
]

export default function CalligraphyCloud({ className }: { className?: string }) {
  return (
    <div className={'pointer-events-none absolute inset-0 ' + (className || '')} aria-hidden="true">
      {/* ===== السديمة الخضرا — جسم السحابة ===== */}
      <div className="absolute inset-[6%] rounded-[45%_55%_52%_48%/55%_45%_55%_45%] bg-emerald-500/[0.13] blur-3xl" />
      <div className="absolute inset-[14%] rounded-[55%_45%_48%_52%/48%_52%_45%_55%] bg-emerald-400/[0.10] blur-3xl" />
      {/* توهج التذهيب من جوه السحابة */}
      <div className="absolute inset-[22%] rounded-full bg-gold-500/[0.10] blur-3xl" />

      {/* ===== الكلمات العربية الطايرة ===== */}
      {WORDS.map(function (w, i) {
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
              textShadow: '0 0 18px rgba(212,168,67,0.45)',
              transform: 'rotate(' + w.r + 'deg)',
            }}
            animate={{ y: [0, -12, 0], rotate: [w.r, w.r + 4, w.r] }}
            transition={{ duration: 7 + (i % 4), repeat: Infinity, ease: 'easeInOut', delay: w.d }}
          >
            {w.t}
          </motion.span>
        )
      })}

      {/* ===== فصوص مخطوطة صغيرة — نقاط التذهيب ===== */}
      <motion.span
        className="absolute left-[16%] top-[36%] text-gold-400/60"
        animate={{ y: [0, -8, 0], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        ﴿﴾
      </motion.span>
      <motion.span
        className="absolute right-[8%] top-[20%] text-gold-400/50"
        animate={{ y: [0, -10, 0], opacity: [0.3, 0.65, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
      >
        ۞
      </motion.span>
      <motion.span
        className="absolute right-[20%] bottom-[8%] text-emerald-400/50"
        animate={{ y: [0, -7, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
      >
        ﷽
      </motion.span>
    </div>
  )
}
