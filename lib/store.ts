import { create } from "zustand"
import type { JobApplication, Statistics } from "./types"
import { applicationsApi } from "./api/applications"
import { authApi, type User } from "./api/auth"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Auth actions
  setUser: (user: User | null) => void
  fetchCurrentUser: () => Promise<void>
  logout: () => void
  clearError: () => void
}

interface ApplicationsState {
  applications: JobApplication[]
  statistics: Statistics | null
  isLoading: boolean
  error: string | null

  // Application actions
  fetchApplications: () => Promise<void>
  fetchStatistics: () => Promise<void>
  addApplication: (app: Omit<JobApplication, "id">) => Promise<void>
  updateApplication: (id: string, updates: Partial<JobApplication>) => Promise<void>
  deleteApplication: (id: string) => Promise<void>
  clearError: () => void

  // Legacy methods for backwards compatibility
  loadFromJSON: (data: JobApplication[]) => void
  exportToJSON: () => string
}

type AppStore = AuthState & ApplicationsState

export const useAppStore = create<AppStore>((set, get) => ({
  // Auth state
  user: null,
  isAuthenticated: authApi.isAuthenticated(),

  // Applications state
  applications: [],
  statistics: null,
  isLoading: false,
  error: null,

  // Auth actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  fetchCurrentUser: async () => {
    if (!authApi.isAuthenticated()) {
      set({ user: null, isAuthenticated: false })
      return
    }

    try {
      set({ isLoading: true, error: null })
      const user = await authApi.getCurrentUser()
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error: any) {
      console.error("Failed to fetch current user:", error)
      set({ user: null, isAuthenticated: false, isLoading: false, error: error.message })
    }
  },

  logout: () => {
    authApi.logout()
    set({
      user: null,
      isAuthenticated: false,
      applications: [],
      statistics: null,
    })
  },

  // Applications actions
  fetchApplications: async () => {
    try {
      set({ isLoading: true, error: null })
      const applications = await applicationsApi.getApplications()
      set({ applications, isLoading: false })
    } catch (error: any) {
      console.error("Failed to fetch applications:", error)
      set({ error: error.message, isLoading: false })
    }
  },

  fetchStatistics: async () => {
    try {
      const statistics = await applicationsApi.getStatistics()
      set({ statistics })
    } catch (error: any) {
      console.error("Failed to fetch statistics:", error)
    }
  },

  addApplication: async (appData) => {
    try {
      set({ isLoading: true, error: null })
      const newApp = await applicationsApi.createApplication({
        ...appData,
        dateApplied: appData.dateApplied || new Date().toISOString(),
      })
      set((state) => ({
        applications: [...state.applications, newApp],
        isLoading: false,
      }))
      // Refresh statistics
      get().fetchStatistics()
    } catch (error: any) {
      console.error("Failed to add application:", error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateApplication: async (id, updates) => {
    try {
      set({ isLoading: true, error: null })
      const updated = await applicationsApi.updateApplication(id, updates)
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === id ? updated : app
        ),
        isLoading: false,
      }))
      // Refresh statistics
      get().fetchStatistics()
    } catch (error: any) {
      console.error("Failed to update application:", error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  deleteApplication: async (id) => {
    try {
      set({ isLoading: true, error: null })
      await applicationsApi.deleteApplication(id)
      set((state) => ({
        applications: state.applications.filter((app) => app.id !== id),
        isLoading: false,
      }))
      // Refresh statistics
      get().fetchStatistics()
    } catch (error: any) {
      console.error("Failed to delete application:", error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  clearError: () => set({ error: null }),

  // Legacy methods for backwards compatibility (JSON import/export)
  loadFromJSON: (data) => set({ applications: data }),
  exportToJSON: () => JSON.stringify(get().applications, null, 2),

  // Helper to get statistics from current applications
  getStatistics: () => {
    const apps = get().applications
    return {
      total: apps.length,
      interviews: apps.filter((a) => a.status === "interview").length,
      offers: apps.filter((a) => a.status === "offer").length,
      rejections: apps.filter((a) => a.status === "rejected").length,
      accepted: apps.filter((a) => a.status === "accepted").length,
    }
  },
}))
