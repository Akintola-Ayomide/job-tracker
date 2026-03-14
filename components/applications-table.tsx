"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAppStore } from "@/lib/store"
import type { JobApplication, ApplicationStatus } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"

interface ApplicationsTableProps {
  onEdit: (app: JobApplication) => void
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  interview: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  offer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  accepted: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
}

export function ApplicationsTable({ onEdit }: ApplicationsTableProps) {
  const { applications, deleteApplication } = useAppStore()
  const [sortBy, setSortBy] = useState<"date" | "company" | "status">("date")
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = applications.filter((app) => filterStatus === "all" || app.status === filterStatus)

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
    }
    if (sortBy === "company") {
      return a.company.localeCompare(b.company)
    }
    return a.status.localeCompare(b.status)
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) {
      return
    }

    setDeletingId(id)
    try {
      await deleteApplication(id)
    } catch (error) {
      console.error("Failed to delete application:", error)
      alert("Failed to delete application. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  if (applications.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground mb-4">No applications yet. Start tracking your job search!</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "company" | "status")}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="date">Sort by Date</option>
            <option value="company">Sort by Company</option>
            <option value="status">Sort by Status</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus | "all")}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>

        <span className="text-sm text-muted-foreground">
          {sorted.length} of {applications.length} applications
        </span>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-sm">Company</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Role</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Date Applied</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((app, index) => (
              <motion.tr
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="py-3 px-4 font-medium">{app.company}</td>
                <td className="py-3 px-4">{app.role}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {new Date(app.dateApplied).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(app)} aria-label="Edit application">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(app.id)}
                      disabled={deletingId === app.id}
                      aria-label="Delete application"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {sorted.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-semibold">{app.company}</p>
                <p className="text-sm text-muted-foreground">{app.role}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[app.status]}`}
              >
                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{new Date(app.dateApplied).toLocaleDateString()}</p>
            {app.notes && <p className="text-sm text-muted-foreground italic">{app.notes}</p>}
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => onEdit(app)} className="flex-1">
                <Edit2 className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(app.id)}
                disabled={deletingId === app.id}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-1 text-destructive" /> Delete
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
