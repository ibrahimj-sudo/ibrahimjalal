import { useState } from 'react'
import OrgDataTab from './components/OrgDataTab'
import InterviewTab from './components/InterviewTab'
import ReportTab from './components/ReportTab'

type TabId = 'org' | 'interview' | 'report'

const tabs: { id: TabId; label: string }[] = [
  { id: 'org', label: 'بيانات الجهة' },
  { id: 'interview', label: 'المقابلة' },
  { id: 'report', label: 'التقرير' },
]

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('org')
  const [saved, setSaved] = useState(false)

  const showSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>
      {/* Header */}
      <header className="no-print bg-white border-b border-border h-14 flex items-center justify-between px-6">
        <span className="text-sm font-semibold text-purple">
          SANA | سنا — نظام تقارير الابتكار
        </span>
        <span
          className={`text-sm transition-opacity duration-300 ${
            saved ? 'opacity-100 text-green-600' : 'opacity-0'
          }`}
        >
          تم الحفظ ✓
        </span>
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
          <OrgDataTab onSave={showSaved} onNext={() => setActiveTab('interview')} />
        )}
        {activeTab === 'interview' && (
          <InterviewTab onSave={showSaved} onComplete={() => setActiveTab('report')} />
        )}
        {activeTab === 'report' && <ReportTab />}
      </main>
    </div>
  )
}

export default App
