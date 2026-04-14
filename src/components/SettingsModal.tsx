import { useState, useEffect } from 'react'
import { testGeminiConnection } from '../services/geminiAI'

const API_KEY_STORAGE = 'sana_gemini_key'

type KeyStatus = 'empty' | 'saved' | 'testing' | 'ok' | 'error'

interface Props {
  open: boolean
  onClose: () => void
}

export default function SettingsModal({ open, onClose }: Props) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [status, setStatus] = useState<KeyStatus>('empty')
  const [errorMsg, setErrorMsg] = useState('')
  const [toast, setToast] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem(API_KEY_STORAGE) || ''
      setApiKey(stored)
      setStatus(stored ? 'saved' : 'empty')
      setErrorMsg('')
    }
  }, [open])

  if (!open) return null

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleSave = () => {
    if (!apiKey.trim()) return
    localStorage.setItem(API_KEY_STORAGE, apiKey.trim())
    setStatus('saved')
    showToast('تم حفظ مفتاح Gemini ✓')
  }

  const handleTest = async () => {
    if (!apiKey.trim()) return
    localStorage.setItem(API_KEY_STORAGE, apiKey.trim())
    setStatus('testing')
    setErrorMsg('')
    const result = await testGeminiConnection()
    if (result.ok) {
      setStatus('ok')
      showToast('الاتصال يعمل بنجاح ✓')
    } else {
      setStatus('error')
      setErrorMsg(result.error || 'فشل الاتصال')
    }
  }

  const handleDelete = () => {
    localStorage.removeItem(API_KEY_STORAGE)
    setApiKey('')
    setStatus('empty')
    showToast('تم حذف مفتاح Gemini')
  }

  const statusConfig: Record<KeyStatus, { dot: string; text: string }> = {
    empty:   { dot: 'bg-gray-400', text: 'لم يتم إدخال مفتاح' },
    saved:   { dot: 'bg-amber-500', text: 'مفتاح محفوظ' },
    testing: { dot: 'bg-blue-500 animate-pulse', text: 'جارٍ الاختبار...' },
    ok:      { dot: 'bg-green-500', text: '✓ مفتاح يعمل — Gemini جاهز' },
    error:   { dot: 'bg-red-500', text: 'مفتاح غير صحيح — تحقق منه' },
  }

  const s = statusConfig[status]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {toast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-4 py-2 rounded-lg shadow-lg z-10">
            {toast}
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: '#2d2066' }}>
              ⚙️ إعدادات الاتصال بالذكاء الاصطناعي
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">✕</button>
          </div>

          {/* Info card */}
          <div className="bg-blue-50 rounded-lg p-4 mb-5 text-sm text-blue-800 leading-relaxed" style={{ borderRight: '3px solid #4B3DAB' }}>
            ✨ يستخدم هذا التطبيق <strong>Google Gemini</strong> لتوليد التقارير.
            <br />
            المفتاح مجاني ولا يحتاج بطاقة بنكية.
            <br />
            يُحفظ على جهازك فقط ولا يُرسَل لأي خادم.
          </div>

          {/* How to get key */}
          <div className="mb-5">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-xs text-purple hover:underline cursor-pointer"
            >
              كيف تحصل على مفتاح Gemini مجاناً؟ {showHelp ? '▲' : '▼'}
            </button>
            {showHelp && (
              <div className="mt-2 bg-gray-50 rounded-lg p-4 text-xs text-gray-600 leading-relaxed space-y-1">
                <p>1. اذهب إلى: aistudio.google.com</p>
                <p>2. سجّل دخول بحساب Google</p>
                <p>3. انقر Get API Key ثم Create API Key</p>
                <p>4. انسخ المفتاح والصقه هنا</p>
                <a
                  href="https://aistudio.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-purple hover:underline font-medium"
                >
                  فتح Google AI Studio ←
                </a>
              </div>
            )}
          </div>

          {/* API Key input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1.5">مفتاح Gemini API</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple pr-12"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
              >
                {showKey ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2 mb-5">
            <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
            <span className={`text-xs ${status === 'ok' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-gray-500'}`}>
              {s.text}
            </span>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="flex-1 bg-purple text-white text-sm py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              💾 حفظ المفتاح
            </button>
            <button
              onClick={handleTest}
              disabled={!apiKey.trim() || status === 'testing'}
              className="flex-1 border border-purple text-purple text-sm py-2.5 rounded-lg cursor-pointer hover:bg-purple-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'testing' ? '...' : '🧪 اختبار الاتصال'}
            </button>
            <button
              onClick={handleDelete}
              disabled={!apiKey.trim()}
              className="text-sm py-2.5 px-4 rounded-lg border border-red-200 text-red-500 cursor-pointer hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🗑
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
