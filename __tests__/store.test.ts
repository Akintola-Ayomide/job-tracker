import { renderHook, act } from "@testing-library/react"
import { useAppStore } from "@/lib/store"
import type { JobApplication } from "@/lib/types"

describe("useAppStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAppStore())
    act(() => {
      result.current.applications = []
    })
  })

  it("should add an application", () => {
    const { result } = renderHook(() => useAppStore())
    const app: JobApplication = {
      id: "1",
      company: "Google",
      role: "Engineer",
      status: "applied",
      dateApplied: "2025-01-01",
      notes: "Test",
    }

    act(() => {
      result.current.addApplication(app)
    })

    expect(result.current.applications).toHaveLength(1)
    expect(result.current.applications[0]).toEqual(app)
  })

  it("should update an application", () => {
    const { result } = renderHook(() => useAppStore())
    const app: JobApplication = {
      id: "1",
      company: "Google",
      role: "Engineer",
      status: "applied",
      dateApplied: "2025-01-01",
      notes: "Test",
    }

    act(() => {
      result.current.addApplication(app)
      result.current.updateApplication("1", { status: "interview" })
    })

    expect(result.current.applications[0].status).toBe("interview")
  })

  it("should delete an application", () => {
    const { result } = renderHook(() => useAppStore())
    const app: JobApplication = {
      id: "1",
      company: "Google",
      role: "Engineer",
      status: "applied",
      dateApplied: "2025-01-01",
      notes: "Test",
    }

    act(() => {
      result.current.addApplication(app)
      result.current.deleteApplication("1")
    })

    expect(result.current.applications).toHaveLength(0)
  })

  it("should calculate statistics correctly", () => {
    const { result } = renderHook(() => useAppStore())
    const apps: JobApplication[] = [
      { id: "1", company: "Google", role: "Engineer", status: "applied", dateApplied: "2025-01-01", notes: "" },
      { id: "2", company: "Meta", role: "Engineer", status: "interview", dateApplied: "2025-01-02", notes: "" },
      { id: "3", company: "Amazon", role: "Engineer", status: "offer", dateApplied: "2025-01-03", notes: "" },
    ]

    act(() => {
      apps.forEach((app) => result.current.addApplication(app))
    })

    const stats = result.current.getStatistics()
    expect(stats.total).toBe(3)
    expect(stats.interviews).toBe(1)
    expect(stats.offers).toBe(1)
  })
})
