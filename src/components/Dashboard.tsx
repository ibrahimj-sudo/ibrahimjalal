import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getReports, deleteReport } from '../types'
import type { Report } from '../types'
import StatusBadge from './StatusBadge'

type FilterType = 'all' | 'draft' | 'pending_review' | 'approved'

const filterOptions: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'draft', label: 'مسودة' },
  { id: 'pending_review', label: 'بانتظار المراجعة' },
  { id: 'approved', label: 'معتمد' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [reports, setReports] = useState<Report[]>(() => getReports())
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  const pendingReports = useMemo(
    () => reports.filter((r) => r.status === 'pending_review' || r.status === 'in_review'),
    [reports]
  )

  const filtered = useMemo(() => {
    let list = reports
    if (search.trim()) list = list.filter((r) => r.orgData.name.includes(search))
    if (filter === 'draft') list = list.filter((r) => r.status === 'draft' || r.status === 'interview_done')
    else if (filter === 'pending_review') list = list.filter((r) => r.status === 'pending_review' || r.status === 'in_review')
    else if (filter === 'approved') list = list.filter((r) => r.status === 'approved')
    return list
  }, [reports, search, filter])

  const handleDelete = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التقرير؟')) return
    deleteReport(id)
    setReports(getReports())
  }

  const getSectionsApproved = (r: Report) => {
    if (!r.reportSections) return 0
    return Object.values(r.reportSections).filter((s) => s.approved).length
  }

  const openReport = (r: Report) => {
    if (r.status === 'pending_review' || r.status === 'in_review' || r.status === 'approved') {
      navigate(`/report/${r.id}/edit`)
    } else if (r.currentStage >= 3) {
      navigate(`/report/${r.id}/generate`)
    } else if (r.currentStage >= 2) {
      navigate(`/report/${r.id}/interview`)
    } else {
      navigate(`/report/${r.id}/interview`)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="no-print bg-white border-b border-border h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-semibold text-purple hover:opacity-80 transition-opacity">
            SANA | سنا
          </Link>
          <span className="text-xs text-gray-400">—</span>
          <span className="text-xs text-gray-500">لوحة التحكم</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xs text-gray-400 hover:text-purple transition-colors">🏠 الرئيسية</Link>
          <Link to="/new-report" className="bg-purple text-white text-xs px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            ➕ تقرير جديد
          </Link>
        </div>
      </header>

      <main className="p-6 max-w-[960px] mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <Link to="/" className="text-xs text-gray-400 hover:text-purple transition-colors">→ الرئيسية</Link>
          <h1 className="text-2xl font-bold mt-2" style={{ color: '#2d2066' }}>لوحة التحكم</h1>
          <p className="text-sm text-gray-500">جميع المقابلات والتقارير</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 sticky top-0 z-10">
          <input
            type="text"
            placeholder="ابحث باسم الجهة..."
            className="rounded-lg border border-border px-4 py-2 text-sm focus:outline-none focus:border-purple w-full sm:w-[280px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
                  filter === f.id
                    ? 'bg-purple text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section A — Pending Review */}
        {pendingReports.length > 0 && filter !== 'draft' && filter !== 'approved' && (
          <div className="mb-8">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg mb-4" style={{ background: '#FEF3C7', borderRight: '4px solid #BA7517' }}>
              <span className="text-sm font-bold" style={{ color: '#92400E' }}>⚠️ بانتظار المراجعة والاعتماد</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">{pendingReports.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendingReports.map((r) => {
                const approved = getSectionsApproved(r)
                return (
                  <div key={r.id} className="bg-white border border-border rounded-xl p-4" style={{ borderRight: '4px solid #BA7517' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm" style={{ color: '#2d2066' }}>{r.orgData.name || 'بدون اسم'}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {new Date(r.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-3">
                      المقابِل: {r.orgData.consultantName || '—'} · المجال: {r.orgData.field || '—'}
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>تقدّم المراجعة</span>
                        <span>{approved} من 7</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(approved / 7) * 100}%`, background: '#BA7517' }} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/report/${r.id}/edit`)}
                        className="flex-1 text-xs py-2 rounded-lg text-white cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ background: '#BA7517' }}
                      >
                        ✏️ فتح للمراجعة
                      </button>
                      <button
                        onClick={() => openReport(r)}
                        className="text-xs px-3 py-2 rounded-lg border border-border text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        👁 عرض
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Section B — All Reports Table */}
        <div>
          <h2 className="text-base font-bold mb-3" style={{ color: '#2d2066' }}>📋 جميع التقارير</h2>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-5xl mb-4">📄</div>
              <p className="text-gray-400 mb-2 font-medium">لا توجد تقارير بعد</p>
              <p className="text-xs text-gray-300 mb-4">ابدأ بإنشاء تقريرك الأول</p>
              <Link
                to="/new-report"
                className="inline-block bg-purple text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                ➕ بدء تقرير جديد
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/50">
                      <th className="text-right text-xs font-medium text-gray-400 px-4 py-3">#</th>
                      <th className="text-right text-xs font-medium text-gray-400 px-4 py-3">اسم الجهة</th>
                      <th className="text-right text-xs font-medium text-gray-400 px-4 py-3">المجال</th>
                      <th className="text-right text-xs font-medium text-gray-400 px-4 py-3">رقم الترخيص</th>
                      <th className="text-right text-xs font-medium text-gray-400 px-4 py-3">المقابِل</th>
                      <th className="text-right text-xs font-medium text-gray-400 px-4 py-3">التاريخ</th>
                      <th className="text-right text-xs font-medium text-gray-400 px-4 py-3">الحالة</th>
                      <th className="text-right text-xs font-medium text-gray-400 px-4 py-3">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, idx) => (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-sm" style={{ color: '#2d2066' }}>
                          {r.orgData.name || 'بدون اسم'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{r.orgData.field || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{r.orgData.licenseNumber || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{r.orgData.consultantName || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openReport(r)} className="text-xs px-2 py-1 rounded hover:bg-purple-light text-purple cursor-pointer transition-colors" title="عرض">👁</button>
                            <button onClick={() => navigate(`/report/${r.id}/edit`)} className="text-xs px-2 py-1 rounded hover:bg-purple-light text-purple cursor-pointer transition-colors" title="تعديل">✏️</button>
                            <button onClick={() => handleDelete(r.id)} className="text-xs px-2 py-1 rounded hover:bg-red-50 text-red-500 cursor-pointer transition-colors" title="حذف">🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
