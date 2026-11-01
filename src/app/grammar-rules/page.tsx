import type { Metadata } from 'next'
import { GrammarRules } from '@/components/landing/GrammarRules'

export var metadata: Metadata = {
  title: 'قواعد النحو | Mr. Mohamed Sabry',
  description:
    'كل قواعد النحو العربي في صفحة واحدة: الجملة وأنواعها، المرفوعات والمنصوبات والمجرورات، الفعل وأنواعه، الإملاء، والبلاغة — كل قاعدة بأمثلة معربة — من منصة مستر محمد صبري للغة العربية.',
}

export default function GrammarRulesPage() {
  return <GrammarRules />
}
