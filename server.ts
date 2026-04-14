import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
app.use(cors())
app.use(express.json())

const client = new Anthropic()

app.post('/api/generate', async (req, res) => {
  try {
    const { orgData, answers } = req.body

    const answersText = answers
      .map((a: { questionId: number; question: string; answer: string }) =>
        `س${a.questionId}: ${a.question}\nالإجابة: ${a.answer}`
      )
      .join('\n\n')

    const prompt = `
بيانات الجهة:
الاسم: ${orgData.name}
المجال: ${orgData.field}
القضية الاجتماعية: ${orgData.issue}
الفئة المستهدفة: ${orgData.targetGroup || 'غير محدد'}

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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
      system: 'أنت مستشار ابتكار في مركز سنا للابتكار الاجتماعي. اكتب بالعربية الفصحى الاحترافية. كن موجزاً وعملياً.',
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    res.json({ report: textBlock?.text || '' })
  } catch (err) {
    console.error('API Error:', err)
    res.status(500).json({ error: 'فشل في توليد التقرير' })
  }
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
