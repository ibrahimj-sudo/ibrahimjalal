interface Props {
  open: boolean
  onClose: () => void
}

export default function SettingsModal({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-[460px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold" style={{ color: '#2d2066' }}>
              ⚙️ إعدادات النظام
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">✕</button>
          </div>

          {/* Connected status card */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-base font-bold text-green-700 mb-2">
              الذكاء الاصطناعي متصل ويعمل
            </h3>
            <p className="text-sm text-green-600 mb-1">
              يستخدم التطبيق Google Gemini 1.5 Flash
            </p>
            <p className="text-xs text-green-500">
              جاهز لتوليد تقارير سياق الابتكار
            </p>
          </div>

          <div className="mt-5 text-center">
            <p className="text-xs text-gray-400">
              الإصدار 1.0 · مركز سنا للابتكار الاجتماعي
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
