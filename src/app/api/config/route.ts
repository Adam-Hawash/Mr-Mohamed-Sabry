// @ts-nocheck
import { NextResponse } from 'next/server'
import { db, safeWrite } from '@/lib/db'

var DEFAULTS = {
  // === Navbar ===
  navbar_brand: 'Mr. Mohamed Sabry',
  navbar_subtitle: 'مستر محمد صبري',

  // === Hero Section ===
  hero_badge: 'منصّة اللغة العربية | Arabic Language Platform',
  hero_title_line1: 'Mr. Mohamed Sabry',
  hero_title_line2: 'مستر محمد صبري',
  hero_subtitle: 'نُحبّ العربية ونقرّبها لابنك! نحو وبلاغة وإعراب وإملاء بأسلوب مبسّط — دروس مشروحة، واجبات أسبوعية، امتحانات منتظمة، ومتابعة مستمرة لتقدّمه الأكاديمي.',
  hero_stat1_value: '8+',
  hero_stat1_label: 'Grade Levels',
  hero_stat2_value: '100+',
  hero_stat2_label: 'Video Lessons',
  hero_stat3_value: '24/7',
  hero_stat3_label: 'Progress Tracking',
  hero_developer_url: 'https://prime-developer-portfolio-11.vercel.app',
  hero_developer_label: 'Hero Developer',
  footer_made_by_label: 'Developed by Adam Hawash',
  prime_developer_url: 'https://prime-developer-portfolio-11.vercel.app',

  // === Schedule Page ===
  schedule_title: 'مواعيد السنتر',
  schedule_subtitle: 'جدول مواعيد الحصص الأسبوعية لكل الصفوف الدراسية — اختر اليوم المناسب لك وتابع موعد حصتك',
  schedule_badge: 'جدول الحصص الأسبوعي',
  schedule_footer_note: 'جميع المواعيد بتوقيت القاهرة. لو عندك أي استفسار عن موعد حصتك تواصل معنا عبر واتساب.',
  schedule_brand: 'Mr. Mohamed Sabry — اللغة العربية',
  schedule_data: '',

  // === Instructor ===
  instructor_name: 'مستر محمد صبري',
  instructor_title: 'معلم اللغة العربية المتخصص | Arabic Language Specialist',
  instructor_photo: '/images/teacher.jpg',

  // === Features Section ===
  features_title: 'لماذا تختارنا؟ | Why Choose Us?',
  features_subtitle: 'نقدّم تجربة تعليمية فريدة تجمع بين الشرح المبسّط والتطبيق العملي في النحو والبلاغة والأدب',
  feature1_title: 'شرح مبسط | Simplified Explanations',
  feature1_desc: 'شرح واضح ومبسط لكل درس اللغة العربية بطريقة تساعد الطالب على الفهم السريع والاستيعاب العميق لقواعد النحو والإعراب الأساسية.',
  feature2_title: 'فهم عميق | Deep Understanding',
  feature2_desc: 'نركّز على فهم اللغة من الجذور وليس الحفظ فقط — القراءة والاستيعاب والتحليل الأدبي يبني قدرة حقيقية على التعبير والإعراب الصحيح.',
  feature3_title: 'تدريبات وتطبيق | Step-by-Step Practice',
  feature3_desc: 'تدريبات متدرجة على الإعراب والتعبير مع ملخصات بصرية تسهّل الفهم والتذكّر.',
  feature4_title: 'تحضير وامتحانات | Reviews & Exams',
  feature4_desc: 'تحضير شامل ومراجعات دورية واختبارات أسبوعية لضمان التفوّق والاستعداد الكامل للامتحانات النهائية.',

  // === Grades Section ===
  grades_title: 'السنوات الدراسية',
  grades_subtitle: 'اختر صفك الدراسي للوصول إلى المحتوى التعليمي المخصص لك',

  // === Tips Section ===
  tips_badge: 'نصائح للتفوّق | Tips for Excellence',
  tips_title: 'نصائح المستر | Tips',
  tips_subtitle: 'نصائح ذهبية من مستر محمد صبري للتفوّق في اللغة العربية — Golden advice from Mr. Mohamed Sabry',
  tips_card1_title: 'اقرأ كل يوم قليلا',
  tips_card1_title_en: 'Read Daily',
  tips_card1_desc: 'خصص 20-30 دقيقة كل يوم للقراءة — قصص ومقالات وشعر. الاستمرارية هي مفتاح التفوّق في اللغة. Dedicate 20-30 minutes daily for reading.',
  tips_card2_title: 'افهم القاعدة لا تحفظها',
  tips_card2_title_en: "Understand, Don\u2019t Memorize",
  tips_card2_desc: 'حاول فهم لماذا وليس كيف فقط. فهم القاعدة النحوية يبقيها معك لفترة أطول ويصحح إعرابك في كل جملة. Understand the rule, not just memorize it.',
  tips_card3_title: 'تدرب على التعبير كل يوم',
  tips_card3_title_en: 'Practice Writing Daily',
  tips_card3_desc: 'اكتب فقرة قصيرة كل يوم — تعبير أو وصف أو خاطرة. الكتابة اليومية تصقل لغتك وتثري مفرداتك. Write daily to strengthen your language.',
  tips_card4_title: 'لا تتردد في السؤال',
  tips_card4_title_en: 'Never Hesitate to Ask',
  tips_card4_desc: 'إذا لم تفهم شيئاً اسأل فوراً. السؤال الجيد هو بداية الفهم العميق. Ask immediately when something is unclear.',

  // === Guide Section ===
  guide_badge: 'دليلك التعليمي | Learning Guide',
  guide_title: 'كيف تستخدم المنصة؟ | How to Use the Platform',
  guide_subtitle: 'ست خطوات بسيطة لتبدأ رحلتك التعليمية في Mr. Mohamed Sabry — Six simple steps to begin your learning journey',
  guide_card1_title: 'تسجيل حسابك',
  guide_card1_title_en: 'Register',
  guide_card1_desc: 'أنشئ حسابك في المنصة بسرعة وسهولة. اختر صفّك الدراسي وابدأ رحلتك التعليمية فوراً. Create your account quickly and start learning.',
  guide_card2_title: 'مشاهدة الدروس',
  guide_card2_title_en: 'Watch Lessons',
  guide_card2_desc: 'تابع شروحات مبسّطة ومتسلسلة لكل درس من دروس اللغة العربية بأسلوب تفاعلي يجعل الفهم أسهل. Watch simplified, step-by-step video lessons.',
  guide_card3_title: 'حل الواجبات',
  guide_card3_title_en: 'Homework',
  guide_card3_desc: 'أكمل واجباتك الأسبوعية وحلّ التمارين لتثبيت المعلومات واختبار فهمك. Complete weekly homework to reinforce your learning.',
  guide_card4_title: 'أداء الامتحانات',
  guide_card4_title_en: 'Take Exams',
  guide_card4_desc: 'شارك في الامتحانات الدورية لمتابعة مستوايك والاستعداد للامتحانات النهائية. Take periodic exams to track your progress.',
  guide_card5_title: 'بطاقات تعليمية',
  guide_card5_title_en: 'Flashcards',
  guide_card5_desc: 'استخدم البطاقات التعليمية لمراجعة القواعد النحوية والمصطلحات البلاغية بشكل سريع. Review grammar and terms with flashcards.',
  guide_card6_title: 'تحديات ومسابقات',
  guide_card6_title_en: 'Challenges',
  guide_card6_desc: 'تنافس مع زملائك في تحديات لغوية ممتعة واربح مراكز متقدمة. Compete in fun language challenges with your classmates.',

  // === Gallery ===
  gallery_title: 'صور طلابي الأعزاء | My Beloved Students',
  gallery_subtitle: 'لحظات مميزة من رحلتنا التعليمية — Moments from our educational journey',

  // === Social Links ===
  social_facebook: '',
  social_whatsapp_channel: '',
  social_instagram: '',
  social_youtube: '',

  // === WhatsApp Button === (ص2: فاضي افتراضيًا — المستر يضبط رقمه من لوحة التحكم)
  whatsapp_number: '',

  // === Footer ===
  footer_brand: 'Mr. Mohamed Sabry',
  footer_copyright: 'جميع الحقوق محفوظة لـ أدهم حواش',

  // === Favicon ===
  favicon_url: '',

  // === Tips Section Background ===
  tips_bg_image: '',

  // === Tips Section Center Image ===
  tips_section_image: '',

  // === API Keys ===
  resend_api_key: '',

  // === Payment Numbers (shown to students) ===
  payment_vodafone_cash: '',
  payment_instapay: '',
  payment_fawry: '',

  // === (G-2) قسم «إزاي تستخدم المنصة» — فيديو اختياري من الأدمن ===
  // فاضي = السكشن مش بيظهر خالص في الصفحة الرئيسية (إخفاء شرطي صارم)
  // kind: 'link' (يوتيوب/درايف/vimeo → iframe embed) أو 'file' (ملف مرفوع → <video>)
  howto_video_url: '',
  howto_video_kind: 'link',

  // === (2026-ص2) مفتاح قفل التسلسل الموحد — دروس/واجبات/امتحانات ===
  // '1' (أو غايب) = التسلسل شغّال: كل حاجة بتفتح بعد اللي قبلها لكل الطلبة
  // '0' = التسلسل مطفي للكل: كله مفتوح بنفس الشكل لكل الطلبة
  video_sequence_lock: '1',
}

