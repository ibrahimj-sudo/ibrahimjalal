import Anthropic from '@anthropic-ai/sdk'
import type { OrgData, Answers, ReportSectionData } from '../types'

const API_KEY_STORAGE = 'sana_api_key'

function getClient(): Anthropic {
  const apiKey = localStorage.getItem(API_KEY_STORAGE)
  if (!apiKey) {
    throw new Error('لم يتم إدخال مفتاح API. يُرجى الذهاب للإعدادات.')
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
}

export function hasApiKey(): boolean {
  return !!localStorage.getItem(API_KEY_STORAGE)
}

export async function testConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = getClient()
    await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'قل: جاهز' }],
    })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'خطأ غير معروف' }
  }
}

type SectionsResult = Record<string, string>

const SYSTEM_PROMPT = `أنت مستشار ابتكار اجتماعي محترف في مركز سنا للابتكار الاجتماعي بالمملكة العربية السعودية.

قواعد الكتابة:
1. اكتب بالعربية الفصحى الاحترافية — لغة استشارية رصينة وواضحة
2. استخدم المنهجية الثلاثية: رصد (ما يحدث) ← تحليل (ما يعنيه) ← توصية (الحل)
3. لا تسرد الإجابات حرفياً — حلّلها واستخلص منها
4. كل توصية يجب أن تكون محددة وقابلة للتطبيق
5. اربط التحليل برؤية 2030 والقطاع غير الربحي السعودي
6. أسلوب محفّز وبنّاء — يُشخّص الواقع بصدق ويفتح آفاق التحسين
7. تجنب العموميات — كل جملة يجب أن تُضيف قيمة`

function buildOrgInfo(orgData: OrgData): string {
  const attendeesStr = orgData.attendees
    ?.filter((a) => a.name.trim())
    .map((a) => `${a.name} — ${a.role}`)
    .join('، ') || 'لم يُسجَّل'

  return `بيانات الجهة:
الاسم: ${orgData.name}
مجال العمل: ${orgData.field}
القضية الاجتماعية: ${orgData.issue}
الفئة المستهدفة: ${orgData.targetGroup || 'غير محدد'}
رقم الترخيص: ${orgData.licenseNumber || 'غير مدرج'}
المقابِل (المستشار): ${orgData.consultantName}
تاريخ المقابلة: ${orgData.interviewDate || '—'}
الحاضرون: ${attendeesStr}`
}

function buildAnswersText(answers: Answers): string {
  return Object.entries(answers)
    .filter(([, v]) => v.answer?.trim())
    .map(([k, v]) => `س${k}: ${v.answer}\nملاحظة المستشار: ${v.note || '—'}`)
    .join('\n\n')
}

interface CallDef {
  key: string
  step: string
  percent: number
  maxTokens: number
  prompt: string
}

