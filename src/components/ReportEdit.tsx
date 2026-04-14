import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { getReportById, upsertReport } from '../types'
import type { Report } from '../types'
import StatusBadge from './StatusBadge'

type SectionKey = 'executiveSummary' | 'section1' | 'section2' | 'section3' | 'section4' | 'section5' | 'section6'

const sectionNames: { key: SectionKey; label: string }[] = [
  { key: 'executiveSummary', label: '★ الملخص التنفيذي' },
  { key: 'section1', label: 'القسم الأول — السياق المؤسسي' },
  { key: 'section2', label: 'القسم الثاني — القضية الاجتماعية' },
  { key: 'section3', label: 'القسم الثالث — الممارسات والثقافة' },
  { key: 'section4', label: 'القسم الرابع — التحديات والفرص' },
  { key: 'section5', label: 'القسم الخامس — المستقبل والأثر' },
  { key: 'section6', label: 'القسم السادس — التوصيات والنضج' },
]

function splitReportContent(content: string): Record<SectionKey, string> {
  const result: Record<SectionKey, string> = {
    executiveSummary: '', section1: '', section2: '', section3: '',
    section4: '', section5: '', section6: '',
  }
  if (!content) return result

  const lines = content.split('\n')
  const sections: string[] = []
  let current = ''

  for (const line of lines) {
    if (/^#{1,3}\s/.test(line) && current.trim()) {
      sections.push(current.trim())
      current = line + '\n'
    } else {
      current += line + '\n'
    }
  }
  if (current.trim()) sections.push(current.trim())

  const keys: SectionKey[] = ['executiveSummary', 'section1', 'section2', 'section3', 'section4', 'section5', 'section6']
  sections.forEach((s, i) => {
    if (i < keys.length) result[keys[i]] = s
  })

  // If fewer sections parsed, put everything in executiveSummary
  if (sections.length <= 1 && content.trim()) {
    result.executiveSummary = content
  }

  return result
}