export async function GET(request) {
  try {
    var configs = await db.siteConfig.findMany()
    var map = Object.assign({}, DEFAULTS)
    for (var i = 0; i < configs.length; i++) {
      var c = configs[i]
      map[c.key] = c.value
    }
    /* (و80) إصلاح جذري لعلة «عدّل حاجة في الأدمن وبعد الـ reload بترجع زي ما كانت»:
     * القراءة هنا بقت **زي ما هي من قاعدة البيانات من غير أي تعديل أو تصحيح مفروض** —
     * كل التصحيحات القديمة (اسم المنصة/اسم المستر/اسم المطور) اتعملت مرة واحدة في
     * ترحيلات ensure-schema على قاعدة البيانات نفسها، فمش محتاجين نكررها هنا —
     * التكرار على القراءة كان بيلغي أي تعديل يعمله الأدمن فورًا فيظهرله إن
     * «التغييرات بترجع» رغم إنها متخزنة فعلًا. أي تعديل من الأدمن دلوقتي بيتخزن
     * وبيترجع زي ما هو. */
    /* (توفير الباك إند — ص8) الكونفج بيتكاش على الـ CDN دقيقة (s-maxage=60
       + stale-while-revalidate) بدل ما كل زيارة صفحة توقّع فانكشن.
       الأدمن بيجيب الكونفج بـ ?fresh= اللي بتفلت الكاش دايمًا —
       فتعديلاته بتوصل جهازه لحظيًا زي ما هي */
    var res = NextResponse.json(map)
    var isFresh = false
    try { isFresh = new URL(request.url).searchParams.has('fresh') } catch (eU) {}
    res.headers.set('Cache-Control', isFresh ? 'private, no-store' : 'public, s-maxage=60, stale-while-revalidate=300')
    return res
  } catch (error) {
    console.error('Config fetch error:', error)
    // CRITICAL FIX: Return flat DEFAULTS so frontend never crashes
    /* (توفير الباك إند — ص8) الأخطاء عمري ما تتكاش */
    var errRes = NextResponse.json(Object.assign({}, DEFAULTS))
    errRes.headers.set('Cache-Control', 'private, no-store')
    return errRes
  }
}

export async function PUT(request) {
  try {
    var body = await request.json()
    var keys = Object.keys(body)

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      var value = body[key]
      // Skip non-config keys that might come from error responses
      if (key === 'error' || key === 'defaults') continue
      await safeWrite(function(k, v) {
        return function() {
          return db.siteConfig.upsert({
            where: { key: k },
            update: { value: v, updatedAt: new Date() },
            create: { key: k, value: v },
          })
        }
      }(key, value))
    }

    return NextResponse.json({ message: 'Config updated' })
  } catch (error) {
    console.error('Config update error:', error)
    return NextResponse.json({ error: 'Failed to update config', detail: error.message, code: error.code }, { status: 500 })
  }
}
