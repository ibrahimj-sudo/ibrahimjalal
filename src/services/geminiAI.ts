import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import type { OrgData, Answers, ReportSectionData } from '../types'

const API_KEY_STORAGE = 'sana_gemini_key'

function getModel() {
  const apiKey = localStorage.getItem(API_KEY_STORAGE)
  if (!apiKey) {
    throw new Error('لم يتم إدخال مفتاح Gemini API. يُرجى الذهاب للإعدادات ⚙️')
  }
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
    generationConfig: { temperature: 0.7, topP: 0.9 },
  })
}

export function hasApiKey(): boolean {
  return !!localStorage.getItem(API_KEY_STORAGE)
}

export async function testGeminiConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const model = getModel()
    const result = await model.generateContent('قل: جاهز')
    const text = result.response.text()
    return text.length > 0 ? { ok: true } : { ok: false, error: 'استجابة فارغة' }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'خطأ غير معروف' }
  }
}

const SYSTEM_PROMPT = `أنت مستشار ابتكار اجتماعي محترف في مركز سنا للابتكار الاجتماعي بالمملكة العربية السعودية.

قواعد الكتابة الإلزامية:
1. اكتب بالعربية الفصحى الاحترافية — لغة استشارية رصينة وواضحة
2. استخدم المنهجية الثلاثية:
   [رصد]: ما يحدث فعلاً
   [تحليل]: ما يعنيه ذلك استشارياً
   [توصية عملية]: الحل المحدد القابل للتطبيق
3. لا تسرد الإجابات حرفياً — حلّلها واستخلص منها
4. كل توصية محددة وقابلة للتطبيق الفوري
5. اربط التحليل برؤية 2030 والقطاع غير الربحي السعودي
6. أسلوب محفّز وبنّاء — يُشخّص الواقع ويفتح آفاق التحسين
7. تجنب العموميات — كل جملة تُضيف قيمة حقيقية`

async function callGemini(prompt: string): Promise<string> {
  const model = getModel()
  const result = await model.generateContent(`${SYSTEM_PROMPT}\n\n${prompt}`)
  return result.response.text()
}

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
    .map(([k, v]) => `السؤال ${k}: ${v.answer}\nملاحظة المستشار: ${v.note || '—'}`)
    .join('\n\n')
}

interface CallDef {
  key: string
  step: string
  percent: number
  prompt: string
}

