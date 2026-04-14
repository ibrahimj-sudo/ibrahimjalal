import { useState } from 'react'
import type { OrgData, Report, Attendee } from '../types'

interface Props {
  report: Report
  onSave: (data: OrgData) => void
  onNext: () => void
}

export default function OrgDataTab({ report, onSave, onNext }: Props) {
  const [data, setData] = useState<OrgData>(() => ({
    ...report.orgData,
    attendees: report.orgData.attendees?.length
      ? report.orgData.attendees
      : [{ name: '', role: '', department: '' }],
  }))

  const update = (key: keyof OrgData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const updateAttendee = (idx: number, field: keyof Attendee, value: string) => {
    setData((prev) => {
      const attendees = [...prev.attendees]
      attendees[idx] = { ...attendees[idx], [field]: value }
      return { ...prev, attendees }
    })
  }

  const addAttendee = () => {
    if (data.attendees.length >= 10) return
    setData((prev) => ({
      ...prev,
      attendees: [...prev.attendees, { name: '', role: '', department: '' }],
    }))
  }

  const removeAttendee = (idx: number) => {
    if (data.attendees.length <= 1) return
    setData((prev) => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== idx),
    }))
  }

  const filledAttendees = data.attendees.filter((a) => a.name.trim()).length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(data)
    onNext()
  }

  const inputClass = 'w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-colors'

  return (
    <form onSubmit={handleSubmit} className="max-w-[600px] mx-auto space-y-5">
      {/* اسم الجهة */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          اسم الجهة<span className="text-red-500 mr-1">*</span>
        </label>
        <input type="text" className={inputClass} placeholder="مثال: جمعية إنسان" required value={data.name} onChange={(e) => update('name', e.target.value)} />
      </div>

      {/* رقم الترخيص — NEW */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          رقم ترخيص الجهة
        </label>
        <input type="text" className={inputClass} placeholder="مثال: 1010123456" value={data.licenseNumber} onChange={(e) => update('licenseNumber', e.target.value)} />
        <p className="text-xs text-gray-400 mt-1">يمكن الحصول عليه من المركز الوطني لتنمية القطاع غير الربحي</p>
      </div>

      {/* مجال عمل الجهة */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          مجال عمل الجهة<span className="text-red-500 mr-1">*</span>
        </label>
        <input type="text" className={inputClass} placeholder="مثال: رعاية الأيتام" required value={data.field} onChange={(e) => update('field', e.target.value)} />
      </div>

      {/* القضية الاجتماعية */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          القضية الاجتماعية<span className="text-red-500 mr-1">*</span>
        </label>
        <textarea className={inputClass} rows={3} placeholder="صف القضية الاجتماعية التي تعمل عليها الجهة..." required value={data.issue} onChange={(e) => update('issue', e.target.value)} />
      </div>

      {/* الفئة المستهدفة */}
      <div>
        <label className="block text-sm font-medium mb-1.5">الفئة المستهدفة</label>
        <input type="text" className={inputClass} placeholder="مثال: الأطفال الأيتام وأسرهم" value={data.targetGroup} onChange={(e) => update('targetGroup', e.target.value)} />
      </div>

      {/* اسم المُقابَل */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          اسم المُقابَل<span className="text-red-500 mr-1">*</span>
        </label>
        <input type="text" className={inputClass} placeholder="اسم الشخص الذي ستتم مقابلته" required value={data.intervieweeName} onChange={(e) => update('intervieweeName', e.target.value)} />
      </div>

      {/* الصفة الوظيفية */}
      <div>
        <label className="block text-sm font-medium mb-1.5">الصفة الوظيفية</label>
        <input type="text" className={inputClass} placeholder="مثال: المدير التنفيذي" value={data.jobTitle} onChange={(e) => update('jobTitle', e.target.value)} />
      </div>

      {/* تاريخ المقابلة */}
      <div>
        <label className="block text-sm font-medium mb-1.5">تاريخ المقابلة</label>
        <input type="date" className={inputClass} value={data.interviewDate} onChange={(e) => update('interviewDate', e.target.value)} />
      </div>

      {/* اسم المقابِل */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          اسم المقابِل (المستشار)<span className="text-red-500 mr-1">*</span>
        </label>
        <input type="text" className={inputClass} placeholder="اسم المستشار الذي يجري المقابلة" required value={data.consultantName} onChange={(e) => update('consultantName', e.target.value)} />
      </div>

      {/* === حاضرو الجلسة — NEW === */}
      <div className="bg-white border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-bold" style={{ color: '#2d2066' }}>👥 حاضرو جلسة المقابلة</h3>
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">اختياري</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">أضف أسماء وصفات الحاضرين في الجلسة — حتى 10 أشخاص</p>

        <div className="space-y-3">
          {data.attendees.map((att, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="grid grid-cols-3 gap-2 flex-1">
                <input
                  type="text"
                  className="rounded-lg border border-border px-3 py-2 text-xs focus:outline-none focus:border-purple"
                  placeholder="الاسم"
                  value={att.name}
                  onChange={(e) => updateAttendee(idx, 'name', e.target.value)}
                />
                <input
                  type="text"
                  className="rounded-lg border border-border px-3 py-2 text-xs focus:outline-none focus:border-purple"
                  placeholder="الصفة الوظيفية"
                  value={att.role}
                  onChange={(e) => updateAttendee(idx, 'role', e.target.value)}
                />
                <input
                  type="text"
                  className="rounded-lg border border-border px-3 py-2 text-xs focus:outline-none focus:border-purple"
                  placeholder="الإدارة / القسم"
                  value={att.department}
                  onChange={(e) => updateAttendee(idx, 'department', e.target.value)}
                />
              </div>
              {data.attendees.length > 1 && (
                <button type="button" onClick={() => removeAttendee(idx)} className="text-red-400 hover:text-red-600 text-sm mt-1.5 cursor-pointer">✕</button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3">
          {data.attendees.length < 10 && (
            <button type="button" onClick={addAttendee} className="text-xs text-purple hover:underline cursor-pointer">
              ➕ إضافة حاضر آخر
            </button>
          )}
          {filledAttendees > 0 && (
            <span className="text-xs text-gray-400">عدد الحاضرين: {filledAttendees}</span>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-purple text-white py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer"
      >
        حفظ والانتقال للمقابلة ←
      </button>
    </form>
  )
}
