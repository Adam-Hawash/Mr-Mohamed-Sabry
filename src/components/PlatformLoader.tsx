/* ============================================================
   PlatformLoader — لودر «مستر محمد صبري» (ص2)
   ============================================================
   نفس هيئة المنصات الكبيرة (زيكولا / ماث جينيس / مستر شريف):
   • نواة «م» ذهبية + مدارين بحروف عربية بيلفوا في اتجاهين
   • اسم المنصة بلمعة ذهبية متحركة
   • 3 أنماط: full (شاشة كاملة) / inline (جوه سيكشن) / compact (صغير)
   • الديزاين بتاع صبري زي ما هو: ذهبي برونزي #A16207 → #E9C767
     وقلب حجري داكن #292524 زي شعار المنصة بالظبط
   ============================================================ */

import React from "react";

type PlatformLoaderProps = {
  variant?: "full" | "inline" | "compact";
  /** نص اختاري تحت اللودر — مثال: «جاري التحميل...» */
  label?: string;
  className?: string;
};

/* المدار الواحد: حلقة متقطعة + حروف بتفضل واقفة صح والحلقة بتلف */
function Orbit({ size }: { size: number }) {
  return (
    <div
      className="pl-orbit relative"
      style={{ ["--pl-size" as string]: size + "px" } as React.CSSProperties}
      aria-hidden="true"
    >
      <span className="pl-glow" />
      <div className="pl-ring pl-r1">
        <span className="pl-sym s1"><i>أ</i></span>
        <span className="pl-sym s2"><i>ب</i></span>
        <span className="pl-sym s3"><i>ت</i></span>
      </div>
      <div className="pl-ring pl-r2">
        <span className="pl-sym t1"><i>ث</i></span>
        <span className="pl-sym t2"><i>ج</i></span>
        <span className="pl-sym t3"><i>ح</i></span>
      </div>
      <span className="pl-core">م</span>
    </div>
  );
}

function Wordmark() {
  return (
    <div className="text-center">
      <h1 className="pl-wordmark text-3xl sm:text-4xl font-black tracking-wide">
        مستر محمد صبري
      </h1>
    </div>
  );
}

function Dots() {
  return (
    <div className="pl-dots flex items-center justify-center gap-1.5" aria-hidden="true">
      <span /><span /><span />
    </div>
  );
}

export function PlatformLoader({ variant = "inline", label, className }: PlatformLoaderProps) {
  const style = <PlatformLoaderStyle />;

  /* ===== شاشة كاملة — إقلاع المنصة ===== */
  if (variant === "full") {
    return (
      <>
        {style}
        <div
          className={
            "fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center gap-8 overflow-hidden " +
            (className || "")
          }
          role="status"
          aria-live="polite"
        >
          {/* حروف عربية عايمة في الخلفية */}
          <div className="pl-floaters" aria-hidden="true">
            <span className="f1">ن</span><span className="f2">و</span><span className="f3">ق</span>
            <span className="f4">ف</span><span className="f5">ص</span><span className="f6">ع</span>
          </div>
          <Orbit size={190} />
          <Wordmark />
          <div className="flex flex-col items-center gap-3">
            <Dots />
            <p className="text-muted-foreground text-sm">{label || "جاري التحميل..."}</p>
          </div>
        </div>
      </>
    );
  }

  /* ===== سطر صغير — جوه الكروت والحالات الجانبية ===== */
  if (variant === "compact") {
    return (
      <>
        {style}
        <div
          className={"flex items-center justify-center gap-3 py-6 " + (className || "")}
          role="status"
          aria-live="polite"
        >
          <Orbit size={48} />
          {label ? <p className="text-sm font-medium text-muted-foreground">{label}</p> : null}
        </div>
      </>
    );
  }

  /* ===== inline — بلوك جوه السيكشن ===== */
  return (
    <>
      {style}
      <div
        className={"flex flex-col items-center justify-center gap-5 py-14 " + (className || "")}
        role="status"
        aria-live="polite"
      >
        <Orbit size={130} />
        {label ? <p className="text-muted-foreground text-sm font-medium">{label}</p> : null}
        <Dots />
      </div>
    </>
  );
}

