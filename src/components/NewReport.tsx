import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { createEmptyReport, getReportById, upsertReport } from '../types'
import type { Report } from '../types'
import OrgDataTab from './OrgDataTab'
import InterviewTab from './InterviewTab'
import ReportTab from './ReportTab'

type TabId = 'org' | 'interview' | 'report'

const tabs: { id: TabId; label: string }[] = [
  { id: 'org', label: 'بيانات الجهة' },
  { id: 'interview', label: 'المقابلة' },
  { id: 'report', label: 'التقرير' },
]

export default function NewReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [saved, setSaved] = useState(false)

  // Determine initial tab from route
  const getTabFromPath = (): TabId => {
    if (location.pathname.includes('/interview')) return 'interview'
    if (location.pathname.includes('/generate')) return 'report'
    return 'org'
  }

  const [activeTab, setActiveTab] = useState<TabId>(getTabFromPath)

  // Load or create report
  const [report, setReport] = useState<Report>(() => {
    if (id) {
      const existing = getReportById(id)
      if (existing) return existing
    }
    return createEmptyReport()
  })

  // Save report on first render if new
  useEffect(() => {
    if (!id) {
      upsertReport(report)
      navigate(`/report/${report.id}/interview`, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const saveReport = (updated: Report) => {
    setReport(updated)
    upsertReport(updated)
    showSaved()
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
          <span className="text-xs text-gray-500">
            {report.orgData.name || 'تقرير جديد'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`text-sm transition-opacity duration-300 ${
              saved ? 'opacity-100 text-green-600' : 'opacity-0'
            }`}
          >
            تم الحفظ ✓
          </span>
          <Link to="/dashboard" className="text-xs text-gray-400 hover:text-purple transition-colors">
            📋 لوحة التحكم
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <nav className="no-print bg-white border-b border-border flex gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'text-purple border-b-2 border-purple bg-purple-light'
                : 'text-gray-500 hover:text-purple hover:bg-purple-light/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="p-6">
        {activeTab === 'org' && (
          <OrgDataTab
            report={report}
            onSave={(orgData) => {
              saveReport({ ...report, orgData, currentStage: Math.max(report.currentStage, 1) })
            }}
            onNext={() => setActiveTab('interview')}
          />
        )}
        {activeTab === 'interview' && (
          <InterviewTab
            report={report}
            onSave={(answers) => {
              saveReport({ ...report, answers, status: 'draft', currentStage: Math.max(report.currentStage, 2) })
            }}
            onComplete={(answers) => {
              saveReport({ ...report, answers, status: 'interview_done', currentStage: 3 })
              setActiveTab('report')
            }}
          />
        )}
        {activeTab === 'report' && (
          <ReportTab
            report={report}
            onReportGenerated={(content) => {
              saveReport({ ...report, reportContent: content, status: 'pending_review', currentStage: 4 })
            }}
          />
        )}
      </main>
    </>
  )
}
