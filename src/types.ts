export interface OrgData {
  name: string
  field: string
  issue: string
  targetGroup: string
  intervieweeName: string
  jobTitle: string
  interviewDate: string
  consultantName: string
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
