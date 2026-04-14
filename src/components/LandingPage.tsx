import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getReports } from '../types'

export default function LandingPage() {
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const reports = getReports()
    const total = reports.length
    const pending = reports.filter((r) => r.status === 'pending_review' || r.status === 'in_review').length
    const approved = reports.filter((r) => r.status === 'approved').length
    return { total, pending, approved }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#F7F6FE' }}>
      <div className="w-full max-w-[860px]">
        <div className="bg-white rounded-2xl shadow-md" style={{ padding: '48px' }}>
          {/* Logo & Title */}
          <div className="text-center mb-10">
            <img
              src="logo-03.png"
              alt="سنا — مركز ابتكار اجتماعي"
              className="h-[100px] mx-auto mb-6 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <h1 className="text-[32px] font-bold mb-3" style={{ color: '#2d2066' }}>
              نظام تقارير سياق الابتكار
            </h1>
            <p className="text-lg mb-5" style={{ color: '#7F77DD' }}>
              مركز سنا للابتكار الاجتماعي
            </p>
            <div className="mx-auto rounded-full" style={{ width: '80px', height: '2px', background: '#4B3DAB' }} />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-white border border-border rounded-xl p-5 text-center" style={{ borderTop: '3px solid #4B3DAB' }}>
              <div className="text-4xl font-bold mb-1" style={{ color: '#4B3DAB' }}>{stats.total}</div>
              <div className="text-sm text-gray-500">تقرير في النظام</div>
            </div>
            <div className="bg-white border border-border rounded-xl p-5 text-center" style={{ borderTop: '3px solid #BA7517' }}>
              <div className="text-4xl font-bold mb-1" style={{ color: '#BA7517' }}>{stats.pending}</div>
              <div className="text-sm text-gray-500">بانتظار المراجعة</div>
            </div>
            <div className="bg-white border border-border rounded-xl p-5 text-center" style={{ borderTop: '3px solid #0F6E56' }}>
              <div className="text-4xl font-bold mb-1" style={{ color: '#0F6E56' }}>{stats.approved}</div>
              <div className="text-sm text-gray-500">تقرير معتمد</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="max-w-[500px] mx-auto">
            <button
              onClick={() => navigate('/new-report')}
              className="w-full cursor-pointer hover:opacity-90 transition-opacity mb-3"
              style={{ height: '52px', borderRadius: '10px', background: '#4B3DAB', color: 'white', fontSize: '18px', fontWeight: 600, border: 'none' }}
            >
              ➕  بدء تقرير جديد
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full cursor-pointer hover:bg-purple-light transition-colors"
              style={{ height: '52px', borderRadius: '10px', background: 'white', color: '#4B3DAB', fontSize: '18px', fontWeight: 600, border: '2px solid #4B3DAB' }}
            >
              📋  لوحة التحكم — التقارير السابقة
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          الإصدار 1.0 · مركز سنا للابتكار الاجتماعي · 2025
        </p>
      </div>
    </div>
  )
}
