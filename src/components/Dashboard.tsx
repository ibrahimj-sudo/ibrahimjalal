import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getReports, deleteReport, statusLabels, statusColors } from '../types'
import type { Report } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const [reports, setReports] = useState<Report[]>(() => getReports())
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return reports
    return reports.filter((r) => r.orgData.name.includes(search))
  }, [reports, search])

  const handleDelete = (id: string) => {
    deleteReport(id)
    setReports(getReports())
  }

  const openReport = (r: Report) => {
    if (r.currentStage <= 1) navigate(`/new-report`)
    else if (r.currentStage === 2) navigate(`/report/${r.id}/interview`)
    else navigate(`/report/${r.id}/generate`)
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
        <Link
          to="/new-report"
          className="bg-purple text-white text-xs px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          ➕ تقرير جديد
        </Link>
      </header>

      <main className="p-6 max-w-[900px] mx-auto">
        <h1 className="text-xl font-bold mb-6" style={{ color: '#2d2066' }}>
          لوحة التحكم — التقارير والمقابلات
        </h1>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="ابحث باسم الجهة..."
            className="w-full max-w-sm rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <p className="text-gray-400 mb-4">لا توجد تقارير بعد</p>
            <Link
              to="/new-report"
              className="inline-block bg-purple text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              ➕ بدء تقرير جديد
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-sm" style={{ color: '#2d2066' }}>
                      {r.orgData.name || 'بدون اسم'}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>
                      {statusLabels[r.status]}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 flex gap-4">
                    <span>{r.orgData.field || '—'}</span>
                    <span>{r.orgData.consultantName || '—'}</span>
                    <span>{new Date(r.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openReport(r)}
                    className="text-xs text-purple hover:bg-purple-light px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    فتح
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
