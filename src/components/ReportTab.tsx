import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import type { Report, ReportSectionData } from '../types'
import { questions } from '../questions'
import { generateFullReport, hasApiKey } from '../services/geminiAI'

interface Props {
  report: Report
  onReportGenerated: (content: string, sections: Record<string, ReportSectionData>) => void
  onOpenSettings: () => void
}

export default function ReportTab({ report, onReportGenerated, onOpenSettings }: Props) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [done, setDone] = useState(!!report.reportContent)
  const [copied, setCopied] = useState(false)

  const { orgData, answers } = report
  const hasAnswers = answers && Object.keys(answers).length >= questions.length

  const handleGenerate = async () => {
    if (!hasApiKey()) {
      setError('لم يتم إدخال مفتاح API')
      return
    }

    setLoading(true)
    setError('')
    setProgress(0)
    setCurrentStep('قراءة بيانات الجهة والمقابلة...')

    try {
      const sections = await generateFullReport(
        orgData,
        answers,
        (step, percent) => {
          setCurrentStep(step)
          setProgress(percent)
        }
      )

      // Build combined text for reportContent
      const combinedText = Object.values(sections).map((s) => s.content).join('\n\n---\n\n')
      onReportGenerated(combinedText, sections)
      setDone(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع'
      if (msg.includes('API') || msg.includes('مفتاح')) {
        setError('لم يتم إدخال مفتاح API')
      } else if (msg.includes('rate') || msg.includes('429')) {
        setError('تم تجاوز حد الطلبات — انتظر دقيقة وأعد المحاولة')
      } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed')) {
        setError('تعذّر الاتصال — تحقق من الإنترنت أو مفتاح API')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const copyReport = async () => {
    await navigator.clipboard.writeText(report.reportContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Loading screen
  if (loading) {
    return (
      <div className="max-w-[600px] mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="mb-6">
            <svg className="animate-spin h-10 w-10 text-purple mx-auto mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#2d2066' }}>
              جارٍ توليد التقرير...
            </h3>
            <p className="text-sm text-gray-500 mb-4">{currentStep}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-gray-100 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-purple rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">{progress}%</p>

          <p className="text-xs text-gray-300 mt-6">
            يتم توليد 7 أقسام — قد يستغرق 1-2 دقيقة
          </p>
        </div>
      </div>
    )
  }

  // Done — show success + navigate to editor
  if (done && report.reportContent) {
    return (
      <div className="max-w-[700px] mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#2d2066' }}>
            تم توليد التقرير بنجاح
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            يمكنك الآن مراجعة التقرير وتعديل أقسامه واعتمادها
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <button
              onClick={() => navigate(`/report/${report.id}/edit`)}
              className="flex-1 bg-purple text-white py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              ✏️ مراجعة وتعديل التقرير
            </button>
            <button
              onClick={copyReport}
              className="flex-1 border border-border text-text py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {copied ? '✓ تم النسخ' : '📋 نسخ التقرير'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-base font-bold mb-4" style={{ color: '#2d2066' }}>
            معاينة سريعة
          </h2>
          <div className="prose prose-sm max-w-none text-text leading-relaxed" dir="rtl" style={{ maxHeight: '300px', overflow: 'auto' }}>
            <ReactMarkdown>{report.reportContent.slice(0, 1500) + (report.reportContent.length > 1500 ? '\n\n...' : '')}</ReactMarkdown>
          </div>
        </div>
      </div>
    )
  }

  // Initial state — generate button
  return (
    <div className="max-w-[700px] mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: '#2d2066' }}>
          توليد التقرير بالذكاء الاصطناعي
        </h2>

        {!hasAnswers ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            ⚠️ أكمل المقابلة أولاً — يجب الإجابة على جميع الأسئلة قبل توليد التقرير.
          </div>
        ) : !hasApiKey() ? (
          <div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 mb-4">
              ⚠️ يجب إدخال مفتاح API أولاً لتفعيل توليد التقارير
            </div>
            <button
              onClick={onOpenSettings}
              className="bg-purple text-white px-6 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              ⚙️ اذهب للإعدادات
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              سيتم توليد تقرير من 7 أقسام بناءً على بيانات الجهة وإجابات المقابلة.
            </p>
            <button
              onClick={handleGenerate}
              className="bg-purple text-white px-8 py-3 rounded-lg font-medium text-base hover:opacity-90 transition-opacity cursor-pointer"
            >
              ✨ توليد التقرير
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            <p className="mb-2">{error}</p>
            <div className="flex gap-2">
              {error.includes('مفتاح') ? (
                <button onClick={onOpenSettings} className="text-xs text-purple hover:underline cursor-pointer">
                  ⚙️ اذهب للإعدادات
                </button>
              ) : (
                <button onClick={handleGenerate} className="text-xs text-purple hover:underline cursor-pointer">
                  إعادة المحاولة
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
