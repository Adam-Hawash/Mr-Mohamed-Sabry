'use client'

import { useAppStore } from '@/stores/app-store'
import { MessageCircle } from 'lucide-react'

/* (ز35) زر الواتساب العائم — الرقم من إعدادات الأدمن:
   1) whatsapp_number  (رقم بدون + — حقل «التواصل والفوتر» في لوحة المحتوى)
   2) لو فاضي بناخد لينك قناة الواتساب social_whatsapp_channel (لو شكل wa.me أو رقم)
   لو مفيش الاتنين الزرار يختفي خالص — ممنوع رقم غلط */
export function WhatsAppButton() {
  var { siteConfig } = useAppStore()
  var cfg = siteConfig

  var raw = String(cfg.whatsapp_number || '').trim()
  var channel = String(cfg.social_whatsapp_channel || '').trim()

  var href = ''
  if (raw) {
    var digits = raw.replace(/[^0-9]/g, '')
    if (digits) href = 'https://wa.me/' + digits
  } else if (channel) {
    if (/^https?:\/\//i.test(channel)) {
      href = channel
    } else {
      var chDigits = channel.replace(/[^0-9]/g, '')
      if (chDigits) href = 'https://wa.me/' + chDigits
    }
  }

  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="تواصل معنا واتساب"
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
      aria-label="تواصل عبر واتساب"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  )
}
