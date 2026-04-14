export interface OrgData {
  name: string
  field: string
  issue: string
  targetGroup: string
  intervieweeName: string
  jobTitle: string
  interviewDate: string
  consultantName: string
  licenseNumber: string
  attendees: Attendee[]
}

export interface Attendee {
  name: string
  role: string
  department: string
}

export interface Answer {
  answer: string
  note: string
}

export interface Answers {
  [key: string]: Answer
}

export interface Question {
  id: number
  phase: string
  text: string
  hint: string
}

export type ReportStatus = 'draft' | 'interview_done' | 'generating' | 'pending_review' | 'in_review' | 'approved'

export interface ReportSectionData {
  content: string
  approved: boolean
  editedAt: string | null
}

export interface Report {
  id: string
  status: ReportStatus
  currentStage: number
  createdAt: string
  updatedAt: string
  orgData: OrgData
  answers: Answers
  reportContent: string
  reportSections: {
    executiveSummary: ReportSectionData
    section1: ReportSectionData
    section2: ReportSectionData
    section3: ReportSectionData
    section4: ReportSectionData
    section5: ReportSectionData
    section6: ReportSectionData
  }
  approval: {
    consultantName: string
    approvedAt: string | null
    generalNotes: string
    version: number
  }
}

export const emptyOrgData: OrgData = {
  name: '',
  field: '',
  issue: '',
  targetGroup: '',
  intervieweeName: '',
  jobTitle: '',
  interviewDate: '',
  consultantName: '',
  licenseNumber: '',
  attendees: [{ name: '', role: '', department: '' }],
}

const emptySection: ReportSectionData = { content: '', approved: false, editedAt: null }

export function createEmptyReport(): Report {
  const id = `sana_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const now = new Date().toISOString()
  return {
    id,
    status: 'draft',
    currentStage: 1,
    createdAt: now,
    updatedAt: now,
    orgData: { ...emptyOrgData, attendees: [{ name: '', role: '', department: '' }] },
    answers: {},
    reportContent: '',
    reportSections: {
      executiveSummary: { ...emptySection },
      section1: { ...emptySection },
      section2: { ...emptySection },
      section3: { ...emptySection },
      section4: { ...emptySection },
      section5: { ...emptySection },
      section6: { ...emptySection },
    },
    approval: {
      consultantName: '',
      approvedAt: null,
      generalNotes: '',
      version: 1,
    },
  }
}

// --- localStorage helpers ---

const REPORTS_KEY = 'sana_reports'

export function getReports(): Report[] {
  const raw = localStorage.getItem(REPORTS_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveReports(reports: Report[]) {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
}

export function getReportById(id: string): Report | undefined {
  return getReports().find((r) => r.id === id)
}

export function upsertReport(report: Report) {
  const reports = getReports()
  const idx = reports.findIndex((r) => r.id === report.id)
  report.updatedAt = new Date().toISOString()
  if (idx >= 0) {
    reports[idx] = report
  } else {
    reports.unshift(report)
  }
  saveReports(reports)
}

export function deleteReport(id: string) {
  saveReports(getReports().filter((r) => r.id !== id))
}

// Status helpers
export const statusLabels: Record<ReportStatus, string> = {
  draft: 'مسودة',
  interview_done: 'المقابلة مكتملة',
  generating: 'جارٍ التوليد',
  pending_review: 'بانتظار المراجعة',
  in_review: 'قيد المراجعة',
  approved: 'معتمد',
}

export const statusColors: Record<ReportStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  interview_done: 'bg-blue-100 text-blue-700',
  generating: 'bg-purple-light text-purple',
  pending_review: 'bg-amber-100 text-amber-700',
  in_review: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
}
