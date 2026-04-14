import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

interface AnswerItem {
  questionId: number
  question: string
  answer: string
  note: string
}

interface RequestBody {
  orgData: {
    name: string
    field: string
    issue: string
    targetGroup: string
  }
  answers: AnswerItem[]
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const { orgData, answers } = (await req.json()) as RequestBody

    const answersText = answers
      .map(
        (a) => `س${a.questionId}: ${a.question}\nالإجابة: ${a.answer}`
      )
      .join("\n\n")

    const prompt = `
بيانات الجهة:
الاسم: ${orgData.name}
المجال: ${orgData.field}
القضية الاجتماعية: ${orgData.issue}
الفئة المستهدفة: ${orgData.targetGroup || "غير محدد"}

إجابات المقابلة:
${answersText}

اكتب تقريراً موجزاً يتضمّن:
1. الملخص التنفيذي (فقرة واحدة)
2. أبرز نقاط القوة (3 نقاط)
3. أبرز الفجوات (3 نقاط)
4. التوصيات الرئيسية (3 توصيات عملية)
5. مؤشر النضج الابتكاري (رقم من 1-5 مع تبرير)
`

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
      system:
        "أنت مستشار ابتكار في مركز سنا للابتكار الاجتماعي. اكتب بالعربية الفصحى الاحترافية. كن موجزاً وعملياً.",
    })

    const textBlock = message.content.find((b) => b.type === "text")

    return new Response(JSON.stringify({ report: textBlock?.text || "" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("API Error:", err)
    return new Response(
      JSON.stringify({ error: "فشل في توليد التقرير" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

export const config = {
  path: "/api/generate",
}
