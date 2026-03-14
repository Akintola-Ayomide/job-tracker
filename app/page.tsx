"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ApplicationFormModal } from "@/components/application-form-modal"
import { ApplicationsTable } from "@/components/applications-table"
import { StatisticsWidget } from "@/components/statistics-widget"
import { DataManagement } from "@/components/data-management"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useAppStore } from "@/lib/store"
import type { JobApplication } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus, LogOut } from "lucide-react"

function DashboardContent() {
  const router = useRouter()
  const { user, logout, fetchApplications, fetchStatistics } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<JobApplication | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchApplications(), fetchStatistics()])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [fetchApplications, fetchStatistics])

  useEffect(() => {
    if (editingApp) {
      setIsModalOpen(true)
    }
  }, [editingApp])

  const handleEdit = (app: JobApplication) => {
    setEditingApp(app)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingApp(undefined)
  }

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Job Application Tracker</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name || "User"}!
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                setEditingApp(undefined)
                setIsModalOpen(true)
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Application
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <StatisticsWidget />
        </div>

        {/* Data Management */}
        <div className="mb-6 flex justify-end">
          <DataManagement />
        </div>

        {/* Applications Table */}
        <ApplicationsTable onEdit={handleEdit} />

        {/* Modal */}
        <ApplicationFormModal isOpen={isModalOpen} onClose={handleCloseModal} editingApp={editingApp} />
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
