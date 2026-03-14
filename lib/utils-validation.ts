import type { JobApplication } from "./types"

export function validateApplication(app: Partial<JobApplication>): string[] {
  const errors: string[] = []

  if (!app.company?.trim()) errors.push("Company name is required")
  if (!app.role?.trim()) errors.push("Role is required")
  if (!app.status) errors.push("Status is required")
  if (!app.dateApplied?.trim()) errors.push("Date applied is required")

  return errors
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