export async function generateFullReport(
  orgData: OrgData,
  answers: Answers,
  onProgress?: (step: string, percent: number) => void
): Promise<Record<string, ReportSectionData>> {
  const orgInfo = buildOrgInfo(orgData)
  const answersText = buildAnswersText(answers)

  const calls: CallDef[] = [
    {
      key: 'executiveSummary',
      step: 'كتابة الملخص التنفيذي...',
      percent: 15,
      prompt: `${orgInfo}\n\n${answersText}\n\nاكتب الملخص التنفيذي للتقرير. يجب أن يُجيب على:\n1. أين تقف الجهة ابتكارياً الآن؟ (فقرة)\n2. أبرز 5 نتائج جوهرية (نقاط)\n3. أبرز 5 توصيات عملية (نقاط)\n4. الخلاصة المتوقعة عند التطبيق (فقرة)\nاكتب بأسلوب استشاري موجز ومؤثر.`,
    },
    {
      key: 'section1',
      step: 'كتابة مقدمة المستند...',
      percent: 28,
      prompt: `${orgInfo}\n\nاكتب القسم الأول: مقدمة المستند.\nيتضمن:\n1. هدف المستند — لماذا هذا التقرير مهم لهذه الجهة تحديداً\n2. منهجية إعداد المستند — المقابلات والأدوات المستخدمة\n3. أهمية المستند — ما الذي سيُغيّره\nاربط بطبيعة الجهة ومجال عملها.`,
    },
    {
      key: 'section2',
      step: 'تحليل السياق التنظيمي...',
      percent: 42,
      prompt: `${orgInfo}\n\n${answersText}\n\nاكتب القسم الثاني: تحليل السياق التنظيمي.\nيتضمن:\n❖ جاهزية وثقافة الابتكار الحالية\n❖ العوامل الخارجية المؤثّرة (رؤية 2030، الممولون، السياسات)\n❖ لوحة القياس المقترحة (5 مؤشرات عملية)\n❖ الفرص التنظيمية المعزِّزة\n❖ التحديات الداخلية المؤثّرة\nاختم بـ"نظرة شاملة" تُلخّص الجاهزية التنظيمية.`,
    },
    {
      key: 'section3',
      step: 'التحليل الاستشاري المفصّل...',
      percent: 58,
      prompt: `${orgInfo}\n\n${answersText}\n\nاكتب القسم الثالث: التحليل الاستشاري المفصّل.\nهذا هو القلب النابض للتقرير.\nلكل محور اكتب بالمنهجية الثلاثية:\n[رصد] ما يحدث فعلاً\n[تحليل] ما يعنيه استشارياً\n[توصية عملية] الحل المحدد\n\nالمحاور:\n1. الابتكار كعملية منظّمة\n2. الابتكار كبيئة تُشجّع التجريب\n3. الابتكار كتشاركية مع الشركاء\n4. الابتكار مرتبط بالسياق الوطني\n5. الابتكار كمنظومة قياس وتبنّي\n\nاختم بـ"نظرة شاملة".`,
    },
    {
      key: 'section4',
      step: 'تحليل الفجوات الجوهرية...',
      percent: 70,
      prompt: `${orgInfo}\n\n${answersText}\n\nاكتب القسم الرابع: تحليل الفجوات.\nلكل فجوة:\nالوضع الحالي → الفجوة → التوصية\n\nاكتب 6-8 فجوات مرتّبة حسب الأولوية:\n- مسار الابتكار المؤسسي\n- التمويل التجريبي السريع\n- لوحة القياس\n- التصميم المشترك مع المستفيد\n- الشراكات التصميمية\n- الاستدامة المالية\nأضف فجوات أخرى بناءً على الإجابات.\nاختم بـ"نظرة شاملة".`,
    },
    {
      key: 'section5',
      step: 'كتابة مقترحات التحسين...',
      percent: 83,
      prompt: `${orgInfo}\n\nاكتب القسم الخامس: مقترحات التحسين وخارطة الطريق.\n\n⬡ التوصيات الاستراتيجية (3-4): الحوكمة والسياسات\n⚙ التوصيات التشغيلية (4-5): آليات العمل والتمويل\n◈ توصيات بناء القدرات (2-3): تمكين الفريق\n\nلكل توصية: العنوان + التفاصيل التنفيذية + الأثر المتوقع.`,
    },
    {
      key: 'section6',
      step: 'بناء مؤشرات الأثر...',
      percent: 94,
      prompt: `${orgInfo}\n\nاكتب القسم السادس: المخرجات والأثر المتوقع.\n\n1. مؤشرات الأداء KPIs (5 مؤشرات بجدول):\n| المؤشر | طريقة الحساب | المستهدف خلال 12 شهراً |\n\n2. مؤشرات الأثر النوعية (3 محاور): ثقافة الابتكار، الشراكات، الموقع الوطني\n\n3. خارطة التحوّل الزمنية:\n- قصيرة المدى (0-6 أشهر): 4 إنجازات\n- متوسطة المدى (6-18 شهراً): 4 إنجازات\n- بعيدة المدى (18-36 شهراً): 4 إنجازات\n\nاختم بـ"نظرة ختامية".`,
    },
  ]

  const sections: Record<string, string> = {}

  for (const call of calls) {
    onProgress?.(call.step, call.percent)
    sections[call.key] = await callGemini(call.prompt)
  }

  onProgress?.('اكتمل التوليد بنجاح ✓', 100)

  const result: Record<string, ReportSectionData> = {}
  for (const key of Object.keys(sections)) {
    result[key] = { content: sections[key], approved: false, editedAt: null }
  }
  return result
}
