import { validateApplication, generateId } from "@/lib/utils-validation"
import type { JobApplication } from "@/lib/types"

describe("validateApplication", () => {
  it("should return errors for missing required fields", () => {
    const errors = validateApplication({})
    expect(errors.length).toBeGreaterThan(0)
    expect(errors).toContain("Company name is required")
    expect(errors).toContain("Role is required")
  })

  it("should pass validation with all required fields", () => {
    const app: Partial<JobApplication> = {
      company: "Google",
      role: "Engineer",
      status: "applied",
      dateApplied: "2025-01-01",
    }
    const errors = validateApplication(app)
    expect(errors.length).toBe(0)
  })

  it("should reject empty strings for required fields", () => {
    const app: Partial<JobApplication> = {
      company: "   ",
      role: "",
      status: "applied",
      dateApplied: "2025-01-01",
    }
    const errors = validateApplication(app)
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe("generateId", () => {
  it("should generate unique IDs", () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })

  it("should generate string IDs", () => {
    const id = generateId()
    expect(typeof id).toBe("string")
    expect(id.length).toBeGreaterThan(0)
  })
})
