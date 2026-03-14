export type ApplicationStatus = "applied" | "interview" | "offer" | "rejected" | "accepted"

export interface JobApplication {
  id: string
  company: string
  role: string
  status: ApplicationStatus
  dateApplied: string
  notes: string
  salary?: string
  location?: string
}

export interface Statistics {
  total: number
  interviews: number
  offers: number
  rejections: number
  accepted: number
}
