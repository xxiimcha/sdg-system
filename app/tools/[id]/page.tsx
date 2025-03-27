import { Suspense } from "react"
import { createServerSupabaseClient } from "@/utils/supabase/server"
import { ToolDetailActions } from "@/components/tool-detail-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ToolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return (
    <div className="container py-10 max-w-2xl">
      <Suspense fallback={<ToolDetailSkeleton />}>
        <ToolDetail id={id} />
      </Suspense>
    </div>
  )
}

async function ToolDetail({ id }: { id: string }) {
  const supabase = createServerSupabaseClient()

  // First try to find by UUID
  let { data: tool, error } = await supabase
    .from("tools")
    .select(`
      *,
      tool_serial_numbers(*)
    `)
    .eq("id", id)
    .single()

  // If not found by UUID, try to find by serial number
  if (error) {
    const { data: serialNumberData, error: serialNumberError } = await supabase
      .from("tool_serial_numbers")
      .select(`
        *,
        tools(*)
      `)
      .eq("serial_number", id)
      .single()

    if (serialNumberError) {
      // If still not found, return a friendly message
      return (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Tool Not Found</h1>
            <p className="text-muted-foreground mt-1">The tool with ID or serial number "{id}" could not be found.</p>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="mb-4">This tool may not exist in the inventory yet.</p>
              <Link href="/tools">
                <Button>Go to Tools Inventory</Button>
              </Link>
            </CardContent>
          </Card>
        </>
      )
    }

    // Restructure the data to match the expected format
    tool = {
      ...serialNumberData.tools,
      tool_serial_numbers: [serialNumberData],
    }
  }

  // Get current assignment if any
  const { data: assignment } = await supabase
    .from("tool_assignments")
    .select(`
      *,
      projects(id, name)
    `)
    .eq("tool_serial_id", tool.tool_serial_numbers[0].id)
    .eq("status", "Assigned")
    .maybeSingle()

  // Get upcoming maintenance if any
  const { data: maintenance } = await supabase
    .from("maintenance_schedules")
    .select()
    .eq("serial_number_id", tool.tool_serial_numbers[0].id)
    .in("status", ["Scheduled", "In Progress"])
    .order("scheduled_date", { ascending: true })
    .maybeSingle()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800 hover:bg-green-100/80"
      case "Not Available":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100/80"
      case "Under Maintenance":
        return "bg-red-100 text-red-800 hover:bg-red-100/80"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const serialNumber = tool.tool_serial_numbers[0].serial_number

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{tool.name}</h1>
        <p className="text-muted-foreground mt-1">Serial Number: {serialNumber}</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Tool Details</CardTitle>
            <Badge className={getStatusColor(tool.tool_serial_numbers[0].status)}>
              {tool.tool_serial_numbers[0].status}
            </Badge>
          </div>
          <CardDescription>Information about this tool and its current status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Last Maintenance</p>
              <p className="text-sm text-muted-foreground">{formatDate(tool.last_maintenance)}</p>
            </div>

            {tool.condition_notes && (
              <div className="col-span-2">
                <p className="text-sm font-medium">Condition Notes</p>
                <p className="text-sm text-muted-foreground">{tool.condition_notes}</p>
              </div>
            )}

            {assignment && (
              <div className="col-span-2">
                <p className="text-sm font-medium">Currently Assigned To</p>
                <p className="text-sm text-muted-foreground">
                  {assignment.projects.name} (since {formatDate(assignment.assigned_date)})
                </p>
              </div>
            )}

            {maintenance && (
              <div className="col-span-2">
                <p className="text-sm font-medium">Scheduled Maintenance</p>
                <p className="text-sm text-muted-foreground">
                  {maintenance.maintenance_type} on {formatDate(maintenance.scheduled_date)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ToolDetailActions
        toolId={tool.id}
        serialNumber={serialNumber}
        status={tool.tool_serial_numbers[0].status}
        assignmentId={assignment?.id}
        maintenanceId={maintenance?.id}
      />
    </>
  )
}

function ToolDetailSkeleton() {
  return (
    <>
      <div className="mb-8">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/3 mt-2" />
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm mb-6">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-4 w-2/3 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </>
  )
}