export async function generateFullReport(
  orgData: OrgData,
  answers: Answers,
  onProgress?: (step: string, percent: number) => void
): Promise<Record<string, ReportSectionData>> {
  const client = getClient()
  const orgInfo = buildOrgInfo(orgData)
  const answersText = buildAnswersText(answers)

  const calls: CallDef[] = [
    {
      key: 'executiveSummary',
      step: 'كتابة الملخص التنفيذي...',
      percent: 14,
      maxTokens: 800,
      prompt: `${orgInfo}\n\n${answersText}\n\nاكتب الملخص التنفيذي للتقرير. يجب أن يُجيب على:\n1. أين تقف الجهة ابتكارياً الآن؟ (فقرة)\n2. أبرز 4-5 نتائج جوهرية (نقاط)\n3. أبرز 4-5 توصيات عملية (نقاط)\n4. الخلاصة المتوقعة عند التطبيق (فقرة)\nاكتب بأسلوب استشاري موجز ومؤثر.`,
    },
    {
      key: 'section1',
      step: 'كتابة مقدمة المستند...',
      percent: 28,
      maxTokens: 600,
      prompt: `${orgInfo}\n\nاكتب القسم الأول: مقدمة المستند.\nيتضمن:\n1. هدف المستند\n2. منهجية إعداد المستند\n3. أهمية المستند\nاربط بطبيعة الجهة ومجال عملها.`,
    },
    {
      key: 'section2',
      step: 'تحليل السياق التنظيمي...',
      percent: 42,
      maxTokens: 900,
      prompt: `${orgInfo}\n\n${answersText}\n\nاكتب القسم الثاني: تحليل السياق التنظيمي.\nيتضمن:\n❖ جاهزية وثقافة الابتكار الحالية\n❖ العوامل الخارجية المؤثّرة (رؤية 2030)\n❖ لوحة القياس المقترحة (5 مؤشرات)\n❖ الفرص التنظيمية\n❖ التحديات الداخلية\nاختم بنظرة شاملة تُلخّص الجاهزية.`,
    },
    {
      key: 'section3',
      step: 'كتابة التحليل الاستشاري المفصّل...',
      percent: 56,
      maxTokens: 1500,
      prompt: `${orgInfo}\n\n${answersText}\n\nاكتب القسم الثالث: التحليل الاستشاري المفصّل.\nهذا هو القلب النابض للتقرير.\n\nلكل محور اكتب ثلاث طبقات:\n[رصد]: ما يحدث فعلاً\n[تحليل]: ما يعنيه استشارياً\n[توصية]: الحل المحدد\n\nالمحاور:\n1. الابتكار كعملية منظّمة\n2. الابتكار كبيئة تُشجّع التجريب\n3. الابتكار كتشاركية مع الشركاء\n4. الابتكار مرتبط بالسياق الوطني\n5. الابتكار كمنظومة قياس وتبنّي\n\nاختم بنظرة شاملة.`,
    },
    {
      key: 'section4',
      step: 'تحليل الفجوات...',
      percent: 70,
      maxTokens: 900,
      prompt: `${orgInfo}\n\n${answersText}\n\nاكتب القسم الرابع: تحليل الفجوات.\nلكل فجوة:\nالوضع الحالي → الفجوة → التوصية\n\nاكتب 6-8 فجوات تشمل:\n- مسار الابتكار المؤسسي\n- التمويل التجريبي\n- لوحة القياس\n- التصميم المشترك مع المستفيد\n- الشراكات\nأضف فجوات أخرى بناءً على الإجابات.`,
    },
    {
      key: 'section5',
      step: 'كتابة مقترحات التحسين...',
      percent: 84,
      maxTokens: 900,
      prompt: `${orgInfo}\n\nاكتب القسم الخامس: مقترحات التحسين وخارطة الطريق.\n\n⬡ التوصيات الاستراتيجية (3-4)\n⚙ التوصيات التشغيلية (4-5)\n◈ توصيات بناء القدرات (2-3)\n\nلكل توصية: العنوان + التفاصيل التنفيذية + الأثر المتوقع.`,
    },
    {
      key: 'section6',
      step: 'بناء مؤشرات الأثر وخارطة التحوّل...',
      percent: 96,
      maxTokens: 700,
      prompt: `${orgInfo}\n\nاكتب القسم السادس: المخرجات والأثر المتوقع.\n\n1. مؤشرات الأداء (KPIs) — 5 مؤشرات:\n| المؤشر | طريقة الحساب | المستهدف |\n\n2. مؤشرات الأثر النوعية — 3 محاور\n\n3. خارطة التحوّل الزمنية:\n- قصيرة المدى (0-6 أشهر): 4 إنجازات\n- متوسطة المدى (6-18 شهراً): 4 إنجازات\n- بعيدة المدى (18-36 شهراً): 4 إنجازات\n\nاختم بنظرة ختامية.`,
    },
  ]

  const sections: SectionsResult = {}

  for (const call of calls) {
    onProgress?.(call.step, call.percent)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: call.maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: call.prompt }],
    })
    const text = response.content[0]
    sections[call.key] = text.type === 'text' ? text.text : ''
  }

  onProgress?.('اكتمل التوليد ✓', 100)

  const result: Record<string, ReportSectionData> = {}
  for (const key of Object.keys(sections)) {
    result[key] = { content: sections[key], approved: false, editedAt: null }
  }
  return result
}