export default function ReportEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState<Report | null>(null)
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null)
  const [editContent, setEditContent] = useState('')
  const [consultantNotes, setConsultantNotes] = useState('')
  const [notesSavedAt, setNotesSavedAt] = useState<string | null>(null)
  const [showAttendees, setShowAttendees] = useState(false)
  const [toast, setToast] = useState('')
  const [approvalChecked, setApprovalChecked] = useState(false)

  useEffect(() => {
    if (!id) return
    const r = getReportById(id)
    if (!r) { navigate('/dashboard'); return }

    // Auto-populate sections from reportContent if empty
    const allEmpty = Object.values(r.reportSections).every((s) => !s.content)
    if (allEmpty && r.reportContent) {
      const parsed = splitReportContent(r.reportContent)
      for (const key of Object.keys(parsed) as SectionKey[]) {
        r.reportSections[key] = { ...r.reportSections[key], content: parsed[key] }
      }
      upsertReport(r)
    }

    setReport(r)
    setConsultantNotes(r.approval?.generalNotes || '')
  }, [id, navigate])

  if (!report) return null

  const save = (updated: Report) => {
    setReport(updated)
    upsertReport(updated)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const approvedCount = Object.values(report.reportSections).filter((s) => s.approved).length
  const allApproved = approvedCount === 7

  const handleStartEdit = (key: SectionKey) => {
    setEditingSection(key)
    setEditContent(report.reportSections[key].content)
  }

  const handleSaveEdit = () => {
    if (!editingSection) return
    const updated = { ...report }
    updated.reportSections = {
      ...updated.reportSections,
      [editingSection]: {
        ...updated.reportSections[editingSection],
        content: editContent,
        editedAt: new Date().toISOString(),
      },
    }
    save(updated)
    setEditingSection(null)
    showToast('تم حفظ التعديل')
  }

  const handleApproveSection = (key: SectionKey) => {
    const updated = { ...report }
    updated.reportSections = {
      ...updated.reportSections,
      [key]: { ...updated.reportSections[key], approved: !updated.reportSections[key].approved },
    }
    save(updated)
  }

  const handleSaveNotes = (value: string) => {
    setConsultantNotes(value)
    const updated = { ...report, approval: { ...report.approval, generalNotes: value } }
    save(updated)
    setNotesSavedAt(new Date().toLocaleTimeString('ar-SA'))
  }

  const handleFinalApproval = () => {
    const updated = {
      ...report,
      status: 'approved' as const,
      approval: {
        ...report.approval,
        approvedAt: new Date().toISOString(),
        consultantName: report.orgData.consultantName,
      },
    }
    save(updated)
    showToast('تم اعتماد التقرير بنجاح ✓')
  }

  const handleCopyReport = async () => {
    const text = Object.values(report.reportSections).map((s) => s.content).filter(Boolean).join('\n\n')
    await navigator.clipboard.writeText(text || report.reportContent)
    showToast('تم نسخ التقرير')
  }

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length
  const attendees = report.orgData.attendees?.filter((a) => a.name.trim()) || []

  return (
    <>
      {/* Header */}
      <header className="no-print bg-white border-b border-border h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-xs text-gray-400 hover:text-purple transition-colors">← العودة للوحة التحكم</Link>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-sm font-medium" style={{ color: '#2d2066' }}>{report.orgData.name || 'بدون اسم'}</span>
          <StatusBadge status={report.status} />
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xs text-gray-400 hover:text-purple transition-colors">🏠 الرئيسية</Link>
          <button onClick={handleCopyReport} className="text-xs bg-purple text-white px-3 py-1.5 rounded-lg hover:opacity-90 cursor-pointer transition-opacity">
            📋 نسخ التقرير
          </button>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm px-5 py-2.5 rounded-lg shadow-lg z-50 no-print">
          {toast}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-[1200px] mx-auto">
        {/* LEFT PANEL */}
        <div className="flex-1 lg:w-[65%] space-y-4">
          {/* Info Bar */}
          <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><span className="text-gray-400">الجهة:</span> <strong>{report.orgData.name || '—'}</strong></div>
            <div><span className="text-gray-400">الترخيص:</span> {report.orgData.licenseNumber || '—'}</div>
            <div><span className="text-gray-400">المقابِل:</span> {report.orgData.consultantName || '—'}</div>
            <div><span className="text-gray-400">التاريخ:</span> {report.orgData.interviewDate || '—'}</div>
          </div>

          {/* Attendees (collapsible) */}
          {attendees.length > 0 && (
            <div className="bg-white border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setShowAttendees(!showAttendees)}
                className="w-full text-right px-4 py-3 text-xs font-medium flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ color: '#2d2066' }}
              >
                <span>👥 الحاضرون ({attendees.length})</span>
                <span className="text-gray-400">{showAttendees ? '▲' : '▼'}</span>
              </button>
              {showAttendees && (
                <table className="w-full text-xs border-t border-border">
                  <thead><tr className="bg-gray-50">
                    <th className="text-right px-4 py-2 text-gray-400">#</th>
                    <th className="text-right px-4 py-2 text-gray-400">الاسم</th>
                    <th className="text-right px-4 py-2 text-gray-400">الصفة الوظيفية</th>
                    <th className="text-right px-4 py-2 text-gray-400">الإدارة</th>
                  </tr></thead>
                  <tbody>
                    {attendees.map((a, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-2">{a.name}</td>
                        <td className="px-4 py-2 text-gray-500">{a.role || '—'}</td>
                        <td className="px-4 py-2 text-gray-500">{a.department || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* 7 Section Cards */}
          {sectionNames.map(({ key, label }) => {
            const section = report.reportSections[key]
            const isEditing = editingSection === key
            return (
              <div key={key} className={`bg-white border rounded-xl overflow-hidden ${section.approved ? 'border-green-200' : 'border-border'}`}>
                <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold" style={{ color: '#2d2066' }}>{label}</h3>
                    {section.content && <span className="text-[10px] text-gray-400">{wordCount(section.content)} كلمة</span>}
                    {section.approved && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ معتمد</span>}
                  </div>
                </div>
                <div className="p-5">
                  {isEditing ? (
                    <>
                      <textarea
                        className="w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:border-purple min-h-[200px]"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <div className="flex gap-2 mt-3">
                        <button onClick={handleSaveEdit} className="bg-purple text-white text-xs px-4 py-2 rounded-lg cursor-pointer hover:opacity-90 transition-opacity">💾 حفظ</button>
                        <button onClick={() => setEditingSection(null)} className="text-xs px-4 py-2 rounded-lg border border-border text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">إلغاء</button>
                      </div>
                    </>
                  ) : (
                    <>
                      {section.content ? (
                        <div className="prose prose-sm max-w-none text-text leading-relaxed mb-3">
                          <ReactMarkdown>{section.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-300 italic mb-3">لا يوجد محتوى بعد</p>
                      )}
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleStartEdit(key)} className="text-xs text-purple hover:bg-purple-light px-3 py-1.5 rounded-lg cursor-pointer transition-colors">✏️ تعديل</button>
                        <button
                          onClick={() => handleApproveSection(key)}
                          className={`text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                            section.approved
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          {section.approved ? '✅ معتمد' : '☐ اعتماد هذا القسم'}
                        </button>
                      </div>
                      {section.editedAt && (
                        <p className="text-[10px] text-gray-300 mt-2">آخر تعديل: {new Date(section.editedAt).toLocaleString('ar-SA')}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* RIGHT PANEL — Sticky */}
        <div className="w-full lg:w-[35%] lg:sticky lg:top-6 lg:self-start space-y-4">
          {/* Card 1 — Review Progress */}
          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold mb-3" style={{ color: '#2d2066' }}>تقدّم المراجعة</h3>
            <div className="space-y-2 mb-4">
              {sectionNames.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={report.reportSections[key].approved}
                    onChange={() => handleApproveSection(key)}
                    className="accent-purple"
                  />
                  <span className={report.reportSections[key].approved ? 'text-green-700' : 'text-gray-500'}>
                    {label.replace('★ ', '')}
                  </span>
                </label>
              ))}
            </div>
            <div className="text-xs text-gray-400 mb-2">{approvedCount} من 7 أقسام معتمدة</div>
            <div className="w-full h-2 bg-gray-100 rounded-full">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(approvedCount / 7) * 100}%`, background: approvedCount === 7 ? '#0F6E56' : '#4B3DAB' }}
              />
            </div>
          </div>

          {/* Card 2 — Consultant Notes */}
          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold mb-3" style={{ color: '#2d2066' }}>ملاحظات المستشار</h3>
            <textarea
              className="w-full rounded-lg border border-border px-3 py-2 text-xs focus:outline-none focus:border-purple"
              rows={3}
              placeholder="أضف ملاحظاتك..."
              value={consultantNotes}
              onChange={(e) => handleSaveNotes(e.target.value)}
            />
            {notesSavedAt && <p className="text-[10px] text-gray-300 mt-1">آخر حفظ: {notesSavedAt}</p>}
          </div>

          {/* Card 3 — Export */}
          <div className="bg-white border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold mb-3" style={{ color: '#2d2066' }}>تصدير التقرير</h3>
            <div className="space-y-2">
              <button onClick={handleCopyReport} className="w-full text-xs py-2 rounded-lg border border-border text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">📋 نسخ نص التقرير</button>
              <button onClick={() => window.print()} className="w-full text-xs py-2 rounded-lg border border-border text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">🖨 طباعة</button>
            </div>
            <p className="text-[10px] text-gray-300 mt-3">V1.0 · آخر تحديث: {new Date(report.updatedAt).toLocaleDateString('ar-SA')}</p>
          </div>

          {/* Card 4 — Final Approval (only when all sections approved) */}
          {allApproved && report.status !== 'approved' && (
            <div className="border-2 border-purple rounded-xl p-5">
              <h3 className="text-sm font-bold mb-3" style={{ color: '#2d2066' }}>اعتماد التقرير النهائي</h3>
              <div className="text-xs text-gray-500 mb-2">
                <div>المستشار: <strong>{report.orgData.consultantName}</strong></div>
                <div>تاريخ الاعتماد: <strong>{new Date().toLocaleDateString('ar-SA')}</strong></div>
              </div>
              <label className="flex items-center gap-2 text-xs mb-3 cursor-pointer">
                <input type="checkbox" checked={approvalChecked} onChange={(e) => setApprovalChecked(e.target.checked)} className="accent-purple" />
                <span>أعتمد هذا التقرير رسمياً</span>
              </label>
              <button
                onClick={handleFinalApproval}
                disabled={!approvalChecked}
                className="w-full bg-purple text-white text-sm py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✅ اعتماد نهائي
              </button>
            </div>
          )}

          {report.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">✅</div>
              <p className="text-sm font-bold text-green-700">تم اعتماد التقرير</p>
              {report.approval?.approvedAt && (
                <p className="text-[10px] text-green-600 mt-1">
                  {new Date(report.approval.approvedAt).toLocaleDateString('ar-SA')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
