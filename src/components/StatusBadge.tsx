import type { ReportStatus } from '../types'

const config: Record<ReportStatus, { label: string; bg: string; text: string; dot: string }> = {
  draft:          { label: 'مسودة',              bg: 'bg-gray-100',   text: 'text-gray-600',  dot: 'bg-gray-400' },
  interview_done: { label: 'المقابلة مكتملة',    bg: 'bg-blue-50',    text: 'text-blue-700',  dot: 'bg-blue-500' },
  generating:     { label: 'جارٍ التوليد',        bg: 'bg-purple-light', text: 'text-purple',  dot: 'bg-purple' },
  pending_review: { label: 'بانتظار المراجعة',   bg: 'bg-amber-50',   text: 'text-amber-700', dot: 'bg-amber-500' },
  in_review:      { label: 'قيد المراجعة',       bg: 'bg-blue-50',    text: 'text-blue-700',  dot: 'bg-blue-500' },
  approved:       { label: 'معتمد ✓',            bg: 'bg-green-50',   text: 'text-green-700', dot: 'bg-green-600' },
}

export default function StatusBadge({ status }: { status: ReportStatus }) {
  const c = config[status] || config.draft
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}
