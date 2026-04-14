import { useState, useEffect } from 'react'
import type { OrgData } from '../types'

const STORAGE_KEY = 'sana_org_data'

const emptyOrg: OrgData = {
  name: '',
  field: '',
  issue: '',
  targetGroup: '',
  intervieweeName: '',
  jobTitle: '',
  interviewDate: '',
  consultantName: '',
}

interface Props {
  onSave: () => void
  onNext: () => void
}

const fields: { key: keyof OrgData; label: string; required: boolean; type: 'text' | 'textarea' | 'date'; placeholder: string; rows?: number }[] = [
  { key: 'name', label: 'اسم الجهة', required: true, type: 'text', placeholder: 'مثال: جمعية إنسان' },
  { key: 'field', label: 'مجال عمل الجهة', required: true, type: 'text', placeholder: 'مثال: رعاية الأيتام' },
  { key: 'issue', label: 'القضية الاجتماعية', required: true, type: 'textarea', placeholder: 'صف القضية الاجتماعية التي تعمل عليها الجهة...', rows: 3 },
  { key: 'targetGroup', label: 'الفئة المستهدفة', required: false, type: 'text', placeholder: 'مثال: الأطفال الأيتام وأسرهم' },
  { key: 'intervieweeName', label: 'اسم المُقابَل', required: true, type: 'text', placeholder: 'اسم الشخص الذي ستتم مقابلته' },
  { key: 'jobTitle', label: 'الصفة الوظيفية', required: false, type: 'text', placeholder: 'مثال: المدير التنفيذي' },
  { key: 'interviewDate', label: 'تاريخ المقابلة', required: false, type: 'date', placeholder: '' },
  { key: 'consultantName', label: 'اسم المقابِل (المستشار)', required: true, type: 'text', placeholder: 'اسم المستشار الذي يجري المقابلة' },
]

export default function OrgDataTab({ onSave, onNext }: Props) {
  const [data, setData] = useState<OrgData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : emptyOrg
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const update = (key: keyof OrgData, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    onSave()
    onNext()
  }

  const inputClass = 'w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-colors'

  return (
    <form onSubmit={handleSubmit} className="max-w-[600px] mx-auto space-y-5">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-sm font-medium mb-1.5">
            {f.label}
            {f.required && <span className="text-red-500 mr-1">*</span>}
          </label>
          {f.type === 'textarea' ? (
            <textarea
              className={inputClass}
              rows={f.rows || 3}
              placeholder={f.placeholder}
              required={f.required}
              value={data[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
            />
          ) : (
            <input
              type={f.type}
              className={inputClass}
              placeholder={f.placeholder}
              required={f.required}
              value={data[f.key]}
              onChange={(e) => update(f.key, e.target.value)}
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-purple text-white py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer"
      >
        حفظ والانتقال للمقابلة ←
      </button>
    </form>
  )
}