/* ===== الستايل — ذاتي بالكامل (مفيش تعديل على globals.css) ===== */
function PlatformLoaderStyle() {
  return (
    <style>{`
      .pl-orbit { width: var(--pl-size); height: var(--pl-size); }
      .pl-glow {
        position: absolute; inset: -18%; border-radius: 9999px;
        background: radial-gradient(circle, rgba(212,168,67,.22) 0%, rgba(212,168,67,0) 65%);
        animation: pl-glow-pulse 2.4s ease-in-out infinite;
      }
      .pl-ring {
        position: absolute; border-radius: 9999px;
        border: 1.5px dashed rgba(161,98,7,.42);
        animation: pl-spin 9s linear infinite;
      }
      .pl-r1 { inset: 0; }
      .pl-r2 { inset: 17%; border-color: rgba(196,154,56,.30); animation: pl-spin-rev 6.5s linear infinite; }
      /* الحروف بتقف على الحلقة، والدوران العكسي بيخليها واقفة صح دايمًا */
      .pl-sym {
        position: absolute; width: 1.9em; height: 1.9em;
        display: flex; align-items: center; justify-content: center;
        font-size: calc(var(--pl-size) * 0.115); color: #A16207;
        animation: inherit; animation-direction: reverse;
      }
      .pl-sym i { font-style: normal; font-weight: 700; line-height: 1; }
      .pl-r1 .pl-sym { color: #A16207; }
      .pl-r2 .pl-sym { color: #C49A38; font-size: calc(var(--pl-size) * 0.10); }
      .dark .pl-r1 .pl-sym { color: #D4A843; }
      .dark .pl-r2 .pl-sym { color: #E9C767; }
      .pl-sym.s1 { top: -.95em; left: calc(50% - .95em); }
      .pl-sym.s2 { top: calc(50% - .95em); right: -.95em; }
      .pl-sym.s3 { bottom: -.95em; left: calc(50% - .95em); }
      .pl-sym.t1 { top: calc(50% - .95em); left: -.95em; }
      .pl-sym.t2 { bottom: -.8em; right: -.8em; }
      .pl-sym.t3 { top: -.8em; right: -.8em; }
      /* النواة: قرص حجري داكن بحرف «م» ذهبي — نفس قلب شعار المنصة */
      .pl-core {
        position: absolute; top: 50%; left: 50%;
        width: 40%; height: 40%;
        transform: translate(-50%, -50%);
        display: flex; align-items: center; justify-content: center;
        font-size: calc(var(--pl-size) * 0.17); font-weight: 800; color: #E9C767;
        border-radius: 9999px;
        background: linear-gradient(145deg, #44403C 0%, #292524 55%, #1C1917 100%);
        border: 1.5px solid #A16207;
        box-shadow: 0 6px 22px rgba(161,98,7,.35), inset 0 1px 2px rgba(233,199,103,.25);
        text-shadow: 0 1px 3px rgba(0,0,0,.35);
        animation: pl-core-beat 2.4s ease-in-out infinite;
      }
      .pl-wordmark {
        background: linear-gradient(100deg, #96741F 18%, #D4A843 38%, #FFF8E7 50%, #D4A843 62%, #96741F 82%);
        background-size: 220% 100%;
        -webkit-background-clip: text; background-clip: text; color: transparent;
        animation: pl-shine 2.8s linear infinite;
      }
      .dark .pl-wordmark {
        background: linear-gradient(100deg, #D4A843 18%, #E9C767 38%, #fff8e7 50%, #E9C767 62%, #D4A843 82%);
        background-size: 220% 100%;
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      .pl-dots span {
        width: .5rem; height: .5rem; border-radius: 9999px; background: #D4A843;
        animation: pl-bob 1.1s ease-in-out infinite;
      }
      .pl-dots span:nth-child(2) { animation-delay: .16s; }
      .pl-dots span:nth-child(3) { animation-delay: .32s; }
      .pl-floaters { position: absolute; inset: 0; pointer-events: none; }
      .pl-floaters span {
        position: absolute; font-weight: 800; color: rgba(161,98,7,.13);
        animation: pl-float 7s ease-in-out infinite;
      }
      .dark .pl-floaters span { color: rgba(212,168,67,.13); }
      .pl-floaters .f1 { top: 12%; left: 10%; font-size: 3.4rem; }
      .pl-floaters .f2 { top: 18%; right: 12%; font-size: 4rem; animation-delay: .8s; }
      .pl-floaters .f3 { bottom: 22%; left: 14%; font-size: 3rem; animation-delay: 1.6s; }
      .pl-floaters .f4 { bottom: 14%; right: 10%; font-size: 3.8rem; animation-delay: 2.4s; }
      .pl-floaters .f5 { top: 44%; left: 4%;  font-size: 2.6rem; animation-delay: 3.2s; }
      .pl-floaters .f6 { top: 40%; right: 5%; font-size: 2.8rem; animation-delay: 4s; }
      @keyframes pl-spin { to { transform: rotate(360deg); } }
      @keyframes pl-spin-rev { to { transform: rotate(-360deg); } }
      @keyframes pl-glow-pulse { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
      @keyframes pl-core-beat { 0%, 100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.06); } }
      @keyframes pl-shine { from { background-position: 130% 0; } to { background-position: -130% 0; } }
      @keyframes pl-bob { 0%, 100% { transform: translateY(0); opacity: .4; } 50% { transform: translateY(-6px); opacity: 1; } }
      @keyframes pl-float { 0%, 100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-16px) rotate(5deg); } }
      @media (prefers-reduced-motion: reduce) {
        .pl-ring, .pl-sym, .pl-glow, .pl-core, .pl-wordmark, .pl-dots span, .pl-floaters span { animation: none !important; }
      }
    `}</style>
  );
}
