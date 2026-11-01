import type { Metadata } from 'next'
import { GrammarRules } from '@/components/landing/GrammarRules'

export var metadata: Metadata = {
  title: 'قواعد النحو | منصة الأوائل',
  description:
    'كل قواعد النحو العربي في صفحة واحدة: الجملة وأنواعها، المرفوعات والمنصوبات والمجرورات، الفعل وأنواعه، الإملاء، والبلاغة — كل قاعدة بأمثلة معربة — من منصة الأوائل للغة العربية.',
}

export default function GrammarRulesPage() {
  return <GrammarRules />
}
