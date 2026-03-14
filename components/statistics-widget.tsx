"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export function StatisticsWidget() {
  const { getStatistics } = useAppStore()
  const stats = getStatistics()

  const chartData = [
    { name: "Applied", value: stats.total - stats.interviews - stats.offers - stats.rejections - stats.accepted },
    { name: "Interviews", value: stats.interviews },
    { name: "Offers", value: stats.offers },
    { name: "Rejected", value: stats.rejections },
    { name: "Accepted", value: stats.accepted },
  ].filter((item) => item.value > 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No applications yet</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Applied</span>
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Interviews</span>
            <span className="text-2xl font-bold text-blue-500">{stats.interviews}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Offers</span>
            <span className="text-2xl font-bold text-green-500">{stats.offers}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Rejected</span>
            <span className="text-2xl font-bold text-red-500">{stats.rejections}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Accepted</span>
            <span className="text-2xl font-bold text-purple-500">{stats.accepted}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
