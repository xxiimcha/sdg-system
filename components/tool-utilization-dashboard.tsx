"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { toast } from "@/hooks/use-toast"
import { RefreshCw } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/utils/supabase/client"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function ToolUtilizationDashboard() {
  const [timeRange, setTimeRange] = useState("6m")
  const [isLoading, setIsLoading] = useState(true)
  const [utilizationData, setUtilizationData] = useState<any[]>([])
  const [projectData, setProjectData] = useState<any[]>([])
  const [maintenanceData, setMaintenanceData] = useState<any[]>([])
  const [timelineData, setTimelineData] = useState<any[]>([])

  // Fetch dashboard data from Supabase
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)

        // Calculate date range based on selected time range
        const endDate = new Date()
        const startDate = new Date()

        switch (timeRange) {
          case "1m":
            startDate.setMonth(endDate.getMonth() - 1)
            break
          case "3m":
            startDate.setMonth(endDate.getMonth() - 3)
            break
          case "6m":
            startDate.setMonth(endDate.getMonth() - 6)
            break
          case "1y":
            startDate.setFullYear(endDate.getFullYear() - 1)
            break
          default:
            startDate.setMonth(endDate.getMonth() - 6)
        }

        const startDateStr = startDate.toISOString().split("T")[0]
        const endDateStr = endDate.toISOString().split("T")[0]

        // 1. Fetch tool utilization data
        const { data: toolsData, error: toolsError } = await supabase.from("tools").select(`
            id,
            name,
            tool_serial_numbers!inner(
              id,
              status
            )
          `)

        if (toolsError) throw toolsError

        // Transform the data for the utilization chart
        const utilData = toolsData.map((tool) => {
          const serialNumbers = tool.tool_serial_numbers || []
          return {
            name: tool.name,
            assigned: serialNumbers.filter((sn: any) => sn.status === "Not Available").length,
            available: serialNumbers.filter((sn: any) => sn.status === "Available").length,
            maintenance: serialNumbers.filter((sn: any) => sn.status === "Under Maintenance").length,
          }
        })

        setUtilizationData(utilData)

        // 2. Fetch project tool usage data
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from("tool_assignments")
          .select(`
            project_id,
            projects(
              id,
              name
            )
          `)
          .eq("status", "Assigned")

        if (assignmentsError) throw assignmentsError

        // Count tools per project
        const projectCounts: Record<string, number> = {}
        assignmentsData.forEach((assignment: any) => {
          const projectName = assignment.projects?.name || "Unknown Project"
          projectCounts[projectName] = (projectCounts[projectName] || 0) + 1
        })

        // Transform to chart data format
        const projectChartData = Object.entries(projectCounts).map(([name, tools]) => ({
          name,
          tools,
        }))

        setProjectData(projectChartData)

        // 3. Fetch maintenance type distribution
        const { data: maintenanceTypes, error: maintenanceError } = await supabase
          .from("maintenance_schedules")
          .select("maintenance_type, count")
          .gte("scheduled_date", startDateStr)
          .lte("scheduled_date", endDateStr)
          // .group("maintenance_type")

        if (maintenanceError) throw maintenanceError

        // Transform to chart data format
        const maintenanceChartData = maintenanceTypes.map((item: any) => ({
          name: item.maintenance_type,
          value: item.count,
        }))

        setMaintenanceData(maintenanceChartData)

        // 4. Fetch timeline data for tool assignments and returns
        // For this, we need to aggregate by month
        const { data: timelineAssignments, error: timelineError } = await supabase
          .from("tool_assignments")
          .select("assigned_date, return_date")
          .gte("assigned_date", startDateStr)
          .lte("assigned_date", endDateStr)

        if (timelineError) throw timelineError

        // Group by month
        const monthlyData: Record<string, { assigned: number; returned: number }> = {}

        // Initialize months
        const currentDate = new Date(startDate)
        while (currentDate <= endDate) {
          const monthKey = currentDate.toLocaleString("default", { month: "short" })
          monthlyData[monthKey] = { assigned: 0, returned: 0 }
          currentDate.setMonth(currentDate.getMonth() + 1)
        }

        // Count assignments and returns by month
        timelineAssignments.forEach((item: any) => {
          if (item.assigned_date) {
            const assignedMonth = new Date(item.assigned_date).toLocaleString("default", { month: "short" })
            if (monthlyData[assignedMonth]) {
              monthlyData[assignedMonth].assigned++
            }
          }

          if (item.return_date) {
            const returnedMonth = new Date(item.return_date).toLocaleString("default", { month: "short" })
            if (monthlyData[returnedMonth]) {
              monthlyData[returnedMonth].returned++
            }
          }
        })

        // Transform to chart data format
        const timelineChartData = Object.entries(monthlyData).map(([month, data]) => ({
          month,
          assigned: data.assigned,
          returned: data.returned,
        }))

        setTimelineData(timelineChartData)
      } catch (error) {
        // console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [timeRange])

  // Calculate total tools by status
  const totalTools = {
    assigned: utilizationData.reduce((sum, item) => sum + item.assigned, 0),
    available: utilizationData.reduce((sum, item) => sum + item.available, 0),
    maintenance: utilizationData.reduce((sum, item) => sum + item.maintenance, 0),
  }

  const totalToolCount = totalTools.assigned + totalTools.available + totalTools.maintenance

  // Status distribution data for pie chart
  const statusDistributionData = [
    { name: "Assigned", value: totalTools.assigned },
    { name: "Available", value: totalTools.available },
    { name: "Maintenance", value: totalTools.maintenance },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="flex flex-col items-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground mt-4">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tool Utilization Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalToolCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{totalTools.assigned}</div>
            <p className="text-xs text-muted-foreground">
              {totalToolCount > 0 ? Math.round((totalTools.assigned / totalToolCount) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalTools.available}</div>
            <p className="text-xs text-muted-foreground">
              {totalToolCount > 0 ? Math.round((totalTools.available / totalToolCount) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalTools.maintenance}</div>
            <p className="text-xs text-muted-foreground">
              {totalToolCount > 0 ? Math.round((totalTools.maintenance / totalToolCount) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="utilization" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="utilization">Tool Utilization</TabsTrigger>
          <TabsTrigger value="projects">Project Usage</TabsTrigger>
          {/* <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger> */}
        </TabsList>

        <TabsContent value="utilization">
          <Card>
            <CardHeader>
              <CardTitle>Tool Utilization by Status</CardTitle>
              <CardDescription>Current distribution of tools by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={utilizationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="assigned" stackId="a" fill="#f59e0b" name="Assigned" />
                      <Bar dataKey="available" stackId="a" fill="#10b981" name="Available" />
                      <Bar dataKey="maintenance" stackId="a" fill="#ef4444" name="Maintenance" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.name === "Assigned" ? "#f59e0b" : entry.name === "Available" ? "#10b981" : "#ef4444"
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Tool Usage by Project</CardTitle>
              <CardDescription>Number of tools currently assigned to each project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="tools" fill="#8884d8" name="Tools Assigned" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Distribution</CardTitle>
              <CardDescription>Distribution of maintenance types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={maintenanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {maintenanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Tool Assignment Timeline</CardTitle>
              <CardDescription>Number of tools assigned and returned over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="assigned" fill="#8884d8" name="Tools Assigned" />
                    <Bar dataKey="returned" fill="#82ca9d" name="Tools Returned" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

