import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getReports } from '../types'

export default function LandingPage() {
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const reports = getReports()
    const approved = reports.filter((r) => r.status === 'approved').length
    const pending = reports.filter((r) => r.status === 'pending_review' || r.status === 'in_review').length
    const orgs = new Set(reports.map((r) => r.orgData.name).filter(Boolean)).size
    return { approved, pending, orgs }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-[900px]">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <img
              src="/logo-03.png"
              alt="سنا — مركز ابتكار اجتماعي"
              className="h-[100px] mx-auto mb-6 object-contain"
              onError={(e) => {
                // Fallback if logo not found
                e.currentTarget.style.display = 'none'
              }}
            />
            <h1 className="text-[32px] font-bold mb-2" style={{ color: '#2d2066' }}>
              نظام تقارير سياق الابتكار
            </h1>
            <p className="text-lg" style={{ color: '#7F77DD' }}>
              مركز سنا للابتكار الاجتماعي
            </p>
            <div className="w-16 h-1 bg-purple mx-auto mt-5 rounded-full" />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <StatCard number={stats.approved} label="تقرير مكتمل" />
            <StatCard number={stats.pending} label="تقرير بانتظار المراجعة" />
            <StatCard number={stats.orgs} label="جهة تم تحليلها" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-[520px] mx-auto mb-10">
            <button
              onClick={() => navigate('/new-report')}
              className="flex-1 bg-purple text-white font-medium rounded-[10px] cursor-pointer hover:opacity-90 transition-opacity text-base"
              style={{ height: '52px' }}
            >
              ➕ بدء تقرير جديد
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 border-2 border-purple text-purple font-medium rounded-[10px] cursor-pointer hover:bg-purple-light transition-colors text-base"
              style={{ height: '52px' }}
            >
              📋 عرض التقارير السابقة
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          الإصدار 1.0 · مركز سنا للابتكار الاجتماعي
        </p>
      </div>
    </div>
  )
}

function StatCard({ number, label }: { number: number; label: string }) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 text-center border-t-3 border-t-purple">
      <div className="text-4xl font-bold text-purple mb-1">{number}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}
