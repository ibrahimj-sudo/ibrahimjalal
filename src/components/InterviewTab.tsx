import { useState, useEffect } from 'react'
import { questions } from '../questions'
import type { Answers } from '../types'

const STORAGE_KEY = 'sana_answers'

interface Props {
  onSave: () => void
  onComplete: () => void
}

export default function InterviewTab({ onSave, onComplete }: Props) {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Answers>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  })
  const [showHint, setShowHint] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  }, [answers])

  const q = questions[currentQ]
  const total = questions.length
  const current = answers[String(q.id)] || { answer: '', note: '' }

  const updateAnswer = (field: 'answer' | 'note', value: string) => {
    const updated = {
      ...answers,
      [String(q.id)]: { ...current, [field]: value },
    }
    setAnswers(updated)
  }

  const goNext = () => {
    onSave()
    if (currentQ < total - 1) {
      setCurrentQ(currentQ + 1)
      setShowHint(false)
    } else {
      setCompleted(true)
    }
  }

  const goPrev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1)
      setShowHint(false)
    }
  }

  if (completed) {
    return (
      <div className="max-w-[600px] mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-xl font-bold text-green-700 mb-2">
            اكتملت إجابات المقابلة
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            تم حفظ جميع الإجابات بنجاح. يمكنك الآن توليد التقرير.
          </p>
          <button
            onClick={onComplete}
            className="bg-purple text-white px-6 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            الانتقال لتوليد التقرير ←
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <span className="bg-purple text-white text-xs px-3 py-1 rounded-full font-medium">
            {q.phase}
          </span>
          <span className="text-xs text-gray-400">
            السؤال {currentQ + 1} من {total}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-6">
          <div
            className="h-full bg-purple rounded-full transition-all duration-300"
            style={{ width: `${((currentQ + 1) / total) * 100}%` }}
          />
        </div>

        {/* Question */}
        <h3
          className="text-lg font-bold mb-4 leading-relaxed"
          style={{ color: '#2d2066' }}
        >
          {q.text}
        </h3>

        {/* Hint */}
        <div className="mb-5">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="text-sm text-gray-500 hover:text-purple cursor-pointer transition-colors"
          >
            💡 الهدف الاستشاري {showHint ? '▲' : '▼'}
          </button>
          {showHint && (
            <div className="mt-2 bg-gray-50 rounded-lg p-3 text-sm text-gray-600 italic">
              {q.hint}
            </div>
          )}
        </div>

        {/* Answer */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1.5">
            إجابة المُقابَل
          </label>
          <textarea
            className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-colors"
            style={{ minHeight: '140px' }}
            placeholder="سجّل الإجابة هنا..."
            value={current.answer}
            onChange={(e) => updateAnswer('answer', e.target.value)}
          />
        </div>

        {/* Consultant note */}
        <div className="mb-6">
          <label className="block text-xs text-gray-400 mb-1.5">
            ملاحظة المستشار (اختياري)
          </label>
          <textarea
            className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-colors bg-gray-50"
            style={{ minHeight: '70px' }}
            placeholder="أضف ملاحظتك الاستشارية..."
            value={current.note}
            onChange={(e) => updateAnswer('note', e.target.value)}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            disabled={currentQ === 0}
            className={`text-sm px-4 py-2 rounded-lg cursor-pointer transition-colors ${
              currentQ === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-purple hover:bg-purple-light'
            }`}
          >
            → السابق
          </button>
          <button
            type="button"
            onClick={goNext}
            className="bg-purple text-white text-sm px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            {currentQ === total - 1 ? 'إنهاء المقابلة' : 'التالي ←'}
          </button>
        </div>
      </div>
    </div>
  )
}
