import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Report } from '../types'
import { questions } from '../questions'

interface Props {
  report: Report
  onReportGenerated: (content: string) => void
}

export default function ReportTab({ report, onReportGenerated }: Props) {
  const [reportText, setReportText] = useState(report.reportContent || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const { orgData, answers } = report
  const hasAnswers = answers && Object.keys(answers).length >= questions.length

  const generateReport = async () => {
    if (!orgData || !answers) return
    setLoading(true)
    setError('')
    setReportText('')

    try {
      const answersArray = questions.map((q) => ({
        questionId: q.id,
        question: q.text,
        answer: answers[String(q.id)]?.answer || '',
        note: answers[String(q.id)]?.note || '',
      }))

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgData, answers: answersArray }),
      })

      if (!res.ok) throw new Error('فشل في الاتصال بالخادم')

      const data = await res.json()
      setReportText(data.report)
      onReportGenerated(data.report)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  const copyReport = async () => {
    await navigator.clipboard.writeText(reportText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-[700px] mx-auto space-y-6">
      {/* Section A: Generate */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: '#2d2066' }}>
          توليد التقرير بالذكاء الاصطناعي
        </h2>

        {!hasAnswers ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            ⚠️ أكمل المقابلة أولاً — يجب الإجابة على جميع الأسئلة قبل توليد التقرير.
          </div>
        ) : (
          <button
            onClick={generateReport}
            disabled={loading}
            className="bg-purple text-white px-8 py-3 rounded-lg font-medium text-base hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                جارٍ توليد التقرير...
              </span>
            ) : (
              '✨ توليد التقرير'
            )}
          </button>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Section B: Report Result */}
      {reportText && (
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: '#2d2066' }}>
              نتيجة التقرير
            </h2>
            <div className="prose prose-sm max-w-none text-text leading-relaxed" dir="rtl">
              <ReactMarkdown>{reportText}</ReactMarkdown>
            </div>
          </div>

          <div className="flex gap-3 mt-4 no-print">
            <button
              onClick={copyReport}
              className="flex-1 bg-white border border-border text-text py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {copied ? '✓ تم النسخ' : 'نسخ التقرير'}
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-white border border-border text-text py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              طباعة
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
