"use client"

import type React from "react"

import { useRef } from "react"
import { useAppStore } from "@/lib/store"
import type { JobApplication } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Download, Upload } from "lucide-react"

export function DataManagement() {
  const { exportToJSON, loadFromJSON } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const data = exportToJSON()
    const element = document.createElement("a")
    element.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`)
    element.setAttribute("download", `job-applications-${new Date().toISOString().split("T")[0]}.json`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as JobApplication[]
        loadFromJSON(data)
        alert("Data imported successfully!")
      } catch (error) {
        alert("Failed to import data. Please check the file format.")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 bg-transparent">
        <Download className="h-4 w-4" />
        Export
      </Button>
      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
        <Upload className="h-4 w-4" />
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
        aria-label="Import JSON file"
      />
    </div>
  )
}
